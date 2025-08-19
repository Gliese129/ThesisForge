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
          v-for="(item, i) in filteredMenuList[0]"
          :key="item.idx"
          @mousemove="activeFlatIndex = getFlatIndex(0, i)"
          @mousedown.prevent="select(item)"
          :value="item.idx"
          class="cursor-pointer rounded flex items-center px-2 py-1"
          :active="isActive(0, i)"
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
          v-for="(item, i) in filteredMenuList[1]"
          :key="item.idx"
          @mousemove="activeFlatIndex = getFlatIndex(1, i)"
          @mousedown.prevent="select(item)"
          :value="item.idx"
          class="cursor-pointer rounded flex items-center px-2 py-1"
          :active="isActive(1, i)"
          :prepend-icon="item.icon"
        >
          <span class="mx-2 text-sm">{{ item.label }}</span>
          <v-chip density="compact">{{ item.code }}</v-chip>
        </v-list-item>

        <!-- Optional empty state -->
        <v-list-item
          v-show="
            filteredMenuList[0].length === 0 && filteredMenuList[1].length === 0
          "
          class="opacity-60"
        >
          No matched item
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/**
 * Slash menu with cross-group keyboard navigation, robust filtering, and ESC to close.
 * - Linear index (activeFlatIndex) so ArrowUp/Down traverses all items seamlessly.
 * - Tab / Shift+Tab also navigate; Home / End jump to ends.
 * - ESC closes the menu and clears trailing.
 * - Filtering matches code prefix and fuzzy label.
 */

import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
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

// --- Refs ---
const divRef = ref<HTMLDivElement | null>(null)

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
const [loading, get] = useInstance()

// --- UI states ---
/** Whether the menu is visible */
const showMenu = ref(false)
/** Trailing "/xxx" fragment string (including the slash), used for deletion */
const trailing = ref<string | null>('')
/** Active linear index in the flattened filtered list */
const activeFlatIndex = ref<number>(0)

// --- Static menu data ---
const menuList: MenuGroup = [
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

/** Raw filtered groups (kept as 2D for rendering) */
const filteredMenuList = ref<MenuGroup>(menuList)

/** Flattened items for linear navigation */
const flatItems = computed<MenuItem[]>(() => filteredMenuList.value.flat())

/** Map (groupIndex, itemIndex) -> flat linear index */
const getFlatIndex = (groupIndex: number, itemIndex: number) => {
  return groupIndex === 0
    ? itemIndex
    : filteredMenuList.value[0].length + itemIndex
}

/** Get item by flat linear index */
const getItemByFlatIndex = (i: number) => flatItems.value[i]

/** Whether (groupIndex, itemIndex) is currently active */
const isActive = (groupIndex: number, itemIndex: number) =>
  activeFlatIndex.value === getFlatIndex(groupIndex, itemIndex)

/** Clamp activeFlatIndex into [0, flatItems.length-1] */
const clampActive = () => {
  const n = flatItems.value.length
  if (n <= 0) {
    activeFlatIndex.value = 0
    return
  }
  if (activeFlatIndex.value < 0) activeFlatIndex.value = 0
  if (activeFlatIndex.value > n - 1) activeFlatIndex.value = n - 1
}

// --- SlashProvider lifecycle & key handling ---
let slashProvider: SlashProvider | null = null

onMounted(() => {
  slashProvider = new SlashProvider({
    content: divRef.value!,
    debounce: 50
  })

  slashProvider.update(view.value!, prevState.value)

  // Intercept keydown when the menu is open
  view.value.setProps({
    handleKeyDown: (_, event) => {
      if (!showMenu.value) return false

      const navigationalKeys = [
        'ArrowDown',
        'ArrowUp',
        'Enter',
        'Escape',
        'Tab',
        'Home',
        'End'
      ]
      if (!navigationalKeys.includes(event.key)) return false

      // If menu is open but empty, let editor handle keys
      if (flatItems.value.length === 0 && event.key !== 'Escape') return false

      event.preventDefault()
      event.stopPropagation()

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
        const current = getItemByFlatIndex(activeFlatIndex.value)
        if (current) select(current)
      } else if (event.key === 'Escape') {
        showMenu.value = false
        trailing.value = null
      }

      return true
    }
  })
})

// Update provider & check slash on view or prevState changes
watch([view, prevState], () => {
  try {
    slashProvider?.update(view.value, prevState.value)
    checkSlash(view.value.state.doc.textContent)
    clampActive()
  } catch {
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

/** Update menu visibility and filtered items based on the trailing "/xxx" pattern */
const checkSlash = (text: string) => {
  // Match the trailing "/xxx" (letters, digits, underscore)
  const slashMatch = text.match(/\/(\w*)$/)
  let cmd: string | null

  if (slashMatch !== null) {
    trailing.value = slashMatch[0] // include the slash
    cmd = slashMatch[1] // bare command text
  } else {
    trailing.value = null
    cmd = null
  }

  // Filter logic:
  // - If cmd is null -> hide menu (empty groups)
  // - If cmd is "" (just "/") -> show all items
  // - Otherwise:
  //     * code: prefix match (fast)
  //     * label: case-insensitive fuzzy includes (user-friendly)
  const filterGroups = (q: string | null): MenuGroup => {
    if (q === null) return [[], []]
    const norm = q.trim().toLowerCase()
    const matches = (item: MenuItem) => {
      if (norm === '') return true
      const codeHit = item.code.toLowerCase().startsWith(norm)
      const labelHit = item.label.toLowerCase().includes(norm)
      return codeHit || labelHit
    }
    return menuList.map((subgroup) => subgroup.filter(matches))
  }

  filteredMenuList.value = filterGroups(cmd)

  const hasAny =
    filteredMenuList.value[0].length > 0 || filteredMenuList.value[1].length > 0

  showMenu.value = hasAny
  if (hasAny) {
    // Reset highlight to the first item whenever menu opens / refilters
    activeFlatIndex.value = 0
  }
}

/** Remove the trailing "/xxx" fragment before executing the command */
const removeLeadingSlash = (ctx: Ctx) => {
  const view = ctx.get(editorViewCtx)
  const { dispatch, state } = view
  const { tr, selection } = state
  const { from } = selection
  const trailingLength = trailing.value?.length || 0
  if (trailingLength === 0) return
  dispatch(tr.deleteRange(from - trailingLength, from))
}

/** Execute selected command and close the menu */
const select = (item: MenuItem) => {
  if (loading.value) return
  get()?.action((ctx) => {
    removeLeadingSlash(ctx)
    return callCommand(item.cmd, item.payload)(ctx)
  })
  showMenu.value = false
  trailing.value = null
}

/** Prevent outside click closing / focus loss jitter while interacting with the menu */
const handleMouseDown = () => {
  // Intentionally empty: prevents event bubbling to the editor
}
</script>

<style scoped>
/* Keep as a utility if you want to toggle by data attribute */
.slash {
  display: none;
}
.slash[data-show='true'] {
  display: block;
}
</style>
