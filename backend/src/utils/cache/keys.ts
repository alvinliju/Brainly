// lib/cache/keys.ts
export enum CachePrefix {
    SPACE = 'space',
    USER = 'user',
    LINK = 'link'
  }
  
  export function generateKey(
    prefix: CachePrefix,
    userId: string,
    identifier: string
  ): string {
    return `${prefix}:${userId}:${identifier}`;
  }