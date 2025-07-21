<template>
  <v-form>
    <v-row>
      <!-- Left panel: vertical tabs + content -->
      <v-col cols="12" md="6">
        <v-card class="px-4 py-6 h-[65vh] overflow-auto">
          <v-tabs vertical v-model="activeTab" class="mb-6">
            <v-tab value="basic">Basic Info</v-tab>
            <v-tab value="extra">Extra Info</v-tab>
            <v-tab value="questions">Additional Questions</v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab">
            <!-- Basic Info -->
            <v-tabs-window-item value="basic">
              <v-card flat>
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
                    label="Target Audience (Optional)"
                    v-model="targetAudience"
                  />
                  <v-text-field clearable label="Language" v-model="language" />

                  <div class="flex items-center space-x-4">
                    <v-switch
                      v-model="hasWordCount"
                      label="Word Count"
                      color="primary"
                    />
                    <div v-if="hasWordCount" class="flex space-x-4">
                      <v-number-input
                        label="Min Count"
                        type="number"
                        v-model="minWordCount"
                        :min="0"
                        :max="maxWordCount || Infinity"
                        :step="100"
                        density="compact"
                        outlined
                      />
                      <v-number-input
                        label="Max Count"
                        type="number"
                        v-model="maxWordCount"
                        :min="minWordCount || 0"
                        :step="100"
                        density="compact"
                        outlined
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
              </v-card>
            </v-tabs-window-item>

            <!-- Extra Info -->
            <v-tabs-window-item value="extra">
              <v-card flat>
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
                    multiple
                    chips
                    rows="3"
                  />
                  <v-switch
                    v-model="needAbstract"
                    label="Need Abstract"
                    color="primary"
                  />
                </v-card-text>
              </v-card>
            </v-tabs-window-item>

            <!-- Additional Questions -->
            <v-tabs-window-item value="questions">
              <v-card flat>
                <v-card-text class="space-y-6">
                  <div
                    v-for="(q, i) in additionalQuestions"
                    :key="i"
                    class="space-y-2"
                  >
                    <div class="font-medium">Q: {{ q.question }}</div>
                    <v-textarea label="Answer" v-model="q.answer" rows="2" />
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
              </v-card>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>

      <v-divider vertical />

      <!-- Right panel: actions & suggestions -->
      <v-col cols="12" md="6">
        <v-card
          class="px-4 py-6 h-[65vh] flex flex-col overflow-auto"
          title="Update Info"
        >
          <!-- Outline actions -->
          <div class="flex flex-wrap gap-4 mb-6 justify-center">
            <v-btn color="primary" @click="copyOutlinePromptToClipboard">
              Get Prompt
            </v-btn>
            <paste-ai-response @send="updateOutlineManually" />
            <v-btn
              color="secondary"
              :loading="outlineAskBtnLoading"
              @click="updateOutline"
            >
              Ask AI
            </v-btn>
          </div>

          <v-alert v-if="completed" type="success" dense class="mt-3">
            Outline confirmed! You can move to the next step.
          </v-alert>

          <!-- Generate Structure -->
          <v-card v-if="completed" flat class="mb-6" title="Generate Structure">
            <v-card-text class="flex flex-wrap gap-4 justify-center">
              <v-btn color="primary" @click="copyStructurePromptToClipboard">
                Get Prompt
              </v-btn>
              <paste-ai-response @send="generateStructureManually" />
              <v-btn
                color="secondary"
                :loading="structureAskBtnLoading"
                @click="generateStructure"
              >
                Ask AI
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Suggestions list -->
          <div class="overflow-auto flex-1 space-y-4">
            <v-card
              v-for="s in suggestions"
              :key="s.field"
              flat
              class="p-4 border rounded"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium">{{ s.name }}</span>
                <div class="flex space-x-2">
                  <v-btn
                    color="primary"
                    size="small"
                    @click="outline[s.field] = s.to"
                  >
                    Apply
                  </v-btn>
                  <v-btn
                    color="error"
                    size="small"
                    @click="removeSuggestion(s.field)"
                  >
                    Discard
                  </v-btn>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <v-chip small>{{ s.from }}</v-chip>
                <v-text-field
                  v-model="s.to"
                  clearable
                  dense
                  hide-details
                  placeholder="Edit suggestion"
                  @input="outline[s.field] = s.to"
                />
              </div>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import ArticleOutlineApi from '@/api/outline'
import { GenerateStructureApi } from '@/api/structure'
// @ts-ignore-next-line
import PasteAiResponse from '@/components/PasteAIResponse.vue'
import type { ArticleOutlineState } from '@/store/outline'

// Use Vuetify + Tailwind utility classes, minimal custom CSS

// Tabs state
const activeTab = ref<'basic' | 'extra' | 'questions'>('basic')

// Vuex outline state
const store = useStore(key)
onMounted(() => {
  document.title = 'Create Article - Fill Info'
})

function useOutlineField<K extends keyof ArticleOutlineState>(k: K) {
  return computed({
    get: () => store.state.outline[k],
    set: (v) => store.commit('outline/setState', { [k]: v })
  })
}

