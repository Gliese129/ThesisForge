export interface ArticleContextState {
  // global properties
  title: string
  subjectArea: string
  language: string
  expectedWordCount?: number
  requireReferences: boolean
  includeFormulas: boolean
  // instead of multiple loose fields
  writingNote?: string
  // referenceList?: ReferenceItem[]
  // glossary?: GlossaryItem[]
}

export interface ArticleStructureState {
  outline: ArticleContextState
  // other article-specific properties can be added here
  // e.g., content, status, etc.
  sections?: {
    title: string
    content: string
    wordCount?: number
  }[]
}

export const ArticleStructure = {
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
    }) as ArticleStructureState,
  mutations: {
    setOutline(
      state: ArticleStructureState,
      payload: Partial<ArticleContextState>
    ) {
      state.outline = {
        title: payload.title || state.outline.title,
        subjectArea: payload.subjectArea || state.outline.subjectArea,
        language: payload.language || state.outline.language,
        expectedWordCount:
          payload.expectedWordCount || state.outline.expectedWordCount,
        requireReferences:
          payload.requireReferences ?? state.outline.requireReferences,
        includeFormulas:
          payload.includeFormulas ?? state.outline.includeFormulas,
        writingNote: payload.writingNote || state.outline.writingNote
      }
    }
  },
  actions: {}
}
