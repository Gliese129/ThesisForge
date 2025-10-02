<template>
  <v-form>
    <v-row>
      <v-col cols="12" md="7">
        <v-card class="pa-4 fill-height d-flex flex-column">
          <v-card-title class="text-h5"
            >Step 1: Define Your Article Outline</v-card-title
          >
          <v-card-subtitle
            >Fill in the details below to create a prompt for the
            AI.</v-card-subtitle
          >

          <v-tabs v-model="activeTab" color="primary" class="mb-4">
            <v-tab value="basic">Basic Info</v-tab>
            <v-tab value="extra">Style & Focus</v-tab>
            <v-tab value="questions">Additional Questions</v-tab>
          </v-tabs>

          <div class="flex-grow-1 overflow-y-auto">
            <v-tabs-window v-model="activeTab">
              <v-tabs-window-item value="basic">
                <v-card-text class="space-y-4">
                  <v-text-field clearable label="Title" v-model="title" />
                  <v-text-field
                    clearable
                    label="Subject Area"
                    v-model="subjectArea"
                  />
                  <v-text-field clearable label="Purpose" v-model="purpose" />
                  <v-text-field
                    clearable
                    label="Target Audience"
                    v-model="targetAudience"
                  />
                  <v-text-field clearable label="Language" v-model="language" />

                  <div class="flex items-center space-x-4">
                    <v-switch
                      v-model="hasWordCount"
                      label="Specify Word Count"
                      color="primary"
                    />
                    <div v-if="hasWordCount" class="flex space-x-4">
                      <v-number-input
                        label="Min"
                        v-model="minWordCount"
                        :min="0"
                        :max="maxWordCount || Infinity"
                        :step="100"
                        density="compact"
                      />
                      <v-number-input
                        label="Max"
                        v-model="maxWordCount"
                        :min="minWordCount || 0"
                        :step="100"
                        density="compact"
                      />
                    </div>
                  </div>

                  <div class="flex items-center space-x-4">
                    <v-switch
                      v-model="requireReferences"
                      label="Require References"
                      color="primary"
                    />
                    <v-switch
                      v-model="includeFormulas"
                      label="Include Formulas"
                      color="primary"
                    />
                  </div>
                </v-card-text>
              </v-tabs-window-item>

              <v-tabs-window-item value="extra">
                <v-card-text class="space-y-4">
                  <v-text-field
                    label="Preferred Tone"
                    v-model="preferredTone"
                  />
                  <v-text-field label="Focus Area" v-model="focusArea" />
                  <v-text-field label="Topics to Avoid" v-model="avoidTopics" />
                  <v-textarea
                    label="Existing Notes"
                    v-model="existingNotes"
                    rows="3"
                  />
                  <v-switch
                    v-model="needAbstract"
                    label="Need Abstract"
                    color="primary"
                  />
                </v-card-text>
              </v-tabs-window-item>

              <v-tabs-window-item value="questions">
                <v-card-text class="space-y-6">
                  <div
                    v-if="!additionalQuestions?.length"
                    class="text-center text-grey"
                  >
                    No additional questions yet.
                  </div>
                  <div
                    v-for="(q, i) in additionalQuestions"
                    :key="i"
                    class="space-y-2"
                  >
                    <div class="font-medium">Q: {{ q.question }}</div>
                    <v-textarea
                      label="Your Answer"
                      v-model="q.answer"
                      rows="2"
                    />
                    <v-btn
                      color="warning"
                      variant="outlined"
                      size="small"
                      @click="removeQuestion(q.question)"
                    >
                      Remove
                    </v-btn>
                  </div>
                </v-card-text>
              </v-tabs-window-item>
            </v-tabs-window>
          </div>

          <v-divider class="my-4"></v-divider>

          <v-card-actions class="flex-wrap justify-center gap-4">
            <v-btn
              prepend-icon="mdi-content-copy"
              @click="copyPrompt(ArticleOutlineApi.getPrompt)"
            >
              Get Prompt
            </v-btn>
            <paste-ai-response
              @send="
                (text) =>
                  handleOutlineUpdate(ArticleOutlineApi.updateManually(text))
              "
            />
            <v-btn
              color="primary"
              prepend-icon="mdi-robot"
              :loading="outlineAskBtnLoading"
              @click="handleOutlineUpdate(ArticleOutlineApi.update(article))"
            >
              Ask AI
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="pa-4 fill-height d-flex flex-column">
          <v-card-title class="text-h5">AI Suggestions</v-card-title>
          <v-card-subtitle
            >AI may suggest improvements for your outline here.</v-card-subtitle
          >
          <div class="flex-grow-1 overflow-y-auto pt-4 space-y-4">
            <div
              v-if="!suggestions.length"
              class="text-center text-grey d-flex align-center justify-center h-100"
            >
              No suggestions at the moment.
            </div>
            <v-card v-for="s in suggestions" :key="s.field" variant="outlined">
              <v-card-title class="text-body-1"
                >Suggestion for "{{ s.name }}"</v-card-title
              >
              <v-card-text>
                <v-chip size="small" color="secondary" class="mb-2"
                  >From: {{ s.from }}</v-chip
                >
                <v-text-field v-model="s.to" clearable dense label="To" />
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn size="small" @click="removeSuggestion(s.field)"
                  >Discard</v-btn
                >
                <v-btn
                  size="small"
                  color="primary"
                  @click="applySuggestion(s.field, s.to)"
                  >Apply</v-btn
                >
              </v-card-actions>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="completed">
      <v-col>
        <v-fade-transition>
          <v-card class="mt-6">
            <v-card-title class="text-h5">
              Step 2: Generate Article Structure
            </v-card-title>
            <v-card-subtitle>
              Your outline is confirmed! Now, let's generate the article
              structure.
            </v-card-subtitle>
            <v-card-text
              class="d-flex flex-wrap justify-center align-center gap-4 pa-6"
            >
              <v-btn
                prepend-icon="mdi-content-copy"
                @click="copyPrompt(GenerateStructureApi.getPrompt)"
                >Get Prompt</v-btn
              >
              <paste-ai-response
                @send="
                  (text) =>
                    handleStructureGeneration(
                      GenerateStructureApi.updateManually(text)
                    )
                "
              />
              <v-btn
                color="primary"
                prepend-icon="mdi-robot"
                :loading="structureAskBtnLoading"
                @click="
                  handleStructureGeneration(
                    GenerateStructureApi.update(article)
                  )
                "
                >Ask AI & Proceed</v-btn
              >
            </v-card-text>
          </v-card>
        </v-fade-transition>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import { type ArticleState } from '@/store/article' // Use the new unified article store
