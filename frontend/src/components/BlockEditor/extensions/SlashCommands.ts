import { Extension, type ExtensionConfig } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import type { Instance } from 'tippy.js'
import tippy from 'tippy.js'
import SlashMenu from '../components/SlashMenu.vue'
import { commandItems } from '../utils/commandItems'

/**
 * 命令項類型
 */
export interface CommandItem {
  title: string
  keywords: string[]
  command: (options: { editor: any; range: any }) => void
  close?: boolean
}

/**
 * Slash Commands 擴展配置選項
 */
export interface SlashCommandsOptions {
  isHandoutMode?: boolean
  suggestion?: {
    char: string
    startOfLine: boolean
    items: (options: { query: string; editor: any }) => CommandItem[]
    render: () => {
      onStart: (props: any) => void
      onUpdate: (props: any) => void
      onKeyDown: (props: any) => boolean
      onExit: () => void
    }
  }
}

/**
 * Slash Commands 擴展
 */
export const SlashCommands = Extension.create<SlashCommandsOptions, ExtensionConfig>({
  name: 'slashCommands',

  addOptions(): SlashCommandsOptions {
    return {
      isHandoutMode: false,
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query, editor }: { query: string; editor: any }): CommandItem[] => {
          // 從 editor 獲取 Extension 實例
          let isHandoutMode = false
          try {
            if (editor && editor.extensionManager) {
              const ext = editor.extensionManager.extensions.find(
                (e: { name: string }) => e.name === 'slashCommands'
              )
              if (ext && ext.options) {
                isHandoutMode = ext.options.isHandoutMode || false
              }
            }
          } catch (e) {
            // 忽略錯誤，使用默認值
          }

          const filteredItems = commandItems.filter((item: CommandItem) => {
            // 講義模式下隱藏分頁符號命令（講義模式只依賴紙張大小自動分頁）
            if (isHandoutMode && item.title === '分頁') {
              return false
            }

            const searchQuery = query.toLowerCase()
            return (
              item.title.toLowerCase().includes(searchQuery) ||
              item.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery))
            )
          })

          return filteredItems
        },
        render: () => {
          let component: VueRenderer | null = null
          let popup: Instance[] | null = null

          return {
            onStart: (props: {
              items: CommandItem[]
              editor: any
              range: any
              clientRect?: () => DOMRect
            }) => {
              component = new VueRenderer(SlashMenu, {
                props: {
                  items: props.items,
                  command: (item: CommandItem) => {
                    if (item.close) {
                      // 只是關閉選單
                      return
                    }

                    item.command({
                      editor: props.editor,
                      range: props.range
                    })
                  }
                },
                editor: props.editor
              })

              if (!props.clientRect) {
                return
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start'
              }) as Instance[]
            },

            onUpdate: (props: { items: CommandItem[]; clientRect?: () => DOMRect }) => {
              if (component) {
                component.updateProps({
                  items: props.items
                })
              }

              if (!props.clientRect || !popup || popup.length === 0) {
                return
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect
              })
            },

            onKeyDown: (props: { event: KeyboardEvent }): boolean => {
              if (props.event.key === 'Escape') {
                if (popup && popup.length > 0) {
                  popup[0].hide()
                }
                return true
              }

              return component?.ref?.onKeyDown(props.event) || false
            },

            onExit: () => {
              if (popup && popup.length > 0) {
                popup[0].destroy()
              }
              if (component) {
                component.destroy()
              }
            }
          }
        }
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})
