<template>
  <v-form>
    <v-row>
      <v-col cols="12" md="6" class="overflow-y-scroll question-container">
        <v-expansion-panels multiple variant="accordion">
          <v-expansion-panel title="Basic Information" class="mb-4">
            <v-expansion-panel-text>
              <v-text-field clearable label="Title" v-model="outline.title" />
              <v-text-field
                clearable
                label="Subject Area"
                v-model="outline.subjectArea"
              />
              <v-text-field
                clearable
                label="Purpose"
                v-model="outline.purpose"
              />
              <v-text-field
                clearable
                label="Target Audience(Optional)"
                v-model="outline.targetAudience"
              />
              <v-text-field
                clearable
                label="Language"
                v-model="outline.language"
              />
              <div class="d-flex align-center mx-auto">
                <v-switch
                  v-model="hasWordCount"
                  label="Word Count"
                  class="ml-2"
                  color="primary"
                />
              </div>
              <v-row v-if="hasWordCount">
                <v-col cols="6">
                  <v-number-input
                    label="Min Word Count"
                    v-model="outline.minWordCount"
                    :min="0"
                    :max="outline.maxWordCount || Infinity"
                    :step="100"
                  />
                </v-col>
                <v-col cols="6">
                  <v-number-input
                    label="Max Word Count"
                    v-model="outline.maxWordCount"
                    :min="outline.minWordCount || 0"
                    :step="100"
                  />
                </v-col>
              </v-row>
              <v-row class="d-flex align-center mx-auto w-full">
                <v-switch
                  v-model="outline.requireReferences"
                  label="Require References"
                  class="ml-2"
                  color="primary"
                />
                <v-divider vertical class="mx-2"></v-divider>
                <v-switch
                  v-model="outline.includeFormulas"
                  label="Include Formulas"
                  class="ml-2"
                  color="primary"
                />
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Extra Information(Optional)" class="mb-4">
            <v-expansion-panel-text>
              <v-text-field
                label="Preferred Tone"
                v-model="outline.preferredTone"
              />
              <v-text-field label="Focus Area" v-model="outline.focusArea" />
              <v-text-field
                label="Topics to Avoid"
                v-model="outline.avoidTopics"
              />
              <v-textarea
                label="Existing Notes"
                v-model="outline.existingNotes"
                multiple
                chips
              />
              <v-switch
                v-model="outline.needAbstract"
                label="Need Abstract"
                class="ml-2"
                color="primary"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel
            title="Additional Questions"
            class="mb-4"
            v-show="
              outline.additionalQuestions &&
              outline.additionalQuestions.length > 0
            "
          >
            <v-expansion-panel-text
              v-for="(question, index) in outline.additionalQuestions || []"
              :key="index"
            >
              <div>Q: {{ question.question }}</div>
              <v-textarea
                label="Answer"
                v-model="question.answer"
                class="mb-2"
              />
              <v-btn
                color="warning"
                variant="outlined"
                @click="removeQuestion(question.question)"
                >Remove</v-btn
              >
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-divider vertical> </v-divider>

      <v-col cols="12" md="6">
        <v-row class="my-4">
          <v-btn-group class="mx-auto" density="compact" title="Manual">
            <v-btn color="primary" @click="copyPromptToClipboard">
              Get Prompt
            </v-btn>
            <v-dialog max-width="500">
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn color="secondary" v-bind="activatorProps">
                  Paste Response
                </v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card title="Please Paste Response From AI">
                  <v-card-text>
                    <v-textarea
                      v-model="responseFromAI"
                      label="Response from AI"
                      rows="10"
                      auto-grow
                      outlined
                      clearable
                      max-rows="10"
                      class="mt-2"
                    >
                    </v-textarea>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      text="Paste From Clipboard"
                      @click="pasteResponseFromClipboard"
                    ></v-btn>
                    <v-btn
                      text="Send"
                      @click="
                        //@ts-ignore-next-line
                        updateOutlineManually() && (isActive.value = false)
                      "
                    ></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </v-btn-group>
          <v-btn-group class="mx-auto" density="compact" title="AI">
            <v-btn color="secondary" disabled> Ask AI </v-btn>
          </v-btn-group>
        </v-row>
        <v-row class="px-2 question-container overflow-y-scroll flex">
          <v-card
            v-for="suggestion in suggestions"
            class="mb-4 suggestion-card"
            :key="suggestion.field"
          >
            <v-card-title class="d-flex align-center">
              <span>{{ suggestion.name }}</span>
              <v-spacer></v-spacer>
              <v-btn-group class="ml-auto" density="compact" variant="text">
                <v-btn
                  color="primary"
                  @click="
                    removeSuggestion(suggestion.field) &&
                    //@ts-ignore-next-line
                    (outline[suggestion.field] = suggestion.to)
                  "
                >
                  Apply
                </v-btn>
                <v-btn
                  color="error"
                  @click="removeSuggestion(suggestion.field)"
                >
                  Discard
                </v-btn>
              </v-btn-group>
            </v-card-title>
            <v-card-text>
              <v-chip>{{ suggestion.from }}</v-chip>
              ->
              <v-text-field
                v-model="suggestion.to"
                clearable
                label="Suggestion"
                class="mt-2"
                @input="
                  //@ts-ignore-next-line
                  outline[suggestion.field] = suggestion.to
                "
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import ArticleApi from '@/api/article'

