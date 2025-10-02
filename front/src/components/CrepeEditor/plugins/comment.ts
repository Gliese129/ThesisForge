import { $inputRule, $node, $remark, $prose, $ctx } from '@milkdown/kit/utils'
import { InputRule } from '@milkdown/kit/prose/inputrules'
import { Plugin, TextSelection } from 'prosemirror-state'
import type { EditorState } from 'prosemirror-state'
import { EditorView, Decoration, DecorationSet } from 'prosemirror-view'
import type { MarkdownNode } from '@milkdown/transformer'
import type { Node as PMNode } from 'prosemirror-model'

/* ================== Hook ctx ================== */
export type OnTextClicked = (args: {
  text: string
  comment: string
  from: number
  to: number
  node: PMNode
  view: EditorView
  event: MouseEvent
}) => void

export interface CommentHooks {
  onTextClicked?: OnTextClicked
}
export const commentHooksCtx = $ctx<CommentHooks, string>({}, 'commentHooksCtx')

/* ================== Escape helpers ================== */
const escapeLiteral = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\[\[/g, '\\\\[[')
    .replace(/\]\]/g, '\\\\]]')
    .replace(/\|/g, '\\\\|')

const unescapeLiteral = (s: string) =>
  s
    .replace(/\\\[\[/g, '[[')
    .replace(/\\\]\]/g, ']]')
    .replace(/\\\|/g, '|')
    .replace(/\\\\/g, '\\')

const LITERAL_RE =
  /(?<!\\)\[\[([\s\S]*?)(?<!\\)\s*\|\s*(?<!\\)([\s\S]*?)(?<!\\)\]\]/g

/* ================== remark ================== */
export const commentRemark = $remark('commentRemark', () => () => (tree) => {
  const visit = (node: MarkdownNode): MarkdownNode[] => {
    if (node.type === 'comment') return [node]
    if (node.type === 'text' && typeof node.value === 'string') {
      const value = node.value as string
      let last = 0,
        m: RegExpExecArray | null,
        out: MarkdownNode[] = []
      LITERAL_RE.lastIndex = 0
      while ((m = LITERAL_RE.exec(value)) !== null) {
        const [full, rawText, rawComment] = m
        const idx = m.index
        if (idx > last)
          out.push({ type: 'text', value: value.slice(last, idx) })
        out.push({
          type: 'comment',
          text: unescapeLiteral(rawText),
          comment: unescapeLiteral(rawComment)
        })
        last = idx + full.length
      }
      if (last < value.length)
        out.push({ type: 'text', value: value.slice(last) })
      return out.length ? out : [node]
    }
    if (Array.isArray(node.children))
      node.children = (node.children as MarkdownNode[]).flatMap(visit)
    return [node]
  }
  tree.children = (tree.children as MarkdownNode[]).flatMap(visit) as any
  return tree
})

/* ================== NodeSpec ================== */
export const commentNode = $node('comment', () => ({
  group: 'inline',
  inline: true,
  content: 'text*',
  marks: '',
  isolating: true,
  attrs: { comment: { default: '' } },
  parseDOM: [
    {
      tag: 'span.md-comment-link',
      getAttrs: (dom) => {
        const el = dom as HTMLElement
        const data = el.getAttribute('data-comment')
        if (data == null) return false
        return { comment: data }
      }
    }
  ],
  toDOM: (node) => [
    'span',
    {
      'data-comment': node.attrs.comment,
      class: 'md-comment-link',
      role: 'link',
      tabindex: '0',
      spellcheck: 'false',
      'aria-label': `Comment: ${node.attrs.comment ?? ''}`
    },
    0
  ],
  parseMarkdown: {
    match: (node) => node.type === 'comment',
    runner: (state, node: any, type) => {
      state.openNode(type, { comment: node.comment })
      if (typeof node.text === 'string' && node.text.length)
        state.addText(node.text)
      state.closeNode()
    }
  },
  toMarkdown: {
    match: (node) => node.type.name === 'comment',
    runner: (state, node) => {
      const text = node.textContent || ''
      const comment = (node.attrs?.comment as string) ?? ''
      state.addNode('text', undefined, undefined, {
        value: `[[${escapeLiteral(text)} | ${escapeLiteral(comment)}]]`
      })
    }
  }
}))

