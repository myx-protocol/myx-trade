export enum LoginChannelEnum {
  WALLET = 'WALLET',
  SOCIAL = 'SOCIAL',
}

export type LoginChannel = (typeof LoginChannelEnum)[keyof typeof LoginChannelEnum]

export enum RecentLoginTypeEnum {
  Email = 'email',
}

export type RecentLoginType = (typeof RecentLoginTypeEnum)[keyof typeof RecentLoginTypeEnum]
