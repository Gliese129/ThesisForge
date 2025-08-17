// store.ts
import type { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import { Notification, type NotificationState } from './notification'
import { Article, type ArticleState } from './article'

// define your typings for the store state
export interface State {
  message: NotificationState
  article: ArticleState
}

// define injection key
const key: InjectionKey<Store<State>> = Symbol()

const store = createStore<State>({
  modules: {
    message: Notification,
    article: Article
  }
})

store.subscribe((mutation, state) => {
  // Cache specific modules to localStorage
  const modulesNeedingCache = ['outline', 'structure', 'article']
  const prefix = mutation.type.split('/')[0] as keyof State
  if (modulesNeedingCache.includes(prefix)) {
    localStorage.setItem(`vuex_${prefix}`, JSON.stringify(state[prefix]))
  }
})

export { store, key }
