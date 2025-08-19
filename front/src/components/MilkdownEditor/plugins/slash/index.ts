// slashPlugin.ts
import { slashFactory } from '@milkdown/plugin-slash'
import { usePluginViewFactory } from '@prosemirror-adapter/vue'
import type { PluginViewFactory } from '@prosemirror-adapter/vue'
import Slash from './Slash.vue'
import type { Ctx } from '@milkdown/ctx'

/**
 * Composable to configure and control the slash menu plugin in TypeScript.
 */
export default function useSlashMenu() {
  const slashMenu = slashFactory('slashMenu')
  const pluginViewFactory: PluginViewFactory = usePluginViewFactory()

  /**
   * Register the plugin with context, adding key handlers and the Vue view.
   */
  function setSlash(ctx: Ctx) {
    ctx.set(slashMenu.key, {
      view: pluginViewFactory({ component: Slash })
    })
  }

  return {
    slash: slashMenu,
    setSlash
  }
}
