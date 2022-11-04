import { useState, useRef, useEffect, useMemo } from 'react'
import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api"
import type { ListItem, TagItem } from './typing'
import { debounce } from './util'
import { getTags, searchByKeyword, searchByTag, searchByFulltext } from './service'


export default function Command() {
  const [loading, setLoading] = useState<boolean>(false)
  const [list, setList] = useState<ListItem[]>([])
  const { site } = useMemo(() => getPreferenceValues(), [])
  const groupsRef = useRef<TagItem[]>([])

  useEffect(() => {
    const start = async () => {
      const groups = await getTags()
      groupsRef.current = groups
    }
    start()
  }, [])

  const onSearch = useRef(debounce(async (keyword: string) => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      setLoading(true)
      const tagName = /^(#\S*)\s*/gi.exec(trimmedKeyword)
      const fulltext = /^(?:\/f)\s*(.*)$/gi.exec(trimmedKeyword)
      const matchGroup = tagName && tagName[1] !== '#' && groupsRef.current.find(group => group.name === tagName[1].slice(1))
      if (matchGroup) {
        const resultList = await searchByTag(matchGroup.tagID)
        setList(resultList)
      } else if (fulltext && fulltext[1]) {
        const resultList = await searchByFulltext(fulltext[1])
        setList(resultList)
      } else if (keyword) {
        const resultList = await searchByKeyword(keyword)
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
        const { userSearchEngineID, title, description, targetURL, littleIcon } = listItem
        return (
          <List.Item
            key={userSearchEngineID}
            icon={(typeof littleIcon === 'string' && littleIcon) ? littleIcon : 'list-icon.png'}
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
