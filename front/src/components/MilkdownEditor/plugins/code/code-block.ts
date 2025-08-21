// code comments in English as requested
import { languages } from '@codemirror/language-data'
import { codeBlockConfig } from '@milkdown/components/code-block'
import type { Ctx } from '@milkdown/ctx'

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
  EditorView
} from '@codemirror/view'
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
  HighlightStyle
} from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { tags as t } from '@lezer/highlight'
import './code-block.scss'

// 1) Define a Nord-like highlight style (map semantic tags -> colors)
const nordHighlight = HighlightStyle.define([
  { tag: t.comment, color: '#636f88', fontStyle: 'italic' },
  { tag: [t.keyword, t.modifier, t.operatorKeyword], color: '#f92672' },
  { tag: [t.number, t.integer, t.float], color: '#b48ead' },
  { tag: [t.string, t.special(t.string), t.character], color: '#a3be8c' },
  { tag: [t.bool, t.null, t.atom], color: '#81a1c1' },
  { tag: [t.variableName, t.propertyName, t.attributeName], color: '#81a1c1' },
  {
    tag: [
      t.function(t.variableName),
      t.function(t.propertyName)
      // t.functionName
    ],
    color: '#41a9c7'
  },
  { tag: [t.className, t.typeName], color: '#41a9c7' },
  { tag: [t.regexp, t.special(t.string)], color: '#ebcb8b' },
  { tag: [t.punctuation, t.bracket], color: '#81a1c1' }
])

export const setCodeBlock = (ctx: Ctx) => {
  ctx.update(codeBlockConfig.key, (defaultConfig) => ({
    ...defaultConfig,
    languages,
    searchIcon: '',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      // ⛔ remove defaultHighlightStyle; ✅ use our nordHighlight
      syntaxHighlighting(nordHighlight, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap
      ])
    ],
    renderLanguage: (language, selected) =>
      selected ? `✔ ${language}` : language
  }))
}
