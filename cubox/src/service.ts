import { showToast, Toast, getPreferenceValues } from "@raycast/api"
import got from 'got'
import type { ListItem, TagItem } from './typing'

const showTokenInvalidIssue = () => {
  showToast({
    title: 'Fetch Data Failed',
    style: Toast.Style.Failure,
    message: 'Please config your authorization token in preferences.',
  })
}

export const searchByKeyword = async (keyword: string) => {
  if (!keyword) {
    return []
  }
  const { token, site } = getPreferenceValues()
  if (!token) {
    showTokenInvalidIssue()
    return []
  }
  const { body } = await got.get<{ data: ListItem[] }>(`${site}/c/api/bookmark/search`, {
    searchParams: {
      keyword,
      page: 1,
      pageSize: 100,
    },
    responseType: 'json',
    headers: {
      authorization: token
    }
  }).catch(() => {
    showTokenInvalidIssue()
    return { body: { data: [] } }
  })
  return body.data || []
}

export const searchByTag = async (tagId: string) => {
  if (!tagId) {
    return []
  }
  const { token, site } = getPreferenceValues()
  if (!token) {
    showTokenInvalidIssue()
    return []
  }
  const { body } = await got.get<{ data: ListItem[] }>(`${site}/c/api/v2/search_engine/my`, {
    searchParams: {
      asc: false,
      page: 1,
      filters: '',
      keyword: '',
      archiving: false,
      tagId,
    },
    responseType: 'json',
    headers: {
      authorization: token
    }
  }).catch(() => {
    showTokenInvalidIssue()
    return { body: { data: [] } }
  })
  return body.data || []
}

export const searchByFulltext = async (keyword: string) => {
  if (!keyword) {
    return []
  }
  const { token, site } = getPreferenceValues()
  if (!token) {
    showTokenInvalidIssue()
    return []
  }
  const { body } = await got.get<{ data: ListItem[] }>(`${site}/c/api/search`, {
    searchParams: {
      page: 1,
      size: 1000,
      filters: '',
      keyword,
      archiving: false,
    },
    responseType: 'json',
    headers: {
      authorization: token
    }
  }).catch(() => {
    showTokenInvalidIssue()
    return { body: { data: [] } }
  })
  return body.data || []
}

export const getTags = async () => {
  const { token, site } = getPreferenceValues()
  if (!token) {
    showTokenInvalidIssue()
    return []
  }
  const { body } = await got.get<{ data: { tagList: TagItem[] } }>(`${site}/c/api/v2/tag/list`, {
    responseType: 'json',
    headers: {
      authorization: token
    }
  }).catch(() => {
    showTokenInvalidIssue()
    return { body: { data: { tagList: [] } } }
  })
  return body.data.tagList || []
}