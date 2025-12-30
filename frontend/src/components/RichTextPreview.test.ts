import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RichTextPreview from './RichTextPreview.vue'

// RichTextPreview 會在 runtime 用 createApp 動態掛載這些元件；需要用 module mock 才能攔截
vi.mock('./Diagram2DPreview.vue', () => ({
  default: { name: 'Diagram2DPreview', props: ['data'], template: '<div class="d2">{{ JSON.stringify(data) }}</div>' },
}))
vi.mock('./Diagram3DPreview.vue', () => ({
  default: { name: 'Diagram3DPreview', props: ['data'], template: '<div class="d3">{{ JSON.stringify(data) }}</div>' },
}))
vi.mock('./CircuitPreview.vue', () => ({
  default: { name: 'CircuitPreview', props: ['data'], template: '<div class="circuit">{{ JSON.stringify(data) }}</div>' },
}))
const MathModalStub = { name: 'MathPreviewEditorModal', props: ['latex'], template: '<div />' }
const EmbedModalStub = { name: 'EmbedJsonEditorModal', props: ['title', 'initial', 'previewComponent'], template: '<div />' }

describe('RichTextPreview - embeds', () => {
  it('mounts diagram2d preview from fenced JSON', async () => {
    const content = ['```diagram2d', '{"shapes":[{"type":"point","x":1,"y":2}]}', '```'].join('\n')
    const wrapper = mount(RichTextPreview, {
      props: { content: '' },
      global: {
        stubs: {
          MathPreviewEditorModal: MathModalStub,
          EmbedJsonEditorModal: EmbedModalStub,
        },
      },
    })

    await wrapper.setProps({ content })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.d2').exists()).toBe(true)
    expect(wrapper.find('.d2').text()).toContain('"shapes"')
  })

  it('mounts diagram3d preview from fenced JSON', async () => {
    const content = ['```diagram3d', '{"objects":[{"type":"cube","size":1}]}', '```'].join('\n')
    const wrapper = mount(RichTextPreview, {
      props: { content: '' },
      global: {
        stubs: {
          MathPreviewEditorModal: MathModalStub,
          EmbedJsonEditorModal: EmbedModalStub,
        },
      },
    })

    await wrapper.setProps({ content })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.d3').exists()).toBe(true)
    expect(wrapper.find('.d3').text()).toContain('"objects"')
  })

  it('mounts circuit preview from fenced JSON', async () => {
    const content = ['```circuit', '{"components":[{"type":"resistor","value":"1k"}]}', '```'].join('\n')
    const wrapper = mount(RichTextPreview, {
      props: { content: '' },
      global: {
        stubs: {
          MathPreviewEditorModal: MathModalStub,
          EmbedJsonEditorModal: EmbedModalStub,
        },
      },
    })

    await wrapper.setProps({ content })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.circuit').exists()).toBe(true)
    expect(wrapper.find('.circuit').text()).toContain('"components"')
  })
})