const store = useStore(key)
const outline = computed({
  get: () => store.state.outline,
  set: (value) => {
    store.commit('outline/setState', value)
  }
})
const completed = defineModel('completed', {
  type: Boolean,
  default: false
})

const removeQuestion = (question: string) => {
  store.commit('outline/removeQuestion', question)
  return true
}

const hasWordCount = ref(false)
watch(
  hasWordCount,
  (newValue) => {
    if (!newValue) {
      outline.value.minWordCount = undefined
      outline.value.maxWordCount = undefined
    }
  },
  { immediate: true }
)

const showStructure = ref(false)
const suggestions = ref<
  {
    field: string
    name: string
    from: string | number | boolean | null | undefined
    to: string | number | boolean | null | undefined
  }[]
>([] as any)

const removeSuggestion = (field: string) => {
  suggestions.value = suggestions.value.filter((item) => item.field !== field)
  return true
}
const copyPromptToClipboard = async () => {
  let data = await ArticleApi.getOutlinePrompt(outline.value)
  console.log('Prompt data:', data)
  let prompt = data['prompt'] || ''
  try {
    await navigator.clipboard.writeText(prompt)
    store.commit('message/success', 'Prompt copied to clipboard')
  } catch (error) {
    store.commit('message/error', 'Failed to copy prompt')
  }
}

const responseFromAI = ref('')
const pasteResponseFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    responseFromAI.value = text
    store.commit('message/success', 'Response pasted from clipboard')
  } catch (error) {
    store.commit('message/error', 'Failed to paste response')
  }
}
const updateOutlineManually = async () => {
  if (responseFromAI.value) {
    let response = await ArticleApi.updateOutlineManually(responseFromAI.value)
    let additionalQuestions = response['additional_questions'] || []
    let completed_ = response['completed'] || false
    let suggestions_ = response['suggestions'] || []

    if (additionalQuestions && additionalQuestions.length > 0) {
      store.commit('outline/addQuestions', additionalQuestions)
      store.commit(
        'message/info',
        `Added ${additionalQuestions.length} additional questions`
      )
    }
    completed.value = completed_
    suggestions.value = suggestions_
      .filter((item: any) => item[0] && item[1]) // Filter out empty suggestions
      .filter((item: [string, string]) => {
        const key = item[0] as keyof typeof outline.value
        return outline.value[key] !== undefined && outline.value[key] !== null
      })
      .map((item: [string, string]) => {
        const key = item[0] as keyof typeof outline.value
        return {
          field: item[0],
          name: item[0][0].toUpperCase() + item[0].slice(1),
          from: outline.value[key],
          to: item[1]
        }
      })
  }
}
</script>

<style scoped>
.question-container {
  max-height: 65vh;
}
.suggestion-card {
  width: 100%;
}
</style>
