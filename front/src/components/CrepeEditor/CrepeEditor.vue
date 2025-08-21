<template>
  <milkdown id="editor" />
</template>

<script setup lang="ts">
import { Milkdown, useEditor } from '@milkdown/vue'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
// Light themes
import '@milkdown/crepe/theme/nord.css'

import { getHTML, outline, replaceAll } from '@milkdown/utils'

// Choose your preferred theme

// Create editor instance
const doc = defineModel({ type: String })
const $emit = defineEmits(['update:modelValue', 'save'])
let crepe: Crepe | null = null
useEditor((_) => {
  crepe = new Crepe({
    root: document.getElementById('editor'),
    defaultValue: doc.value
  }).on((listner) => {
    listner.markdownUpdated((_, markdown) => {
      doc.value = markdown
      $emit('update:modelValue', markdown)
    })
  })

  return crepe
})
defineExpose({
  crepe,
  getMarkdown: () => crepe?.getMarkdown(),
  getHtml: () => crepe?.editor.action(getHTML()),
  getOutline: () => crepe?.editor.action(outline()),
  setValue: (md: string) => crepe?.editor.action(replaceAll(md))
})
</script>

<style>
/* tighten editor padding */
#editor .ProseMirror {
  padding: 20px 80px !important;
  padding-right: 10px !important;
}
</style>