/* ================== Edge helpers ================== */
function insideRightEdge(
  state: EditorState,
  nodeType: any
): { afterPos: number } | null {
  const sel = state.selection
  if (!sel.empty) return null
  const $from = sel.$from
  for (let d = $from.depth; d >= 0; d--) {
    const n = $from.node(d)
    if (n.type === nodeType) {
      if ($from.parent === n && $from.parentOffset === n.content.size)
        return { afterPos: $from.after(d) }
      return null
    }
  }
  return null
}
function insideLeftEdge(
  state: EditorState,
  nodeType: any
): { beforePos: number } | null {
  const sel = state.selection
  if (!sel.empty) return null
  const $from = sel.$from
  for (let d = $from.depth; d >= 0; d--) {
    const n = $from.node(d)
    if (n.type === nodeType) {
      if ($from.parent === n && $from.parentOffset === 0)
        return { beforePos: $from.before(d) }
      return null
    }
  }
  return null
}
function outsideAfterComment(
  state: EditorState,
  nodeType: any
): { insideEnd: number } | null {
  const sel = state.selection
  if (!sel.empty) return null
  const $from = sel.$from
  const node = $from.nodeBefore
  if (node && node.type === nodeType) {
    const start = $from.pos - node.nodeSize
    return { insideEnd: start + node.nodeSize - 1 }
  }
  return null
}
function outsideBeforeComment(
  state: EditorState,
  nodeType: any
): { insideStart: number } | null {
  const sel = state.selection
  if (!sel.empty) return null
  const $from = sel.$from
  const node = $from.nodeAfter
  if (node && node.type === nodeType) return { insideStart: $from.pos + 1 }
  return null
}

/* ================== InputRule: ']]' ================== */
export const commentInputRule = $inputRule(
  (ctx) =>
    new InputRule(/\]\]/, (state) => {
      const type = commentNode.type(ctx)
      const $from = state.selection.$from
      for (let d = $from.depth; d >= 0; d--)
        if ($from.node(d).type === type) return null

      const $pos = state.selection.$to
      const parent = $pos.parent
      const fromInParent = $pos.parentOffset
      const textBefore = parent.textBetween(
        0,
        fromInParent,
        undefined,
        '\uFFFC'
      )

      let m: RegExpExecArray | null,
        last: RegExpExecArray | null = null
      LITERAL_RE.lastIndex = 0
      while ((m = LITERAL_RE.exec(textBefore)) !== null) last = m
      if (!last) return null

      const [full, rawText, rawComment] = last
      const text = unescapeLiteral(rawText)
      const comment = unescapeLiteral(rawComment)

      const startOff = fromInParent - (textBefore.length - last.index)
      const endOff = startOff + full.length
      const blockStart = $pos.start()
      const absFrom = blockStart + startOff
      const absTo = blockStart + endOff

      const { tr, schema } = state
      const node = type.create({ comment }, schema.text(text))
      tr.replaceWith(absFrom, absTo, node)

      const mappedFrom = tr.mapping.map(absFrom)
      const posAfter = mappedFrom + node.nodeSize
      tr.setSelection(TextSelection.create(tr.doc, posAfter))
      return tr
    })
)

/* ================== Right-edge typing out ================== */
export const commentRightEdgeOut = $prose(
  (ctx) =>
    new Plugin({
      props: {
        handleTextInput(view, _f, _t, text) {
          const type = commentNode.type(ctx)
          const info = insideRightEdge(view.state, type)
          if (!info) return false
          const tr = view.state.tr.insertText(
            text,
            info.afterPos,
            info.afterPos
          )
          tr.setSelection(
            TextSelection.create(tr.doc, info.afterPos + text.length)
          )
          view.dispatch(tr)
          return true
        },
        handleDOMEvents: {
          compositionend: (view) => {
            const type = commentNode.type(ctx)
            const info = insideRightEdge(view.state, type)
            if (!info) return false
            const tr = view.state.tr
            tr.setSelection(TextSelection.create(tr.doc, info.afterPos))
            view.dispatch(tr)
            return false
          }
        }
      }
    })
)

