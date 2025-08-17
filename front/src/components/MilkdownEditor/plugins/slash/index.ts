// slashPlugin.ts
import { ref, type Ref } from 'vue'
import { slashFactory } from '@milkdown/plugin-slash'
import { usePluginViewFactory } from '@prosemirror-adapter/vue'
import type { PluginViewFactory } from '@prosemirror-adapter/vue'
import Slash from './Slash.vue'

// Keys we want to handle when the menu is open
const inspectKeys = ['ArrowDown', 'ArrowUp', 'Enter'] as const
type InspectKey = (typeof inspectKeys)[number]

/**
 * Composable to configure and control the slash menu plugin in TypeScript.
 */
export default function useSlashMenu() {
  const slashMenu = slashFactory('slashMenu')
  const pluginViewFactory: PluginViewFactory = usePluginViewFactory()
  const opened: Ref<boolean> = ref(false)

  /**
   * Register the plugin with context, adding key handlers and the Vue view.
   */
  function setSlash(ctx: any) {
    ctx.set(slashMenu.key, {
      props: {
        handleKeyDown(_: any, event: KeyboardEvent) {
          // Open on '/'
          if (event.key === '/') {
            opened.value = true
            return false // allow default insertion
          }
          // Close on 'Escape'
          if (event.key === 'Escape') {
            opened.value = false
            return true // consume the event
          }
          // Only intercept navigation keys when open
          if (!opened.value) {
            return false
          }
          return inspectKeys.includes(event.key as InspectKey)
        },
        // Optional hook if plugin emits open state changes
        handleOpenState(openState: boolean) {
          opened.value = openState
        }
      },
      view: pluginViewFactory({ component: Slash }),
      opened: opened.value
    })
  }

  return {
    slash: slashMenu,
    opened,
    setSlash
  }
}
