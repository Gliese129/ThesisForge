<template>
  <milkdown />
</template>

<script setup lang="ts">
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { Milkdown, useEditor } from '@milkdown/vue'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { getHTML, outline, replaceAll, getMarkdown } from '@milkdown/utils'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
// import useTooltip from './plugins/tooltip/index'
import useSlash from './plugins/slash/index'

const doc = defineModel({ type: String })
const $emit = defineEmits(['update:modelValue', 'save'])
// const { tooltip, setTooltip } = useTooltip()
const { slash, setSlash } = useSlash()
let editorInstance: Editor | null = null
useEditor((root) => {
  editorInstance = Editor.make()
    .config(nord)
    .config((ctx) => {
      ctx.set(rootCtx, root)
      // @ts-ignore-next-line
      ctx.set(defaultValueCtx, doc.value)
      // watch doc update
      ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
        doc.value = markdown
        $emit('update:modelValue', markdown)
      })
      // setTooltip(ctx)
      setSlash(ctx)
    })
    .use(commonmark)
    .use(gfm)
    // .use(tooltip)
    .use(slash)
    .use(listener)
  return editorInstance
})
defineExpose({
  editorInstance,
  setValue: (md: string) => editorInstance?.action(replaceAll(md)),
  getMarkdown: () => editorInstance?.action(getMarkdown()),
  getHtml: () => editorInstance?.action(getHTML()),
  getOutline: () => editorInstance?.action(outline())
})
</script>
