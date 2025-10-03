<template>
  <v-row class="fill-height">
    <v-col cols="12" md="8">
      <v-card class="fill-height d-flex flex-column">
        <v-card-title>Preview</v-card-title>
        <v-divider />
        <v-card-text
          class="flex-grow-1 overflow-y-auto"
          style="max-height: 65vh"
        >
          <milkdown-editor-wrapper
            v-model="mergedMarkdown"
            :config="{ readonly: true, menu: false, theme: 'auto' }"
          />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <div class="space-y-4">
        <v-card>
          <v-card-title>Summary</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item title="Sections" :subtitle="String(sectionCount)" />
              <v-list-item title="Words" :subtitle="String(wordCount)" />
              <v-list-item title="Characters" :subtitle="String(charCount)" />
            </v-list>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Export</v-card-title>
          <v-card-text class="d-flex flex-wrap gap-2">
            <v-btn
              color="primary"
              prepend-icon="mdi-file-pdf-box"
              @click="exportPdf"
            >
              Export as PDF
            </v-btn>
            <v-btn prepend-icon="mdi-language-markdown" @click="exportMarkdown">
              Export as Markdown
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { key } from '@/store'
import type { ArticleSection } from '@/store/article'
import MilkdownEditorWrapper from '@/components/CrepeEditor/CrepeEditorWrapper.vue'

const store = useStore(key)

const sections = computed<ArticleSection[]>(() => store.state.article.sections)

const mergedMarkdown = computed<string>(() => {
  const parts: string[] = []
  sections.value.forEach((s, i) => {
    //   const title = s.title?.trim() ? s.title.trim() : `Section ${i + 1}`
    //   const header = `## ${title}`
    const body = (s.content || '').trim()
    // parts.push(body ? `${header}\n\n${body}` : header)
    parts.push(body)
  })
  return parts.join('\n\n')
})

const wordCount = computed<number>(() => {
  const text = mergedMarkdown.value
  if (!text) return 0
  return (text.trim().match(/\S+/g) || []).length
})

const charCount = computed<number>(() => {
  return mergedMarkdown.value.length
})

const sectionCount = computed<number>(() => sections.value.length)

const exportPdf = () => {
  // Placeholder: backend implementation will be wired later
  store.commit('message/info', 'Export PDF triggered (placeholder)')
}

const exportMarkdown = () => {
  try {
    const blob = new Blob([mergedMarkdown.value], {
      type: 'text/markdown;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'article.md'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    store.commit('message/success', 'Markdown exported')
  } catch (e) {
    store.commit('message/error', 'Failed to export markdown')
    console.error(e)
  }
}
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
