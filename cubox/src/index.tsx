import { useState, useRef, useEffect, useMemo } from 'react'
import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api"
import type { ListItem, TagItem, GroupItem } from './typing'
import { debounce } from './util'
import { getGroups, getTags, searchByKeyword, searchByTag, searchByFulltext, searchByGroup } from './service'


export default function Command() {
  const [loading, setLoading] = useState<boolean>(false)
  const [list, setList] = useState<ListItem[]>([])
  const { site } = useMemo(() => getPreferenceValues(), [])
  const tagsRef = useRef<TagItem[]>([])
  const groupsRef = useRef<GroupItem[]>([])

  useEffect(() => {
    const start = async () => {
      const [tags, groups] = await Promise.allSettled([getTags(), getGroups()])
      if (tags.status === 'fulfilled') {
        tagsRef.current = tags.value
      }
      if (groups.status === 'fulfilled') {
        groupsRef.current = groups.value
      }
    }
    start()
  }, [])

  const onSearch = useRef(debounce(async (keyword: string) => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      setLoading(true)
      const fulltext = /^(?:\/f)\s+(.*)$/gi.exec(trimmedKeyword)
      const targetGroup = /^(?:\/g)\s+(.*)$/gi.exec(trimmedKeyword)
      const matchGroup = targetGroup?.[1] && groupsRef.current.find(group => group?.groupName?.toLocaleLowerCase() === targetGroup[1].toLocaleLowerCase())
      const targetTag = /^(#\S*)\s+(.*)$/gi.exec(trimmedKeyword)
      const matchTag =
        targetTag?.[1] &&
        targetTag[1] !== '#' &&
        tagsRef.current.find(tagItem => tagItem?.name?.toLowerCase() === targetTag[1]?.slice(1)?.toLowerCase())
      let resultList: ListItem[] | undefined
      if (fulltext && fulltext[1]) {
        resultList = await searchByFulltext(fulltext[1])
      } else if (matchGroup) {
        resultList = await searchByGroup(matchGroup.groupId)
      } else if (matchTag) {
        resultList = await searchByTag(matchTag.tagID, targetTag[2])
      } else if (keyword) {
        resultList = await searchByKeyword(keyword)
      }
      if (resultList) {
        setList(resultList)
      }
      setLoading(false)
    }
  }, 440))

  return (
    <List
      isLoading={loading}
      onSearchTextChange={onSearch.current}
    >
      {list.map(listItem => {
        const { userSearchEngineID, title, description, targetURL } = listItem
        return (
          <List.Item
            key={userSearchEngineID}
            // icon={(typeof littleIcon === 'string' && littleIcon) ? littleIcon : 'list-icon.png'}
            icon="list-icon.png"
            title={title}
            subtitle={description}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open in Cubox" url={`${site}/my/card?id=${userSearchEngineID}`} />
                {targetURL && (<Action.OpenInBrowser title="Open Source Page" url={targetURL} />)}
              </ActionPanel>
            }
          />
        )
      })}
    </List>
  );
}
