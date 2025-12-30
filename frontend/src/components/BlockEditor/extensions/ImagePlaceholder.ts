import { Node, type NodeConfig } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImagePlaceholderComponent from '../components/ImagePlaceholderComponent.vue'

/**
 * Image Placeholder 節點的屬性類型
 */
export interface ImagePlaceholderAttributes {
  id: string | null
  filename: string
  alt: string
  originalPath: string
}

/**
 * Image Placeholder 節點的默認屬性
 */
const defaultAttributes: ImagePlaceholderAttributes = {
  id: null,
  filename: '',
  alt: '',
  originalPath: ''
}

/**
 * Image Placeholder 節點擴展
 */
export const ImagePlaceholder = Node.create<NodeConfig<ImagePlaceholderAttributes>, ImagePlaceholderAttributes>({
  name: 'imagePlaceholder',

  group: 'block',

  atom: true,

  addAttributes(): Record<keyof ImagePlaceholderAttributes, any> {
    return {
      id: {
        default: defaultAttributes.id,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: ImagePlaceholderAttributes) => {
          return attributes.id ? { 'data-id': attributes.id } : {}
        }
      },
      filename: {
        default: defaultAttributes.filename,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-filename') || '',
        renderHTML: (attributes: ImagePlaceholderAttributes) => {
          return attributes.filename ? { 'data-filename': attributes.filename } : {}
        }
      },
      alt: {
        default: defaultAttributes.alt,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-alt') || '',
        renderHTML: (attributes: ImagePlaceholderAttributes) => {
          return attributes.alt ? { 'data-alt': attributes.alt } : {}
        }
      },
      originalPath: {
        default: defaultAttributes.originalPath,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-original-path') || '',
        renderHTML: (attributes: ImagePlaceholderAttributes) => {
          return attributes.originalPath ? { 'data-original-path': attributes.originalPath } : {}
        }
      }
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
