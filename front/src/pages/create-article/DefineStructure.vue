<template>
  <v-row>
    <v-col cols="3">
      <draggable v-model="sections" tag="transition-group" item-key="id">
        <template #item="{ element, index }">
          <v-list-item
            :key="element.id"
            class="d-flex align-center"
            prepend-icon="mdi-drag"
            @click="editingSectionIndex = index"
          >
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">
                {{ index + 1 }}. {{ element.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </draggable>
    </v-col>
    <v-col cols="4">
      <v-card>
        <v-card-title class="text-h6">
          {{
            editingSectionIndex >= 0
              ? `Section ${editingSectionIndex + 1}`
              : 'Nothing Selected'
          }}
        </v-card-title>
        <v-card-text v-if="editingSectionIndex >= 0">
          <v-text-field
            v-model="sections[editingSectionIndex].title"
            label="Section Title"
            outlined
            dense
          ></v-text-field>
          <v-textarea
            v-model="sections[editingSectionIndex].description"
            label="Description"
            outlined
            dense
            rows="3"
          ></v-textarea>
          <v-number-input
            v-model="sections[editingSectionIndex].expectedWordCount"
            label="Expected Word Count"
            outlined
            dense
            :step="100"
          ></v-number-input>
          <v-textarea
            v-model="sections[editingSectionIndex].note"
            label="Writing Note"
            outlined
            dense
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            @click="deleteSection"
            :disabled="editingSectionIndex < 0"
          >
            Delete Section
          </v-btn>
          <v-btn
            color="info"
            @click="appendSection"
            :disabled="editingSectionIndex < 0"
          >
            Append Section
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="5">
      <v-row class="w-full">
        <v-card title="Update Structure" class="w-full mx-auto px-3 pb-2">
          <v-btn-group class="mx-auto" density="compact" title="Manual">
            <v-btn color="primary" @click="copyStructurePromptToClipboard">
              Get Prompt
            </v-btn>
            <paste-ai-response
              @send="generateStructureManually"
            ></paste-ai-response>
          </v-btn-group>
          <v-btn-group class="mx-auto" density="compact">
            <v-btn
              color="secondary"
              @click="generateStructure"
              :loading="structureAskBtnLoading"
            >
              Ask AI
            </v-btn>
          </v-btn-group>
        </v-card>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import PasteAiResponse from '@/components/PasteAIResponse.vue'
import { GenerateStructureApi } from '@/api/structure'

const store = useStore(key)

const sections = computed({
  get: () => store.state.structure.sections,
  set: (value) => {
    store.commit('structure/setSections', value)
  }
})
const outline = computed({
  get: () => store.state.structure.outline,
  set: (value) => {
    store.commit('structure/setOutline', value)
  }
})
const editingSectionIndex = ref(-1)

const deleteSection = () => {
  if (editingSectionIndex.value >= 0) {
    let sections_ = sections.value
    sections_.splice(editingSectionIndex.value, 1)
    if (editingSectionIndex.value >= sections_.length) {
      editingSectionIndex.value = sections_.length - 1
    }
    if (editingSectionIndex.value < 0) {
      editingSectionIndex.value = -1
    }
    store.commit('structure/setSections', sections_)
    editingSectionIndex.value = -1
    store.commit('message/info', 'Section deleted')
  } else {
    store.commit('message/warning', 'No section selected to delete')
  }
}
const appendSection = () => {
  let newSection = {
    id: Date.now(),
    title: '',
    description: '',
    expectedWordCount: 0,
    note: ''
  }
  let sections_ = sections.value
  if (editingSectionIndex.value >= 0) {
    sections_.splice(editingSectionIndex.value + 1, 0, newSection)
  } else {
    sections_.push(newSection)
  }
  store.commit('structure/setSections', sections_)
  editingSectionIndex.value = sections.value.length - 1
  store.commit('message/info', 'New section added')
}

const copyStructurePromptToClipboard = async () => {
  let data = (await GenerateStructureApi.getPrompt(outline.value)) as any
  console.log('Prompt data:', data)
  let prompt = data['prompt'] || ''
  try {
    await navigator.clipboard.writeText(prompt)
    store.commit('message/success', 'Prompt copied to clipboard')
  } catch (error) {
    store.commit('message/error', 'Failed to copy prompt')
  }
}
const generateStructureManually = async (text: string) => {
  if (text) {
    let response = await GenerateStructureApi.updateManually(text)
    console.log(response)
    let { sections, summary } = response
    if (sections && sections.length > 0) {
      let totalWordCount = sections.reduce(
        (sum, section) => sum + (section.expectedWordCount || 0),
        0
      )
      store.commit('structure/setWritingNote', summary)
      store.commit('structure/setExpectedWordCount', totalWordCount)

      store.commit('structure/setSections', sections)
      store.commit('message/info', `Added ${sections.length} sections`)
    }
  }
}
const structureAskBtnLoading = ref(false)
const generateStructure = async () => {
  structureAskBtnLoading.value = true
  let response = await GenerateStructureApi.update(outline.value)
  let { sections, summary } = response
  if (sections && sections.length > 0) {
    let totalWordCount = sections.reduce(
      (sum, section) => sum + (section.expectedWordCount || 0),
      0
    )
    store.dispatch('structure/assignOutline', outline.value)
    store.commit('structure/setWritingNote', summary)
    store.commit('structure/setExpectedWordCount', totalWordCount)

    store.commit('structure/setSections', sections)
    store.commit('message/info', `Added ${sections.length} sections`)
  }
  structureAskBtnLoading.value = false
}
</script>

<style scoped></style>
