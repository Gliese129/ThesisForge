// store/article.ts
export interface Comment {
  id: string // 唯一ID
  user?: string // 评论者 optional
  text: string // 评论内容
  from: number // 在文档中的起始位置
  to: number // 在文档中的结束位置
}

/**
 * 定义文章中每个章节的结构。
 * 增加了 `id` 以便在 v-for 中作为 key，并增加了 `content` 为第三步做准备。
 */
export interface ArticleSection {
  title: string
  description: string
  expectedWordCount?: number
  note?: string
  content?: string
  comments?: Comment[] // 增加评论功能
  summary?: string
}

/**
 * 定义完整的、统一的文章状态。
 * 这是 outline 和 structure 的结合体，是唯一的数据源。
 */
export interface ArticleState {
  // --- 来自原 outline.ts 的字段 ---
  // 基本属性
  title: string
  subjectArea: string
  purpose: string
  targetAudience: string
  language: string
  minWordCount?: number
  maxWordCount?: number
  requireReferences: boolean
  includeFormulas: boolean
  // 风格和重点
  preferredTone: string
  focusArea?: string
  avoidTopics?: string
  existingNotes?: string
  needAbstract: boolean
  // 额外问题
  additionalQuestions: {
    question: string
    answer: string
  }[]

  // --- 来自原 structure.ts 的字段 ---
  /**
   * AI 生成的写作指导或摘要
   */
  qaSummary?: string
  /**
   * 文章的章节结构
   */
  sections: ArticleSection[]
}

/**
 * 模块化的 Article Store
 */
export const Article = {
  namespaced: true,
  state: (): ArticleState => ({
    // --- 初始状态 ---
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
    avoidTopics: '',
    existingNotes: '',
    needAbstract: false,
    additionalQuestions: [],
    qaSummary: '',
    sections: []
  }),
  mutations: {
    /**
     * 通用的状态更新方法，可以更新任意字段。
     */
    setState(state: ArticleState, payload: Partial<ArticleState>) {
      Object.assign(state, payload)
    },

    // --- 管理额外问题的 Mutations ---
    addQuestions(state: ArticleState, questions: string[]) {
      state.additionalQuestions ??= []
      const existingQuestions = new Set(
        state.additionalQuestions.map((q) => q.question)
      )
      const newQuestions = questions.filter((q) => !existingQuestions.has(q))

      newQuestions.forEach((question) => {
        state.additionalQuestions.unshift({ question, answer: '' })
      })
    },
    removeQuestion(state: ArticleState, questionToRemove: string) {
      if (!state.additionalQuestions) return
      state.additionalQuestions = state.additionalQuestions.filter(
        (q) => q.question !== questionToRemove
      )
    },
    setQuestions(state: ArticleState, questions: string[]) {
      state.additionalQuestions ??= []
      state.additionalQuestions = questions.map((q) => ({
        question: q,
        answer: ''
      }))
    },

    // --- 管理文章结构的 Mutations ---
    setSections(state: ArticleState, sections: any[]) {
      state.sections = sections.map((section, index) => ({
        id: section.id || Date.now() + index, // 确保每个 section 都有唯一ID
        title: section.title || '',
        description: section.description || '',
        expectedWordCount: section.expectedWordCount,
        note: section.note || '',
        content: section.content || '' // 保留已有的内容
      }))
    },
    updateSectionContent(
      state: ArticleState,
      payload: { index: number; content: string; summary?: string }
    ) {
      const { index, content } = payload
      if (index >= 0 && index < state.sections.length) {
        state.sections[index].content = content
        if (payload.summary !== undefined) {
          state.sections[index].summary = payload.summary
        }
      }
    },
    /**
     * 重置整个文章状态到初始值。
     */
    reset(state: ArticleState) {
      Object.assign(state, {
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
        avoidTopics: '',
        existingNotes: '',
        needAbstract: false,
        additionalQuestions: [],
        qaSummary: '',
        sections: []
      })
    }
  },
  actions: {
    /**
     * 根据字符串动态修改状态字段，并进行类型转换。
     */
    autoModifyFields(
      { commit, state }: { commit: any; state: ArticleState },
      payload: { name: string; value: string }
    ) {
      const key = payload.name as keyof ArticleState
      const rawValue = payload.value

      if (key in state) {
        const targetType = typeof state[key]

        if (targetType === 'boolean') {
          const lowerValue = rawValue.toLowerCase()
          const boolValue =
            lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'
          commit('setState', { [key]: boolValue })
        } else if (targetType === 'number') {
          const numValue = parseInt(rawValue, 10)
          if (!isNaN(numValue)) {
            commit('setState', { [key]: numValue })
          }
        } else {
          commit('setState', { [key]: rawValue })
        }
      }
    },

    updateSectionContent(
      { commit }: { commit: any },
      payload: { index: number; content: string }
    ) {
      commit('updateSectionContent', payload)
    },

    /**
     * 从 localStorage 恢复整个文章状态。
     * 现在只操作一个 'vuex_article' 项。
     */
    restoreFromLocalStorage({ commit }: { commit: any }) {
      const cachedData = localStorage.getItem('vuex_article')
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData)
          commit('setState', data)
        } catch (e) {
          console.error('Failed to parse article state from localStorage', e)
        }
      }
    }
  }
}
