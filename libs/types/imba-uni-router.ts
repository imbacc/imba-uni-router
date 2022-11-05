export type kv_DTYPE<T = any> = { [key: string]: T }
export type pushParams_DTYPE = { path: string; params: kv_DTYPE; query: kv_DTYPE }

export type before_DTYPE<T = any> = (to: {}, from: {}, next: Function) => T
export type after_DTYPE<T = any> = (to: {}, from?: {}) => T
