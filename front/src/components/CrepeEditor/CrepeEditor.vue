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
import { editorViewCtx } from '@milkdown/core'
import { commentSvg } from './resources/comment'
import {
  commentPlugin,
  // commentHooksCtx,
  insertCommentAndOpenEditor
} from './plugins/comment'

// Choose your preferred theme
// Create editor instance
const doc = defineModel({ type: String })
const $emit = defineEmits(['update:modelValue', 'save'])

let crepe: Crepe | null = null
useEditor((_) => {
  crepe = new Crepe({
    root: document.getElementById('editor'),
    defaultValue: doc.value,
    featureConfigs: {
      [Crepe.Feature.Toolbar]: {
        buildToolbar: (builder) => {
          const group = builder.addGroup('customGroup', 'Custom Group')
          group.addItem('comment', {
            active: () => false,
            icon: commentSvg,
            onRun: (ctx) => {
              const view = ctx.get(editorViewCtx)
              const { from, to } = view.state.selection

              // 取选中文本；若空选区，给个占位
              let selectedText = view.state.doc.textBetween(
                from,
                to,
                '\n',
                '\n'
              )
              if (!selectedText) selectedText = 'text' // 你也可改成 '（请替换）'

              // 插入 comment 节点并自动打开悬浮编辑条（输入框聚焦）
              insertCommentAndOpenEditor(view, selectedText, '')

              return true
            }
          })
          return builder
        }
      }
    }
  }).on((listner) => {
    listner.markdownUpdated((_, markdown) => {
      doc.value = markdown
      $emit('update:modelValue', markdown)
    })
  })

  // Configure the comment hooks context first
  crepe?.editor
    // .use(commentHooksCtx)
    // .config((ctx) => {
    //   ctx.set(commentHooksCtx.key, {
    //     onTextClicked: ({ text, comment, from, to }) => {
    //       console.log('Comment clicked:', { text, comment, from, to })
    //       // You can add your custom logic here
    //       // For example: show a modal, navigate to a page, etc.
    //       alert(`Comment clicked!\nText: "${text}"\nComment: "${comment}"`)
    //     }
    //   })
    // })
    .use(commentPlugin)

  // Then use the plugin
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

<style lang="scss">
/* tighten editor padding */
#editor .ProseMirror {
  padding: 20px 80px !important;
  padding-right: 10px !important;
}
/* 链接风格文本 */
.md-comment-link {
  background-color: #eff758;
  color: var(--md-comment-color, #1a73e8);
  cursor: pointer;
  transition:
    color 0.12s ease,
    box-shadow 0.12s ease;

  :hover,
  :focus {
    color: var(--md-comment-color-hover, #0b63d1);
    box-shadow: inset 0 -0.12em 0 currentColor;
  }

  /* 光标在节点内部时的提示（由 Decoration 添加 .is-caret-in） */
  .is-caret-in {
    box-shadow: inset 0 -1px 0 currentColor;
  }
}

/* 悬浮编辑条 */
.mdcmt-bubble {
  font-size: 14px;
}
.mdcmt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
}
.mdcmt-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #111827;
}
.mdcmt-btn:active {
  background: rgba(0, 0, 0, 0.1);
}
.mdcmt-btn-edit.is-editing {
  color: #0b63d1;
}

.mdcmt-input {
  color: #111827;
}
/* 让输入框宽度基于内容（仍设置了最小宽度） */
.mdcmt-input {
  width: auto;
  max-width: 420px;
}
</style>
