import { useState, useRef, useEffect, useMemo } from 'react'
import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api"
import type { ListItem, TagItem } from './typing'
import { debounce } from './util'
import { getTags, searchByKeyword, searchByTag, searchByFulltext } from './service'


export default function Command() {
  const [loading, setLoading] = useState<boolean>(false)
  const [list, setList] = useState<ListItem[]>([])
  const { site } = useMemo(() => getPreferenceValues(), [])
  const tagsRef = useRef<TagItem[]>([])

  useEffect(() => {
    const start = async () => {
      const groups = await getTags()
      tagsRef.current = groups
    }
    start()
  }, [])

  const onSearch = useRef(debounce(async (keyword: string) => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword) {
      setLoading(true)
      const fulltext = /^(?:\/f)\s*(.*)$/gi.exec(trimmedKeyword)
      const targetTag = /^(#\S*)\s*(.*)$/gi.exec(trimmedKeyword)
      const matchTag = targetTag && targetTag[1] !== '#' && tagsRef.current.find(tagItem => tagItem.name === targetTag[1].slice(1))
      if (matchTag) {
        const resultList = await searchByTag(matchTag.tagID, targetTag[2])
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
