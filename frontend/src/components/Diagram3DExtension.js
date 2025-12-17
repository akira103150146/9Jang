import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { defineAsyncComponent } from 'vue'

const Math3DViewerComponent = defineAsyncComponent(() => import('./Math3DViewer.vue'))

export const Diagram3DExtension = Node.create({
  name: 'diagram3D',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      diagram_data: {
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
        tag: 'div[data-type="diagram-3d"]',
        getAttrs: (node) => {
          return {
            diagram_data: JSON.parse(node.getAttribute('data-diagram-data') || '{}'),
            backup_image: node.getAttribute('data-backup-image') || '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'diagram-3d',
      'data-diagram-data': JSON.stringify(HTMLAttributes.diagram_data),
      'data-backup-image': HTMLAttributes.backup_image,
    }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(Math3DViewerComponent)
  },

  addCommands() {
    return {
      setDiagram3D: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})
