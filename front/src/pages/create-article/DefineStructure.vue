<template>
  <v-row class="fill-height">
    <v-col cols="12" md="3">
      <v-card class="fill-height d-flex flex-column">
        <v-card-title>Sections</v-card-title>
        <v-divider />
        <div class="flex-grow-1 overflow-y-auto">
          <draggable
            v-model="sections"
            tag="v-list"
            item-key="index"
            handle=".drag-handle"
          >
            <template #item="{ element, index }">
              <v-list-item
                :key="index"
                @click="editingSectionIndex = index"
                :active="editingSectionIndex === index"
                class="pr-0"
              >
                <template #prepend>
                  <v-icon class="drag-handle mr-2"
                    >mdi-drag-horizontal-variant</v-icon
                  >
                </template>
                <v-list-item-title class="font-weight-medium text-wrap">
                  {{ index + 1 }}. {{ element.title || 'Untitled Section' }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </draggable>
        </div>
        <v-divider />
        <v-card-actions>
          <v-btn block color="primary" variant="text" @click="addSection">
            <v-icon left>mdi-plus</v-icon>
            Add New Section
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

    <v-col cols="12" md="5">
      <v-card class="fill-height">
        <div v-if="editingSection" class="d-flex flex-column h-100">
          <v-card-title class="text-h6">
            Editing Section {{ editingSectionIndex + 1 }}
          </v-card-title>
          <v-divider />
          <v-card-text class="flex-grow-1 overflow-y-auto space-y-4">
            <v-text-field
              v-model="editingSection.title"
              label="Section Title"
              outlined
              dense
            />
            <v-textarea
              v-model="editingSection.description"
              label="Description"
              outlined
              dense
              rows="5"
            />
            <v-number-input
              v-model="editingSection.expectedWordCount"
              label="Expected Word Count"
              outlined
              dense
              :step="50"
            />
            <v-textarea
              v-model="editingSection.note"
              label="Author Note"
              outlined
              dense
              rows="3"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn color="error" variant="text" @click="deleteSection"
              >Delete Section</v-btn
            >
          </v-card-actions>
        </div>
        <div
          v-else
          class="d-flex align-center justify-center fill-height text-center text-grey"
        >
          <div>
            <v-icon size="50">mdi-cursor-default-click-outline</v-icon>
            <p>Select a section on the left to edit it.</p>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <div class="space-y-4">
        <v-card>
          <v-card-title>AI Toolkit</v-card-title>
          <v-card-text class="d-flex flex-wrap justify-center gap-2">
            <v-btn prepend-icon="mdi-content-copy" @click="copyPrompt"
              >Get Prompt</v-btn
            >
            <paste-ai-response
              @send="
                (text) =>
                  handleStructureUpdate(UpdateStructureApi.updateManually(text))
              "
            />
            <v-btn
              color="primary"
              prepend-icon="mdi-robot"
              :loading="structureAskBtnLoading"
              @click="askAIForUpdates"
              >Ask AI</v-btn
            >
          </v-card-text>
        </v-card>

        <v-expand-transition>
          <div v-if="newSections.length > 0">
            <v-card>
              <v-card-title>AI Suggestions</v-card-title>
              <v-list class="overflow-y-auto" max-height="300">
                <v-list-item
                  v-for="(section, index) in newSections"
                  :key="index"
                >
                  <v-list-item-title class="font-weight-medium">{{
                    section.title
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    section.description
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-divider />
              <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="newSections = []">Discard</v-btn>
                <v-btn color="primary" @click="applyNewSections"
                  >Apply Suggestions</v-btn
                >
              </v-card-actions>
            </v-card>
          </div>
        </v-expand-transition>

        <v-card>
          <v-card-title>QA Summary</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="qaSummary"
              label="AI-generated summary based on Q&A"
              outlined
              rows="4"
            />
          </v-card-text>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import type { ArticleSection, ArticleState } from '@/store/article'
import { UpdateStructureApi } from '@/api/structure'
import PasteAiResponse from '@/components/PasteAIResponse.vue'

// --- Vuex and State Management ---
const store = useStore(key)
const emit = defineEmits(['completed'])

const sections = computed<ArticleSection[]>({
  get: () => store.state.article.sections,
  set: (value) => store.commit('article/setState', { sections: value })
})

const qaSummary = computed<string>({
  get: () => store.state.article.qaSummary || '', // UI model for the QA summary
  set: (value) => store.commit('article/setState', { qaSummary: value }) // It updates 'writingNote' in the store
})

const articleState = computed<ArticleState>(() => store.state.article)

// Local state for UI
const editingSectionIndex = ref<number>(-1)
const editingSection = computed(() =>
  editingSectionIndex.value >= 0
    ? sections.value[editingSectionIndex.value]
    : null
)
const newSections = ref<any[]>([])
const structureAskBtnLoading = ref(false)

// --- Section CRUD Logic ---
const deleteSection = () => {
  if (editingSectionIndex.value === -1) return
  sections.value.splice(editingSectionIndex.value, 1)
  store.commit('message/info', 'Section deleted')
  if (editingSectionIndex.value >= sections.value.length) {
    editingSectionIndex.value = sections.value.length - 1
  }
}

const addSection = () => {
  const newSection: ArticleSection = {
    // ID is no longer needed
    title: 'Untitled Section',
    description: '',
    expectedWordCount: 200,
    note: ''
  }
  const insertAt = sections.value.length
  sections.value.splice(insertAt, 0, newSection)
  editingSectionIndex.value = insertAt
  store.commit('message/info', 'New section added')
}

const applyNewSections = () => {
  if (newSections.value.length === 0) return
  const existingTitles = new Set(sections.value.map((s) => s.title))
  const trulyNewSections = newSections.value.filter(
    (ns) => !existingTitles.has(ns.title)
  )

  store.commit('article/setState', {
    sections: [...sections.value, ...trulyNewSections]
  })

  store.commit(
    'message/success',
    `${trulyNewSections.length} new sections applied`
  )
  newSections.value = []
}

// --- API Interaction Logic ---

/**
 * Builds the payload for the API, including a comprehensive outline object.
 */
const buildApiPayload = () => {
  // Create a copy of the article state to avoid modifying it directly
  const outlinePayload = { ...articleState.value }

  // As per requirement, remove fields that should not be sent
  delete (outlinePayload as Partial<ArticleState>).additionalQuestions
  delete (outlinePayload as Partial<ArticleState>).sections

  return {
    outline: outlinePayload,
    // Filter out empty/untitled sections before sending
    sections: sections.value.filter(
      (s) => s.title && s.title.trim() !== 'Untitled Section'
    )
  }
}

const copyPrompt = async () => {
  try {
    const data = await UpdateStructureApi.getPrompt(buildApiPayload())
    await navigator.clipboard.writeText(data.prompt || '')
    store.commit('message/success', 'Prompt copied!')
  } catch (error) {
    store.commit('message/error', 'Failed to copy prompt')
    console.error(error)
  }
}

/**
 * Single handler for processing API responses for structure updates.
 */
const handleStructureUpdate = async (apiPromise: Promise<any>) => {
  structureAskBtnLoading.value = true
  try {
    const response = await apiPromise

    if (response.completed) {
      store.commit('message/success', 'Structure confirmed!')
      emit('completed')
      return
    }

    if (response.sections?.length) {
      newSections.value = response.sections
    }

    if (typeof response.qaSummary === 'string') {
      store.commit('article/setState', { writingNote: response.qaSummary })
    }
  } catch (error) {
    store.commit(
      'message/error',
      'An error occurred while updating the structure.'
    )
    console.error(error)
  } finally {
    structureAskBtnLoading.value = false
  }
}

const askAIForUpdates = () => {
  handleStructureUpdate(UpdateStructureApi.update(buildApiPayload()))
}
</script>

<style scoped>
.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}
.fill-height {
  height: 100%;
}
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
