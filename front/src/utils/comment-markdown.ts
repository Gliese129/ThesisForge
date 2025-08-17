import type { Ctx, MilkdownPlugin, Meta } from '@milkdown/ctx'
import { commandsCtx, editorViewCtx } from '@milkdown/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import { $ctx, $prose } from '@milkdown/utils'
import type { Comment } from '@/store/article'

// 1. 从官方范例中借鉴的元数据辅助函数
function withMeta<T extends MilkdownPlugin>(
  plugin: T,
  meta: Partial<Meta> & Pick<Meta, 'displayName'>
): T {
  Object.assign(plugin, {
    meta: {
      package: 'milkdown-plugin-comment',
      ...meta
    }
  })
  return plugin
}

// 3. 创建 Context (使用 $ctx)
// 这是 Vue 组件与 Milkdown 插件沟通的桥梁

// 用于接收评论数组的 Context
export const commentsCtx = $ctx<Comment[], 'commentsCtx'>([], 'commentsCtx')
withMeta(commentsCtx, { displayName: 'Ctx<comments>' })

// 用于接收“当前激活”的评论ID的 Context
export const activeCommentIdCtx = $ctx<string | null, 'activeCommentIdCtx'>(
  null,
  'activeCommentIdCtx'
)
withMeta(activeCommentIdCtx, { displayName: 'Ctx<activeCommentId>' })

// 用于接收评论图标点击事件回调的 Context
export const onCommentClickCtx = $ctx<
  (id: string) => void,
  'onCommentClickCtx'
>(() => undefined, 'onCommentClickCtx')
withMeta(onCommentClickCtx, { displayName: 'Ctx<onCommentClick>' })

// 4. 创建核心的 ProseMirror 插件 (使用 $prose)

// 辅助函数：创建评论图标的 DOM 节点
const createCommentIcon = (
  comment: Comment,
  onClick: (id: string) => void
): HTMLElement => {
  const span = document.createElement('span')
  span.textContent = '💬'
  span.className = 'comment-widget'
  span.dataset.commentId = comment.id
  span.addEventListener('mousedown', (e) => {
    e.preventDefault() // 防止点击时编辑器失去焦点
    onClick(comment.id)
  })
  return span
}

// 核心插件逻辑
export const commentPlugin = $prose((ctx: Ctx) => {
  return new Plugin({
    key: new PluginKey('milkdown-comments'),
    props: {
      decorations: (state) => {
        // 从 Context 中获取最新数据
        const comments = ctx.get(commentsCtx.key)
        const activeId = ctx.get(activeCommentIdCtx.key)
        const onClick = ctx.get(onCommentClickCtx.key)

        if (!comments.length) return DecorationSet.empty

        const decos: Decoration[] = comments
          .map((comment) => {
            const isActive = activeId === comment.id
            // 为评论区域添加高亮样式，并根据是否激活添加额外 class
            return Decoration.inline(comment.from, comment.to, {
              class: `comment-highlight ${isActive ? 'is-active' : ''}`
            })
          })
          .concat(
            comments.map((comment) =>
              // 在评论区结尾添加图标挂件
              Decoration.widget(comment.to, createCommentIcon(comment, onClick))
            )
          )

        return DecorationSet.create(state.doc, decos)
      }
    }
  })
})
withMeta(commentPlugin, { displayName: 'Plugin<comment>' })

// 5. 将所有部分组合成一个标准的 Milkdown 插件数组
export const comment: MilkdownPlugin[] = [
  commentsCtx,
  activeCommentIdCtx,
  onCommentClickCtx,
  commentPlugin
].flat()
