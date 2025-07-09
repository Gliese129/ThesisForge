export interface ArticleOutlineState {
  // basic properties
  title: string
  subjectArea: string
  purpose: string
  targetAudience: string
  language: string
  minWordCount?: number
  maxWordCount?: number
  requireReferences: boolean
  includeFormulas: boolean
  // style and focus
  preferredTone: string
  focusArea?: string
  avoidTopics?: string[]
  existingNotes?: string[]
  needAbstract: boolean
  // extra questions (question, answer)
  additionalQuestions?: {
    question: string
    answer: string
  }[]
}

export const ArticleOutline = {
  namespaced: true,
  state: () =>
    ({
      title: '',
      subjectArea: '',
      purpose: '',
      targetAudience: '',
      language: 'English',
      minWordCount: undefined,
      maxWordCount: undefined,
      requireReferences: false,
      includeFormulas: false,
      preferredTone: 'Formal',
      focusArea: '',
      avoidTopics: [],
      existingNotes: [],
      needAbstract: false,
      additionalQuestions: [] as { question: string; answer: string }[]
    }) as ArticleOutlineState,
  mutations: {
    setState(
      state: ArticleOutlineState,
      payload: Partial<ArticleOutlineState>
    ) {
      Object.assign(state, payload)
    },
    addQuestions(state: ArticleOutlineState, questions: string[]) {
      state.additionalQuestions ??= []
      questions.forEach((question) => {
        // add to front
        state.additionalQuestions!.unshift({ question, answer: '' })
      })
    },
    removeQuestion(state: ArticleOutlineState, question: string) {
      state.additionalQuestions ??= []
      const index = state.additionalQuestions.findIndex(
        (q) => q.question === question
      )
      if (index !== -1) {
        state.additionalQuestions.splice(index, 1)
      }
    },
    setQuestions(
      state: ArticleOutlineState,
      questions: { question: string; answer: string }[]
    ) {
      state.additionalQuestions = questions
    }
  }
}