/* ================== Arrow edge nav ================== */
export const commentEdgeNav = $prose(
  (ctx) =>
    new Plugin({
      props: {
        handleKeyDown(view, evt) {
          const key = (evt as KeyboardEvent).key
          if (key !== 'ArrowLeft' && key !== 'ArrowRight') return false
          const type = commentNode.type(ctx)

          if (key === 'ArrowRight') {
            const r = insideRightEdge(view.state, type)
            if (r) {
              view.dispatch(
                view.state.tr.setSelection(
                  TextSelection.create(view.state.doc, r.afterPos)
                )
              )
              return true
            }
            const b = outsideBeforeComment(view.state, type)
            if (b) {
              view.dispatch(
                view.state.tr.setSelection(
                  TextSelection.create(view.state.doc, b.insideStart)
                )
              )
              return true
            }
            return false
          }
          if (key === 'ArrowLeft') {
            const l = insideLeftEdge(view.state, type)
            if (l) {
              view.dispatch(
                view.state.tr.setSelection(
                  TextSelection.create(view.state.doc, l.beforePos)
                )
              )
              return true
            }
            const a = outsideAfterComment(view.state, type)
            if (a) {
              view.dispatch(
                view.state.tr.setSelection(
                  TextSelection.create(view.state.doc, a.insideEnd)
                )
              )
              return true
            }
            return false
          }
          return false
        }
      }
    })
)

/* ================== Caret hint (adds .is-caret-in) ================== */
export const commentCaretHint = $prose(
  (ctx) =>
    new Plugin<DecorationSet>({
      state: {
        init: () => DecorationSet.empty,
        apply(_, __, _oldState, newState) {
          const type = commentNode.type(ctx)
          const sel = newState.selection
          if (!sel.empty) return DecorationSet.empty
          const $from = sel.$from
          for (let d = $from.depth; d >= 0; d--) {
            const n = $from.node(d)
            if (n.type === type) {
              const from = $from.before(d)
              const to = from + n.nodeSize
              const deco = (Decoration as any).node(from, to, {
                class: 'is-caret-in'
              })
              return DecorationSet.create(newState.doc, [deco])
            }
          }
          return DecorationSet.empty
        }
      },
      props: {
        decorations(state) {
          return (this as any).getState(state)
        }
      }
    })
)

/* ================== Bubble UI ================== */
type Bubble = ReturnType<typeof createCommentBubble>

