<template>
  <!-- Slash menu using Vuetify and TailwindCSS -->
  <div ref="divRef" class="absolute" v-show="showMenu">
    <!-- Menu list -->
    <v-card width="250">
      <v-list
        density="compact"
        class="py-2"
        @mousedown.prevent.stop="handleMouseDown"
      >
        <!-- Inline commands group -->
        <v-list-item
          v-for="item in filteredMenuList[0]"
          :key="item.idx"
          @mousemove="activeIdx = item.idx"
          @mousedown.prevent="select(item)"
          :value="item.idx"
          class="cursor-pointer rounded hover:bg-slate-100"
          :prepend-icon="item.icon"
        >
          <span class="mx-2 text-sm">{{ item.label }}</span>
          <v-chip density="compact">{{ item.code }}</v-chip>
        </v-list-item>

        <v-divider
          class="my-1"
          v-show="
            filteredMenuList[0].length > 0 && filteredMenuList[1].length > 0
          "
        />

        <!-- Block commands group -->
        <v-list-item
          v-for="item in filteredMenuList[1]"
          :key="item.idx"
          @mousemove="activeIdx = item.idx"
          @mousedown.prevent="select(item)"
          :value="item.idx"
          :class="[
            'cursor-pointer rounded flex items-center px-2 py-1',
            item.idx === activeIdx ? 'bg-slate-100' : 'hover:bg-slate-100'
          ]"
          :prepend-icon="item.icon"
        >
          <span class="mx-2 text-sm">{{ item.label }}</span>
          <v-chip density="compact">{{ item.code }}</v-chip>
        </v-list-item>
        <v-list-item
          v-show="
            filteredMenuList[0].length == 0 && filteredMenuList[1].length == 0
          "
        >
          No matched item
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const divRef = ref<HTMLDivElement | null>(null)

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePluginViewContext } from '@prosemirror-adapter/vue'
import { SlashProvider } from '@milkdown/plugin-slash'
import { editorViewCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import { callCommand } from '@milkdown/utils'
import {
  createCodeBlockCommand,
  insertHrCommand,
  wrapInHeadingCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  insertImageCommand
} from '@milkdown/preset-commonmark'
import { insertTableCommand } from '@milkdown/preset-gfm'

// --- Types ---
type MenuItem = {
  idx: number
  cmd: any
  label: string
  icon: string
  payload?: any
  code: string
}
type MenuGroup = MenuItem[][]

// --- Milkdown / PM view ---
const { view, prevState } = usePluginViewContext()

// DOM ref for slash menu container (must be real element)

// UI states
const activeIdx = ref<number>(0)

// Define slash menu items (mdi 图标名仅示例，可按你的图标集替换)
const menuList = [
  [
    {
      idx: 1,
      cmd: wrapInHeadingCommand.key,
      label: 'Heading 1',
      icon: 'mdi-format-header-1',
      payload: 1,
      code: 'h1'
    },
    {
      idx: 2,
      cmd: wrapInHeadingCommand.key,
      label: 'Heading 2',
      icon: 'mdi-format-header-2',
      payload: 2,
      code: 'h2'
    },
    {
      idx: 3,
      cmd: wrapInHeadingCommand.key,
      label: 'Heading 3',
      icon: 'mdi-format-header-3',
      payload: 3,
      code: 'h3'
    },
    {
      idx: 4,
      cmd: wrapInHeadingCommand.key,
      label: 'Heading 4',
      icon: 'mdi-format-header-4',
      payload: 4,
      code: 'h4'
    },
    {
      idx: 5,
      cmd: wrapInBulletListCommand.key,
      label: 'Bullet List',
      icon: 'mdi-format-list-bulleted',
      code: 'ul'
    },
    {
      idx: 6,
      cmd: wrapInOrderedListCommand.key,
      label: 'Numbered List',
      icon: 'mdi-format-list-numbered',
      code: 'ol'
    }
  ],
  [
    {
      idx: 7,
      cmd: insertTableCommand.key,
      label: 'Insert Table',
      icon: 'mdi-table',
      code: 'table'
    },
    {
      idx: 8,
      cmd: wrapInBlockquoteCommand.key,
      label: 'Blockquote',
      icon: 'mdi-format-quote-close',
      code: 'quote'
    },
    {
      idx: 9,
      cmd: createCodeBlockCommand.key,
      label: 'Code Block',
      icon: 'mdi-code-braces',
      code: 'code'
    },
    {
      idx: 10,
      cmd: insertHrCommand.key,
      label: 'Horizontal Rule',
      icon: 'mdi-minus',
      code: 'hr'
    },
    {
      idx: 11,
      cmd: insertImageCommand.key,
      label: 'Insert Image',
      icon: 'mdi-image',
      code: 'image'
    }
  ]
]
const filteredMenuList = ref<MenuGroup>(menuList)

let slashProvider: SlashProvider | null = null

onMounted(() => {
  slashProvider = new SlashProvider({
    content: divRef.value!,
    debounce: 50
  })

  slashProvider.update(view.value!, prevState.value)
})

// 在 view 或 prevState 变化时更新 Provider
const showMenu = ref(false)
const trailing = ref<string | null>('')
const checkSlash = (text: string) => {
  // get /xxx
  let slashMatch = text.match(/\/(\w*)$/)
  let cmd
  if (slashMatch !== null) {
    trailing.value = slashMatch[0]
    cmd = slashMatch[1]
    showMenu.value = true
  } else {
    trailing.value = null
    cmd = null
    showMenu.value = false
  }
  filteredMenuList.value =
    cmd !== null
      ? menuList.map((subgroup) =>
          subgroup.filter((item) => cmd === '' || item.code.startsWith(cmd))
        )
      : [[], []]
}
watch([view, prevState], () => {
  try {
    slashProvider?.update(view.value, prevState.value)
    checkSlash(view.value.state.doc.textContent)
  } catch {
    // 静默兜底，防止意外空引用
    console.warn(
      'Failed to update slash provider:',
      slashProvider,
      view.value,
      prevState.value
    )
  }
})

onUnmounted(() => {
  slashProvider?.destroy()
  slashProvider = null
})

// —— helpers ——

// Milkdown 的 callCommand 需要 Ctx/CtxLike，这里提供最小 CtxLike 适配（只响应 editorViewCtx）
const getCtxLike = (): Ctx => {
  const ctxLike = {
    get: <T,>(key: unknown): T => {
      // 仅当请求 editorViewCtx 时返回 ProseMirror View
      if ((key as any) === editorViewCtx) {
        return view.value as unknown as T
      }
      // 其他 key 返回 undefined，够用
      return undefined as unknown as T
    }
  } as unknown as Ctx
  return ctxLike
}

// 移除光标前的 “/”
const removeLeadingSlash = () => {
  const pmView = view.value
  if (!pmView) return
  const { state, dispatch } = pmView
  const { from } = state.selection
  const tr = state.tr
  const charBefore = from > 0 ? state.doc.textBetween(from - 1, from) : ''
  if (charBefore === '/') {
    dispatch(tr.deleteRange(from - 1, from))
  }
}

// 选择菜单项时触发命令
const select = (item: MenuItem) => {
  removeLeadingSlash()
  const ctxLike = getCtxLike()
  callCommand(item.cmd, item.payload)(ctxLike)
  showMenu.value = false
}

// 防止点击内部关闭
const handleMouseDown = () => {}
</script>

<style scoped>
.slash {
  display: none;
}
.slash[data-show='true'] {
  display: block;
}
</style>
