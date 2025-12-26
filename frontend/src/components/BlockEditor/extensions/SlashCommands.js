import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import SlashMenu from '../components/SlashMenu.vue'
import { commandItems } from '../utils/commandItems'

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      isHandoutMode: false,
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query, editor }) => {
          // 從 editor 獲取 Extension 實例
          // #region agent log
          let isHandoutMode = false
          try {
            if (editor && editor.extensionManager) {
              const ext = editor.extensionManager.extensions.find(e => e.name === 'slashCommands')
              if (ext && ext.options) {
                isHandoutMode = ext.options.isHandoutMode || false
              }
            }
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SlashCommands.js:items',message:'SlashCommands items 被調用',data:{query,isHandoutMode,hasEditor:!!editor,hasExtensionManager:!!editor?.extensionManager},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          } catch (e) {
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SlashCommands.js:items',message:'獲取 isHandoutMode 失敗',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          }
          // #endregion
          
          const filteredItems = commandItems.filter(item => {
            // 講義模式下隱藏分頁符號命令（講義模式只依賴紙張大小自動分頁）
            if (isHandoutMode && item.title === '分頁') {
              return false
            }
            
            const searchQuery = query.toLowerCase()
            return (
              item.title.toLowerCase().includes(searchQuery) ||
              item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
            )
          })
          
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SlashCommands.js:items',message:'過濾後的命令列表',data:{totalItems:commandItems.length,filteredCount:filteredItems.length,query,isHandoutMode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          return filteredItems
        },
        render: () => {
          let component
          let popup

          return {
            onStart: (props) => {
              component = new VueRenderer(SlashMenu, {
                props: {
                  items: props.items,
                  command: (item) => {
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
                editor: props.editor,
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
                placement: 'bottom-start',
              })
            },

            onUpdate(props) {
              component.updateProps({
                items: props.items,
              })

              if (!props.clientRect) {
                return
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              })
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }

              return component.ref?.onKeyDown(props.event)
            },

            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