import ArticleOutlineApi from '@/api/outline'
import { GenerateStructureApi } from '@/api/structure'
// @ts-ignore-next-line
import PasteAiResponse from '@/components/PasteAIResponse.vue'

onMounted(() => {
  document.title = 'Create Article - Fill Info'
})
const emit = defineEmits(['completed'])

// --- Vuex State & Helpers ---
const store = useStore(key)
const completed = defineModel<boolean>('completed', { default: false })

// A generic helper to create computed properties linked to the article state
function useArticleField<K extends keyof ArticleState>(k: K) {
  return computed({
    get: () => store.state.article[k],
    set: (v) => store.commit('article/setState', { [k]: v })
  })
}

// All form fields now point to the single 'article' state
const title = useArticleField('title')
const subjectArea = useArticleField('subjectArea')
const purpose = useArticleField('purpose')
const targetAudience = useArticleField('targetAudience')
const language = useArticleField('language')
const minWordCount = useArticleField('minWordCount')
const maxWordCount = useArticleField('maxWordCount')
const requireReferences = useArticleField('requireReferences')
const includeFormulas = useArticleField('includeFormulas')
const preferredTone = useArticleField('preferredTone')
const focusArea = useArticleField('focusArea')
const avoidTopics = useArticleField('avoidTopics')
const existingNotes = useArticleField('existingNotes')
const needAbstract = useArticleField('needAbstract')
const additionalQuestions = useArticleField('additionalQuestions')

const article = computed<ArticleState>(() => store.state.article)

