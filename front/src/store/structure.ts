import type { ArticleContextState } from './article'
import type { ArticleOutlineState } from './outline'

export interface StructureState {
  // global properties
  outline: ArticleContextState
  // structure-specific properties
  sections: {
    title: string
    description: string
    expectedWordCount?: number
    note: string
  }[]
}

export const Structure = {
  namespaced: true,
  state: () =>
    ({
      outline: {
        title: '',
        subjectArea: '',
        language: '',
        expectedWordCount: undefined,
        requireReferences: false,
        includeFormulas: false,
        writingNote: ''
      },
      sections: []
    }) as StructureState,
  mutations: {
    setOutline(state: StructureState, payload: Partial<ArticleContextState>) {
      let outlineKeys = Object.keys(
        state.outline
      ) as (keyof ArticleContextState)[]
      let filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(
          ([key, value]) =>
            outlineKeys.includes(key as keyof ArticleContextState) &&
            value !== undefined &&
            value !== null &&
            value !== ''
        )
      ) as Partial<ArticleContextState>
      // Update only the properties that are defined in the payload
      state.outline = {
        ...state.outline,
        ...filteredPayload
      }
    },
    setExpectedWordCount(
      state: StructureState,
      expectedWordCount: number | undefined
    ) {
      state.outline.expectedWordCount = expectedWordCount
    },
    setWritingNote(state: StructureState, writingNote: string | undefined) {
      state.outline.writingNote = writingNote || ''
    },
    setSections(state: StructureState, sections: any[]) {
      state.sections = sections.map((section) => ({
        title: section.title,
        description: section.description,
        expectedWordCount: section.expectedWordCount,
        note: section.note || ''
      }))
    }
  },
  actions: {
    assignOutline(
      { commit }: { commit: any },
      payload: Partial<ArticleOutlineState>
    ) {
      commit('setOutline', {
        title: payload.title || '',
        subjectArea: payload.subjectArea || '',
        language: payload.language || '',
        requireReferences: payload.requireReferences ?? false,
        includeFormulas: payload.includeFormulas ?? false
      })
    },
    restoreFromLocalStorage({ commit }: { commit: any }) {
      const cachedData = localStorage.getItem('vuex_structure')
      if (cachedData) {
        const data: Partial<StructureState> = JSON.parse(cachedData)
        commit('setOutline', data.outline || {})
        commit('setSections', data.sections || [])
      }
    }
  }
}
