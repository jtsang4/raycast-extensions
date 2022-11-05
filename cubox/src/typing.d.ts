export interface Preferences {
  token: string
}

export interface Tag {
  tagID: string
  name: string
  rank: number
  updateTime: string
  parentId: any
}

export interface ListItem {
  userSearchEngineID: string
  title: string
  description: string
  targetURL: string
  resourceURL: string
  homeURL: string
  archiveName: string
  content: string
  articleName: string
  articleWordCount: number
  byline: any
  cover: string
  articleURL: string
  littleIcon: any
  archiving: boolean
  starTarget: boolean
  hasMark: boolean
  isRead: boolean
  markCount: number
  tags: Tag[]
  allTags: any[]
  marks: any[]
  groupId: string
  groupName: string
  createTime: string
  updateTime: string
  status: any
  finished: boolean
  inBlackOrWhiteList: boolean
  type: number
}

export interface TagItem {
  tagID: string
  name: string
  rank: number
  createTime: string
  updateTime: string
  state: any
  bookmarkCount: number
  parentId: string
}

export interface GroupItem {
  groupId: string
  groupName: string
  index: number
  coverContent: any
  coverType: any
  coverAdaptive: any
  archiving: boolean
  searchEngines: any[]
  size: number
  status: any
  updateTime: string
  parentGroupId: string
}
