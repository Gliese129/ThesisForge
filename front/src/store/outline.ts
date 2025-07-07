export interface ArticleOutlineState {
    // basic properties
    title: string;
    subjectArea: string;
    purpose: string;
    targetAudience: string;
    language: string;
    minWordCount?: number;
    maxWordCount?: number;
    requireReferences: boolean;
    includeFormulas: boolean;
    // style and focus
    preferredTone: string;
    focusArea?: string;
    avoidTopics?: string[];
    existingNotes?: string[];
    needAbstract: boolean;
    // extra questions (question, answer)
    additionalQuestions?: {
        question: string;
        answer: string;
    }[];
}

export const ArticleOutline = {
    state: () => ({
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
        additionalQuestions: [] as { question: string; answer: string }[],
    } as ArticleOutlineState),
    mutations: {
        setState(state: ArticleOutlineState, payload: Partial<ArticleOutlineState>) {
            Object.assign(state, payload);
        },
        addQuestions(state: ArticleOutlineState, questions: { question: string; answer: string }[]) {
            state.additionalQuestions ??= [];
            state.additionalQuestions.push(...questions);
        },
        setQuestions(state: ArticleOutlineState, questions: { question: string; answer: string }[]) {
            state.additionalQuestions = questions;
        },
    }
}