// --- Local Component State ---
const activeTab = ref<'basic' | 'extra' | 'questions'>('basic')
const hasWordCount = ref(!!(minWordCount.value || maxWordCount.value))
const suggestions = ref<any[]>([])
const outlineAskBtnLoading = ref(false)
const structureAskBtnLoading = ref(false)

// --- Logic for Word Count Switch ---
watch(hasWordCount, (isToggled) => {
  if (!isToggled) {
    minWordCount.value = undefined
    maxWordCount.value = undefined
  }
})

// --- Logic for Suggestions ---
const applySuggestion = (field: keyof ArticleState, value: any) => {
  store.commit('article/setState', { [field]: value })
  removeSuggestion(field)
}
const removeSuggestion = (field: string) => {
  suggestions.value = suggestions.value.filter((i) => i.field !== field)
}

// --- Logic for Additional Questions ---
const removeQuestion = (q: string) => {
  store.commit('article/removeQuestion', q)
}

// --- Reusable API Handlers ---

/**
 * Copies a prompt from a given API endpoint to the clipboard.
 * @param apiFn The API function that returns a prompt.
 */
const copyPrompt = async (
  apiFn: (payload: ArticleState) => Promise<{ prompt: string }>
) => {
  try {
    const data = await apiFn(article.value)
    await navigator.clipboard.writeText(data.prompt || '')
    store.commit('message/success', 'Prompt copied to clipboard!')
  } catch {
    store.commit('message/error', 'Failed to copy prompt.')
  }
}

/**
 * Processes the list of suggestions from an API response.
 * @param suggs The suggestions array from the API.
 */
const handleSuggestionProcessing = (suggs: any[]) => {
  if (!suggs || !suggs.length) {
    suggestions.value = []
    return
  }
  suggestions.value = suggs
    .filter(
      (i: any) =>
        i &&
        i[0] &&
        i[1] !== undefined &&
        article.value[i[0] as keyof ArticleState] !== undefined
    )
    .map((i: any) => ({
      field: i[0],
      name:
        i[0].charAt(0).toUpperCase() +
        i[0]
          .slice(1)
          .replace(/([A-Z])/g, ' $1')
          .trim(), // Format camelCase to Title Case
      from: (article.value as any)[i[0]],
      to: i[1]
    }))
}

/**
 * Handles the entire process of updating the outline from an API call.
 * @param apiPromise A promise returned from an ArticleOutlineApi call.
 */
const handleOutlineUpdate = async (apiPromise: Promise<any>) => {
  outlineAskBtnLoading.value = true
  try {
    const res = await apiPromise
    if (res.additionalQuestions?.length) {
      store.commit('article/setQuestions', res.additionalQuestions)
      store.commit(
        'message/info',
        `Added ${res.additionalQuestions.length} new question(s).`
      )
    } else {
      store.commit('article/setQuestions', [])
    }
    completed.value = res.completed || false
    handleSuggestionProcessing(res.suggestions || [])
  } catch (error) {
    store.commit('message/error', 'An error occurred while asking AI.')
    console.error(error)
  } finally {
    outlineAskBtnLoading.value = false
  }
}

/**
 * Handles the entire process of generating the article structure from an API call.
 * @param apiPromise A promise returned from a GenerateStructureApi call.
 */
const handleStructureGeneration = async (apiPromise: Promise<any>) => {
  structureAskBtnLoading.value = true
  try {
    const res = await apiPromise
    if (res.sections?.length) {
      const totalWordCount = res.sections.reduce(
        (sum: number, section: any) => sum + (section.expectedWordCount || 0),
        0
      )

      // With the unified store, we can update everything in one go!
      store.commit('article/setState', {
        qaSummary: res.qaSummary || '',
        maxWordCount: totalWordCount || maxWordCount.value, // Update max word count with the sum from sections
        sections: res.sections
      })
      store.commit(
        'message/success',
        `Generated ${res.sections.length} sections! You can proceed.`
      )
      emit('completed')
    }
  } catch (error) {
    store.commit('message/error', 'Failed to generate structure.')
    console.error(error)
  } finally {
    structureAskBtnLoading.value = false
  }
}
</script>
