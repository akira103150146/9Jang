import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  it('should render correctly', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('should display label when provided', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        label: '測試標籤'
      }
    })

    expect(wrapper.text()).toContain('測試標籤')
  })

  it('should display required indicator when required is true', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        label: '測試標籤',
        required: true
      }
    })

    expect(wrapper.html()).toContain('*')
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.setValue('測試輸入')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['測試輸入'])
  })

  it('should display placeholder', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        placeholder: '請輸入...'
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('請輸入...')
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
  })

  it('should display error message when error is provided', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        error: '這是錯誤訊息'
      }
    })

    expect(wrapper.text()).toContain('這是錯誤訊息')
  })

  it('should display hint when hint is provided and no error', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        hint: '這是提示訊息'
      }
    })

    expect(wrapper.text()).toContain('這是提示訊息')
  })

  it('should not display hint when error is present', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        error: '錯誤訊息',
        hint: '提示訊息'
      }
    })

    expect(wrapper.text()).toContain('錯誤訊息')
    expect(wrapper.text()).not.toContain('提示訊息')
  })

  it('should emit blur event', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('should emit focus event', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('should support different input types', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        type: 'email'
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('email')
  })

  it('should apply correct size classes', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        size: 'sm'
      }
    })

    const input = wrapper.find('input')
    const classes = input.classes()
    // 檢查是否包含 sm 尺寸相關的類
    expect(classes.some(c => c.includes('px-2') || c.includes('py-1') || c.includes('text-sm'))).toBe(true)
  })

  it('should apply error classes when error is present', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        error: '錯誤'
      }
    })

    const input = wrapper.find('input')
    const classes = input.classes()
    expect(classes.some(c => c.includes('border-red'))).toBe(true)
  })
})
