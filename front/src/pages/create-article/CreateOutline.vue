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
              <v-text-field
                label="Question"
                v-model="question.question"
                class="mb-2"
                readonly
              />
              <v-textarea
                label="Answer"
                v-model="question.answer"
                class="mb-2"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-divider vertical> </v-divider>

      <v-col cols="12" md="6"> </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'

const store = useStore(key)
const outline = computed({
  get: () => store.state.outline,
  set: (value) => {
    store.commit('outline/setState', value)
  }
})

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
</script>

<style scoped>
.question-container {
  max-height: 65vh;
}
</style>
