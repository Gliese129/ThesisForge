<template>
  <v-layout class="fill-height">
    <v-navigation-drawer
      permanent
      :rail="drawerIsRail && !isPinned"
      v-on:update:rail="drawerIsRail = $event"
      :expand-on-hover="!isPinned"
    >
      <v-list-item
        :prepend-icon="isPinned ? 'mdi-pin-off-outline' : 'mdi-pin-outline'"
        title="Article Sections"
        subtitle="Click to pin/unpin"
        class="pt-2"
        @click="isPinned = !isPinned"
      ></v-list-item>

      <v-divider></v-divider>

      <v-expansion-panels
        v-if="!drawerIsRail"
        v-model="panel"
        variant="accordion"
      >
        <v-expansion-panel
          v-for="(section, index) in sections"
          :key="index"
          @click="selectedSectionIndex = index"
        >
          <v-expansion-panel-title>
            <span class="font-weight-bold mr-2">{{ index + 1 }}.</span>
            {{ section.title }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="text-caption text-grey-darken-1 mb-2">
              Description: {{ section.description }}
            </div>
            <v-textarea
              v-model="section.note"
              label="Author Note (Editable)"
              rows="3"
              variant="outlined"
              dense
            ></v-textarea>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-list v-else density="compact" nav>
        <v-list-item
          v-for="(section, index) in sections"
          :key="index"
          :value="index"
          :title="section.title"
          @click="selectedSectionIndex = index"
          :active="selectedSectionIndex === index"
        >
          <template v-slot:prepend>
            <v-avatar
              :color="
                selectedSectionIndex === index ? 'green' : 'grey-lighten-1'
              "
              size="24"
            >
              <span class="text-white text-caption">{{ index + 1 }}</span>
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-card
        flat
        v-if="selectedSection"
        class="pa-4 fill-height d-flex flex-column"
      >
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5">{{ selectedSection.title }}</h2>
        </div>

        <div class="editor-placeholder flex-grow-1 overflow-y-auto">
          <milkdown-editor-wrapper
            :key="selectedSectionIndex"
            v-model="currentMarkdown"
          ></milkdown-editor-wrapper>
        </div>
      </v-card>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import type { ArticleSection } from '@/store/article'
import MilkdownEditorWrapper from '@/components/CrepeEditor/CrepeEditorWrapper.vue'
// @ts-ignore-next-line
import { watchDebounced } from '@vueuse/core'

const store = useStore(key)

// --- State for Drawer ---
const isPinned = ref(false) // State for pinning logic
const drawerIsRail = ref(true) // State to receive the drawer's actual rail status

const sections = computed<ArticleSection[]>({
  get: () => store.state.article.sections,
  set: (value) => store.commit('article/setState', { sections: value })
})

const selectedSectionIndex = ref<number>(0)
const panel = ref<number[]>([]) // Keep this for v-expansion-panels
const currentMarkdown = ref<string>('')

const selectedSection = computed(() => {
  if (selectedSectionIndex.value === null) {
    return null
  }
  return sections.value[selectedSectionIndex.value] || null
})

watch(
  selectedSectionIndex,
  (newIndex) => {
    if (newIndex !== null && sections.value[newIndex]) {
      currentMarkdown.value = sections.value[newIndex].content || ''
    } else if (newIndex === null) {
      currentMarkdown.value = ''
    }
  },
  { immediate: true }
)
watchDebounced(
  currentMarkdown,
  (newValue: string, oldValue: string) => {
    if (newValue && oldValue !== newValue) {
      store.dispatch('article/updateSectionContent', {
        index: selectedSectionIndex.value,
        content: newValue
      })
    }
  },
  { debounce: 500, maxWait: 2000 } // 停止输入 500ms 后执行，但最长2秒内一定会执行一次
)
</script>

<style scoped>
.editor-placeholder {
  border: 1px dashed #ccc;
  padding: 1rem;
  border-radius: 4px;
  height: 70vh; /* Fixed height */
  width: 100%; /* Fixed width */
}
</style>
