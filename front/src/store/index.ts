// store.ts
import type { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import { ArticleOutline, type ArticleOutlineState } from './outline'
import { Notification, type NotificationState } from './notification'

// define your typings for the store state
export interface State {
  outline: ArticleOutlineState
  message: NotificationState
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  modules: {
    outline: ArticleOutline,
    message: Notification
  }
})
