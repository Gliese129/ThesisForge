<template>
  <!-- Slash command menu with dynamic tabs + anchor scroll -->
  <div
    ref="containerRef"
    class="absolute z-[1000]"
    v-show="showMenu"
    style="zoom: 0.9"
  >
    <v-card
      class="rounded-sm overflow-hidden px-1"
      width="280"
      density="compact"
    >
      <!-- Dynamic tabs from commands -->
      <v-tabs
        v-model="activeGroupKey"
        bg-color="transparent"
        class="p-2"
        density="compact"
      >
        <v-tab v-for="groupKey in groupOrder" :key="groupKey" :value="groupKey">
          {{ groupLabels[groupKey] ?? groupKey }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <!-- Scrollable list; groups act like anchors -->
      <div ref="scrollRef" class="overflow-y-auto py-1">
        <v-list density="compact" max-height="400">
          <template v-for="groupKey in groupOrder" :key="groupKey">
            <template v-if="filteredCommands[groupKey]?.length">
              <!-- Group header as anchor -->
              <v-list-subheader
                :ref="(el: any) => (sectionEls[groupKey] = el)"
                class="text-gray-500"
              >
                {{ groupLabels[groupKey] ?? groupKey }}
              </v-list-subheader>

              <!-- Items -->
              <v-list-item
                v-for="(item, i) in filteredCommands[groupKey]"
                :key="item.idx"
                @mousemove="activeFlatIndex = getLinearIndex(groupKey, i)"
                @mousedown.prevent="select(item)"
                class="cursor-pointer rounded px-2 py-1"
                :active="activeFlatIndex === getLinearIndex(groupKey, i)"
                density="compact"
              >
                <template #prepend>
                  <v-icon :icon="item.icon" size="18" />
                </template>

                <!-- Title -->
                <v-list-item-title
                  class="mx-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {{ item.label }}
                </v-list-item-title>

                <!-- Right-aligned gray shortcut -->
                <template #append>
                  <span
                    class="text-xs text-gray-400 whitespace-nowrap select-none"
                  >
                    /{{ item.code }}
                  </span>
                </template>
              </v-list-item>
            </template>
          </template>

          <!-- Empty state -->
          <v-list-item v-if="flatItems.length === 0" class="opacity-60">
            No matched command
          </v-list-item>
        </v-list>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/**
 * Compact slash command menu:
 * - Card auto width (no fixed width), small max height
 * - Gray '/code' aligned to the right via v-list-item #append
 * - Tabs are anchors built dynamically from `commands`
 * - Left/Right switches groups + scrollIntoView; Up/Down & Tab/Shift+Tab move linearly across all items
 * - Enter runs command; Esc closes
 */

import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  reactive,
  nextTick
} from 'vue'
import { usePluginViewContext } from '@prosemirror-adapter/vue'
import { SlashProvider } from '@milkdown/plugin-slash'
import { editorViewCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import { useInstance } from '@milkdown/vue'
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

type CommandItem = {
  idx: number
  cmd: any
  label: string
  icon: string
  payload?: any
  code: string
}
type CommandGroups = Record<string, CommandItem[]>

const containerRef = ref<HTMLDivElement | null>(null)
const scrollRef = ref<HTMLDivElement | null>(null)

const { view, prevState } = usePluginViewContext()
const [loading, get] = useInstance()

const showMenu = ref(false)
const trailing = ref<string | null>('')

const activeGroupKey = ref<string>('text')
const activeFlatIndex = ref<number>(0)

const groupLabels: Record<string, string> = {
  text: '文本',
  list: '列表',
  advanced: '高级'
}

/** Dynamic commands (tabs come from keys) */
const commands: CommandGroups = {
  text: [
    {
      idx: 1,
      cmd: wrapInHeadingCommand.key,
      label: '标题 1',
      icon: 'mdi-format-header-1',
      payload: 1,
      code: 'h1'
    },
    {
      idx: 2,
      cmd: wrapInHeadingCommand.key,
      label: '标题 2',
      icon: 'mdi-format-header-2',
      payload: 2,
      code: 'h2'
    },
    {
      idx: 3,
      cmd: wrapInHeadingCommand.key,
      label: '标题 3',
      icon: 'mdi-format-header-3',
      payload: 3,
      code: 'h3'
    },
    {
      idx: 10,
      cmd: insertHrCommand.key,
      label: '分割线',
      icon: 'mdi-minus',
      code: 'divider'
    },
    {
      idx: 8,
      cmd: wrapInBlockquoteCommand.key,
      label: '引用',
      icon: 'mdi-format-quote-close',
      code: 'quote'
    }
  ],
  list: [
    {
      idx: 5,
      cmd: wrapInBulletListCommand.key,
      label: '项目列表',
      icon: 'mdi-format-list-bulleted',
      code: 'bullet-list'
    },
    {
      idx: 6,
      cmd: wrapInOrderedListCommand.key,
      label: '编号列表',
      icon: 'mdi-format-list-numbered',
      code: 'ordered-list'
    }
  ],
  advanced: [
    {
      idx: 7,
      cmd: insertImageCommand.key,
      label: '图片',
      icon: 'mdi-image',
      code: 'image'
    },
    {
      idx: 8,
      cmd: createCodeBlockCommand.key,
      label: '代码块',
      icon: 'mdi-code-braces',
      code: 'code'
    },
    {
      idx: 9,
      cmd: insertTableCommand.key,
      label: '表格',
      icon: 'mdi-table',
      code: 'table'
    }
  ]
}

const groupOrder = computed(() => Object.keys(commands))

/** Filtered groups */
const filteredCommands = reactive<CommandGroups>({})

const applyFilter = (query: string | null) => {
  const match = (item: CommandItem, q: string) => {
    if (!q) return true
    const n = q.toLowerCase()
    return (
      item.code.toLowerCase().startsWith(n) ||
      item.label.toLowerCase().includes(n)
    )
  }

  if (query === null) {
    for (const k of groupOrder.value) filteredCommands[k] = []
    showMenu.value = false
    return
  }

  const q = query.trim()
  let any = false
  for (const k of groupOrder.value) {
    const arr = commands[k] ?? []
    const filtered = q === '' ? arr : arr.filter((it) => match(it, q))
    filteredCommands[k] = filtered
    if (filtered.length) any = true
  }
  showMenu.value = any

  // Ensure active group points to a non-empty group if possible
  if (showMenu.value && !filteredCommands[activeGroupKey.value]?.length) {
    const next = groupOrder.value.find((k) => filteredCommands[k]?.length)
    if (next) activeGroupKey.value = next
  }
  activeFlatIndex.value = 0
}

/** Flatten filtered items for linear navigation */
const flatItems = computed<
  { groupKey: string; item: CommandItem; localIndex: number }[]
>(() => {
  const out: { groupKey: string; item: CommandItem; localIndex: number }[] = []
  for (const k of groupOrder.value) {
    const arr = filteredCommands[k] || []
    arr.forEach((item, i) => out.push({ groupKey: k, item, localIndex: i }))
  }
  return out
})

/** Map (groupKey, localIndex) -> linear index */
const getLinearIndex = (groupKey: string, localIndex: number) => {
  let idx = 0
  for (const k of groupOrder.value) {
    if (k === groupKey) return idx + localIndex
    idx += filteredCommands[k]?.length ?? 0
  }
  return 0
}

/** Anchors for group headers */
const sectionEls: Record<string, HTMLElement | null> = reactive({})

const scrollToGroup = async (key: string) => {
  await nextTick()
  const el = sectionEls[key]
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const switchGroup = (delta: number) => {
  if (!showMenu.value) return
  const order = groupOrder.value
  const has = (k: string) => (filteredCommands[k]?.length ?? 0) > 0
  let i = order.indexOf(activeGroupKey.value)
  let tries = 0
  do {
    i = (i + delta + order.length) % order.length
    tries++
  } while (!has(order[i]) && tries <= order.length + 1)
  activeGroupKey.value = order[i]
  scrollToGroup(activeGroupKey.value)
}

/** Detect trailing '/xxx' and filter */
const detectSlash = (text: string) => {
  const m = text.match(/\/(\w*)$/)
  if (!m) {
    trailing.value = null
    applyFilter(null)
    return
  }
  trailing.value = m[0]
  applyFilter(m[1] ?? '')
}

const removeLeadingSlash = (ctx: Ctx) => {
  const v = ctx.get(editorViewCtx)
  const { dispatch, state } = v
  const { tr, selection } = state
  const { from } = selection
  const n = trailing.value?.length ?? 0
  if (n > 0) dispatch(tr.deleteRange(from - n, from))
}

const select = (item: CommandItem) => {
  if (loading.value) return
  get()?.action((ctx) => {
    removeLeadingSlash(ctx)
    return callCommand(item.cmd, item.payload)(ctx)
  })
  showMenu.value = false
  trailing.value = null
}

/** Provider + key handling */
let slashProvider: SlashProvider | null = null
onMounted(() => {
  slashProvider = new SlashProvider({
    content: containerRef.value!,
    debounce: 50
  })
  slashProvider.update(view.value!, prevState.value)

  view.value.setProps({
    handleKeyDown: (_, event) => {
      if (!showMenu.value) return false

      const keys = [
        'ArrowDown',
        'ArrowUp',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Enter',
        'Escape',
        'Home',
        'End'
      ]
      if (!keys.includes(event.key)) return false

      event.preventDefault()
      event.stopPropagation()

      // Group switching
      if (event.key === 'ArrowLeft') {
        switchGroup(-1)
        return true
      }
      if (event.key === 'ArrowRight') {
        switchGroup(1)
        return true
      }

      // Close
      if (event.key === 'Escape') {
        showMenu.value = false
        trailing.value = null
        return true
      }

      if (flatItems.value.length === 0) return true

      // Linear navigation
      if (
        event.key === 'ArrowDown' ||
        (event.key === 'Tab' && !event.shiftKey)
      ) {
        activeFlatIndex.value = Math.min(
          activeFlatIndex.value + 1,
          flatItems.value.length - 1
        )
      } else if (
        event.key === 'ArrowUp' ||
        (event.key === 'Tab' && event.shiftKey)
      ) {
        activeFlatIndex.value = Math.max(activeFlatIndex.value - 1, 0)
      } else if (event.key === 'Home') {
        activeFlatIndex.value = 0
      } else if (event.key === 'End') {
        activeFlatIndex.value = flatItems.value.length - 1
      } else if (event.key === 'Enter') {
        const curr = flatItems.value[activeFlatIndex.value]?.item
        if (curr) select(curr)
      }

      // Sync active group to the item under cursor
      const curr = flatItems.value[activeFlatIndex.value]
      if (curr) activeGroupKey.value = curr.groupKey

      return true
    }
  })
})

watch([view, prevState], () => {
  try {
    slashProvider?.update(view.value, prevState.value)
    detectSlash(view.value.state.doc.textContent)
  } catch {
    // noop
  }
})

onUnmounted(() => {
  slashProvider?.destroy()
  slashProvider = null
})
</script>

<style scoped></style>