function createCommentBubble(view: EditorView) {
  const doc = view.dom.ownerDocument
  const el = doc.createElement('div')
  el.className = 'mdcmt-bubble'
  Object.assign(el.style, {
    position: 'fixed',
    display: 'none',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: '2147483647'
  } as CSSStyleDeclaration)

  // left: copy
  const btnCopy = doc.createElement('button')
  btnCopy.className = 'mdcmt-btn mdcmt-btn-copy'
  btnCopy.innerHTML = copySvg
  el.appendChild(btnCopy)

  // center: input (shows comment)
  const input = doc.createElement('input')
  input.className = 'mdcmt-input'
  Object.assign(input, { type: 'text', value: '' })
  Object.assign(input.style, {
    minWidth: '180px',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px'
  } as CSSStyleDeclaration)
  input.disabled = true
  el.appendChild(input)

  // right: edit + delete
  const btnEdit = doc.createElement('button')
  btnEdit.className = 'mdcmt-btn mdcmt-btn-edit'
  btnEdit.innerHTML = editSvg
  el.appendChild(btnEdit)

  const btnDel = doc.createElement('button')
  btnDel.className = 'mdcmt-btn mdcmt-btn-del'
  btnDel.innerHTML = delSvg
  el.appendChild(btnDel)

  doc.body.appendChild(el)

  let anchorEl: HTMLElement | null = null
  let nodeStart = -1
  let editing = false

  const show = (start: number, anchor: HTMLElement, comment: string) => {
    nodeStart = start
    anchorEl = anchor
    input.value = comment ?? ''
    el.style.display = 'flex'
    reposition()
  }
  const hide = () => {
    el.style.display = 'none'
    anchorEl = null
    nodeStart = -1
    if (editing) exitEdit(false)
  }
  const reposition = () => {
    if (!anchorEl || el.style.display === 'none') return
    const rect = anchorEl.getBoundingClientRect()
    const vw = doc.defaultView?.innerWidth ?? 0
    const margin = 8
    // default above
    let top = rect.top - el.offsetHeight - margin
    if (top < 0) top = rect.bottom + margin
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - el.offsetWidth / 2, 8),
      vw - el.offsetWidth - 8
    )
    el.style.top = `${top}px`
    el.style.left = `${left}px`
  }

  const commitEdit = () => {
    if (!editing) return
    const viewState = view.state
    const type = viewState.schema.nodes['comment']
    const node = viewState.doc.nodeAt(nodeStart)
    if (node && node.type === type) {
      const tr = viewState.tr.setNodeMarkup(
        nodeStart,
        type,
        { ...node.attrs, comment: input.value },
        node.marks
      )
      view.dispatch(tr)
    }
    exitEdit(true)
  }
  const exitEdit = (_committed: boolean) => {
    editing = false
    input.disabled = true
    btnEdit.classList.remove('is-editing')
  }

  // events
  btnCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(input.value)
    } catch {}
  })
  btnEdit.addEventListener('click', () => {
    if (!editing) {
      editing = true
      btnEdit.classList.add('is-editing')
      input.disabled = false
      input.focus()
      input.select()
    } else {
      commitEdit()
    }
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      exitEdit(false)
    }
  })
  input.addEventListener('blur', () => {
    if (editing) commitEdit()
  })
  btnDel.addEventListener('click', () => {
    if (nodeStart >= 0) unwrapComment(view, nodeStart)
  })

  const destroy = () => {
    if (el.parentNode) el.parentNode.removeChild(el)
  }

  return {
    show,
    hide,
    reposition,
    destroy,
    setValue: (v: string) => (input.value = v)
  }
}

function unwrapComment(view: EditorView, startPos: number) {
  const { state, dispatch } = view
  const type = state.schema.nodes['comment']
  const node = state.doc.nodeAt(startPos)
  if (!node || node.type !== type) return
  const text = node.textContent || ''
  const tr = state.tr.replaceWith(
    startPos,
    startPos + node.nodeSize,
    state.schema.text(text)
  )
  dispatch(tr)
}

/* ===== Bubble plugin ===== */
export const commentBubble = $prose(
  (ctx) =>
    new Plugin({
      view(editorView) {
        const bubble = createCommentBubble(editorView)
        const win = editorView.dom.ownerDocument.defaultView || window
        const onScroll = () => bubble.reposition()
        const onResize = () => bubble.reposition()
        win.addEventListener('scroll', onScroll, true)
        win.addEventListener('resize', onResize)

        const updateUI = () => {
          const { state } = editorView
          const type = commentNode.type(ctx)
          const sel = state.selection
          const $from = sel.$from
          let depth = -1
          for (let d = $from.depth; d >= 0; d--) {
            if ($from.node(d).type === type) {
              depth = d
              break
            }
          }
          if (depth === -1) {
            bubble.hide()
            return
          }
          const start = $from.before(depth)
          const node = $from.node(depth)
          const dom = editorView.nodeDOM(start) as HTMLElement | null
          if (!dom) {
            bubble.hide()
            return
          }
          bubble.show(start, dom, String(node.attrs?.comment ?? ''))
        }

        updateUI()

        return {
          update: updateUI,
          destroy: () => {
            bubble.destroy()
            win.removeEventListener('scroll', onScroll, true)
            win.removeEventListener('resize', onResize)
          }
        }
      }
    })
)

