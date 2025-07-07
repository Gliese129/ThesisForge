// store.ts
import type { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

import { ArticleOutline, type ArticleOutlineState } from './outline'

// define your typings for the store state
export interface State {
  outline: ArticleOutlineState;
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  modules: {
    outline: ArticleOutline
  },
})