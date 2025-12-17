import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { defineAsyncComponent } from 'vue'

const CircuitEditorComponent = defineAsyncComponent(() => import('./CircuitEditor.vue'))

export const CircuitExtension = Node.create({
  name: 'circuit',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      circuit_data: {
        default: {},
      },
      backup_image: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="circuit"]',
        getAttrs: (node) => {
          return {
            circuit_data: JSON.parse(node.getAttribute('data-circuit-data') || '{}'),
            backup_image: node.getAttribute('data-backup-image') || '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'circuit',
      'data-circuit-data': JSON.stringify(HTMLAttributes.circuit_data),
      'data-backup-image': HTMLAttributes.backup_image,
    }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(CircuitEditorComponent)
  },

  addCommands() {
    return {
      setCircuit: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
