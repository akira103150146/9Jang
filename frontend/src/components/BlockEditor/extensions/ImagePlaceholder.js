import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImagePlaceholderComponent from '../components/ImagePlaceholderComponent.vue'

export const ImagePlaceholder = Node.create({
  name: 'imagePlaceholder',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      filename: { default: '' },
      alt: { default: '' },
      originalPath: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-placeholder"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'image-placeholder', ...HTMLAttributes }]
  },

  addNodeView() {
    return VueNodeViewRenderer(ImagePlaceholderComponent)
  }
})