const title = useOutlineField('title')
const subjectArea = useOutlineField('subjectArea')
const purpose = useOutlineField('purpose')
const targetAudience = useOutlineField('targetAudience')
const language = useOutlineField('language')
const minWordCount = useOutlineField('minWordCount')
const maxWordCount = useOutlineField('maxWordCount')
const requireReferences = useOutlineField('requireReferences')
const includeFormulas = useOutlineField('includeFormulas')
const preferredTone = useOutlineField('preferredTone')
const focusArea = useOutlineField('focusArea')
const avoidTopics = useOutlineField('avoidTopics')
const existingNotes = useOutlineField('existingNotes')
const needAbstract = useOutlineField('needAbstract')
const additionalQuestions = useOutlineField('additionalQuestions')

const outline = computed<ArticleOutlineState>(() => store.state.outline)
const completed = defineModel('completed', { type: Boolean, default: false })

const removeQuestion = (q: string) => {
  store.commit('outline/removeQuestion', q)
  return true
}

const hasWordCount = ref(false)
watch(
  hasWordCount,
  (nv) => {
    if (!nv) {
      minWordCount.value = undefined
      maxWordCount.value = undefined
    }
  },
  { immediate: true }
)

const suggestions = ref<any[]>([])
const removeSuggestion = (field: string) => {
  suggestions.value = suggestions.value.filter((i) => i.field !== field)
  return true
}

const copyOutlinePromptToClipboard = async () => {
  const data = await ArticleOutlineApi.getPrompt(outline.value)
  const prompt = data.prompt || ''
  try {
    await navigator.clipboard.writeText(prompt)
    store.commit('message/success', 'Prompt copied')
  } catch {
    store.commit('message/error', 'Failed to copy')
  }
}

const updateOutlineManually = async (text: string) => {
  if (text === 'complete') {
    store.commit('message/warning', 'Debug only')
    completed.value = true
    return
  }
  if (text) {
    const res = await ArticleOutlineApi.updateManually(text)
    const addQs = res.additionalQuestions || []
    const comp = res.completed || false
    const suggs = res.suggestions || []
    if (addQs.length) {
      store.commit('outline/addQuestions', addQs)
      store.commit('message/info', `Added ${addQs.length} questions`)
    }
    completed.value = comp
    suggestions.value = suggs
      .filter((i: any) => i[0] && i[1])
      .filter((i: any) => outline.value[i[0]] != null)
      .map((i: any) => ({
        field: i[0],
        name: i[0][0].toUpperCase() + i[0].slice(1),
        from: (outline.value as any)[i[0]],
        to: i[1]
      }))
  }
}

const outlineAskBtnLoading = ref(false)
const updateOutline = async () => {
  outlineAskBtnLoading.value = true
  const res = await ArticleOutlineApi.update(outline.value)
  const addQs = res.additionalQuestions || []
  const comp = res.completed || false
  const suggs = res.suggestions || []
  if (addQs.length) {
    store.commit('outline/addQuestions', addQs)
    store.commit('message/info', `Added ${addQs.length} questions`)
  }
  outlineAskBtnLoading.value = false
  completed.value = comp
  suggestions.value = suggs
    .filter((i: any) => i[0] && i[1])
    .filter((i: any) => outline.value[i[0]] != null)
    .map((i: any) => ({
      field: i[0],
      name: i[0][0].toUpperCase() + i[0].slice(1),
      from: (outline.value as any)[i[0]],
      to: i[1]
    }))
}

const copyStructurePromptToClipboard = async () => {
  const data = await GenerateStructureApi.getPrompt(outline.value)
  const prompt = data.prompt || ''
  try {
    await navigator.clipboard.writeText(prompt)
    store.commit('message/success', 'Prompt copied')
  } catch {
    store.commit('message/error', 'Failed to copy')
  }
}

const generateStructureManually = async (text: string) => {
  if (text) {
    const res = await GenerateStructureApi.updateManually(text)
    const { sections, summary } = res
    if (sections?.length) {
      const total = sections.reduce(
        (s: number, x: any) => s + (x.expectedWordCount || 0),
        0
      )
      store.dispatch('structure/assignOutline', outline.value)
      store.commit('structure/setWritingNote', summary)
      store.commit('structure/setExpectedWordCount', total)
      store.commit('structure/setSections', sections)
      store.commit('message/info', `Added ${sections.length} sections`)
    }
  }
}

const structureAskBtnLoading = ref(false)
const generateStructure = async () => {
  structureAskBtnLoading.value = true
  const res = await GenerateStructureApi.update(outline.value)
  const { sections, summary } = res
  if (sections?.length) {
    const total = sections.reduce(
      (s, num) => s + (num.expectedWordCount || 0),
      0
    )
    store.dispatch('structure/assignOutline', outline.value)
    store.commit('structure/setWritingNote', summary)
    store.commit('structure/setExpectedWordCount', total)
    store.commit('structure/setSections', sections)
    store.commit('message/info', `Added ${sections.length} sections`)
  }
  structureAskBtnLoading.value = false
}
</script>

<style scoped>
/* No additional CSS needed—using Tailwind and Vuetify utilities */
</style>
