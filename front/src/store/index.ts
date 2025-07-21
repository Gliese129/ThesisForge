// store.ts
import type { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import { ArticleOutline, type ArticleOutlineState } from './outline'
import { Notification, type NotificationState } from './notification'
import { Structure, type StructureState } from './structure'

// define your typings for the store state
export interface State {
  outline: ArticleOutlineState
  message: NotificationState
  structure: StructureState
}

// define injection key
const key: InjectionKey<Store<State>> = Symbol()

const store = createStore<State>({
  modules: {
    outline: ArticleOutline,
    message: Notification,
    structure: Structure
  }
})

store.subscribe((mutation, state) => {
  // Cache specific modules to localStorage
  const modulesNeedingCache = ['outline', 'structure']
  const prefix = mutation.type.split('/')[0] as keyof State
  if (modulesNeedingCache.includes(prefix)) {
    localStorage.setItem(`vuex_${prefix}`, JSON.stringify(state[prefix]))
  }
})

export { store, key }