/* ================== Click hook（可选） ================== */
export const commentClickHook = $prose(
  (ctx) =>
    new Plugin({
      props: {
        handleDOMEvents: {
          click: (view: EditorView, evt) => {
            const el = (evt.target as HTMLElement | null)?.closest(
              'span.md-comment-link[data-comment]'
            ) as HTMLElement | null
            if (!el) return false
            const coords = {
              left: (evt as MouseEvent).clientX,
              top: (evt as MouseEvent).clientY
            }
            const posInfo = view.posAtCoords(coords)
            if (!posInfo) return false
            const type = commentNode.type(ctx)
            const $pos = view.state.doc.resolve(posInfo.pos)
            let depth = -1
            for (let d = $pos.depth; d >= 0; d--) {
              if ($pos.node(d).type === type) {
                depth = d
                break
              }
            }
            if (depth === -1) return false
            const node = $pos.node(depth)
            const from = $pos.before(depth)
            const to = from + node.nodeSize
            const hooks = ctx.get(commentHooksCtx.key)
            hooks?.onTextClicked?.({
              text: node.textContent,
              comment: String(node.attrs?.comment ?? ''),
              from,
              to,
              node,
              view,
              event: evt as MouseEvent
            })
            return false
          }
        }
      }
    })
)

/* ================== API ================== */
export function setComment(
  view: EditorView,
  nextComment: string,
  pos?: number
): boolean {
  const { state, dispatch } = view
  const type = state.schema.nodes['comment']
  const updateAt = (startPos: number) => {
    const node = state.doc.nodeAt(startPos)
    if (!node || node.type !== type) return false
    const tr = state.tr.setNodeMarkup(
      startPos,
      type,
      { ...node.attrs, comment: nextComment },
      node.marks
    )
    dispatch(tr)
    return true
  }
  if (typeof pos === 'number') return updateAt(pos)
  const $from = state.selection.$from
  for (let d = $from.depth; d >= 0; d--) {
    if ($from.node(d).type === type) return updateAt($from.before(d))
  }
  return false
}

export function insertCommentNode(
  view: EditorView,
  text: string,
  comment: string
) {
  const { state, dispatch } = view
  const type = state.schema.nodes['comment']
  const node = type.create({ comment }, state.schema.text(text))
  const tr = state.tr.replaceSelectionWith(node)
  const posAfter = tr.selection.from + node.nodeSize
  dispatch(tr.setSelection(TextSelection.create(tr.doc, posAfter)))
  return true
}

/* ================== Bundle ================== */
export const commentPlugin = [
  commentHooksCtx,
  commentRemark,
  commentNode,
  commentInputRule,
  commentRightEdgeOut,
  commentEdgeNav,
  commentCaretHint,
  commentBubble, // <<<<<< 悬浮编辑条
  commentClickHook
].flat()

/* ================== Helper: insert + open editor ================== */
export function insertCommentAndOpenEditor(
  view: EditorView,
  text: string,
  initialComment = ''
): boolean {
  const { state, dispatch } = view
  const type = state.schema.nodes['comment']
  if (!type) return false

  const node = type.create({ comment: initialComment }, state.schema.text(text))
  let tr = state.tr.replaceSelectionWith(node)

  // 计算新节点的起点：此时 selection.from 在节点之后
  const posAfter = tr.selection.from
  const startPos = posAfter - node.nodeSize

  // 把光标放到“节点内部开头”，以便 bubble 插件识别并显示
  tr = tr.setSelection(TextSelection.create(tr.doc, startPos + 1))
  dispatch(tr)

  // 下一帧让 Bubble 进入编辑态并聚焦
  requestAnimationFrame(() => {
    const bubble = (view as any).__mdcmtBubble
    if (bubble?.beginEdit) bubble.beginEdit()
  })
  return true
}

/* ================== SVG icons ================== */
const copySvg = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="9" width="13" height="13" rx="2"></rect>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>`
const editSvg = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 20h9"></path>
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
</svg>`
const delSvg = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
  <path d="M10 11v6"></path><path d="M14 11v6"></path>
  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
</svg>`
