import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCheckbox from './BaseCheckbox.vue'

describe('BaseCheckbox', () => {
  it('should render correctly', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false
      }
    })

    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('should display label when provided', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        label: '測試標籤'
      }
    })

    expect(wrapper.text()).toContain('測試標籤')
  })

  it('should be checked when modelValue is true', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: true
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('should be unchecked when modelValue is false', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
  })

  it('should emit update:modelValue when checkbox is clicked', async () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('should emit false when unchecking', async () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: true
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(false)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        disabled: true
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect(checkbox.attributes('disabled')).toBeDefined()
  })

  it('should apply correct size classes for sm', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        size: 'sm'
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    const classes = checkbox.classes()
    expect(classes.some(c => c.includes('h-3'))).toBe(true)
    expect(classes.some(c => c.includes('w-3'))).toBe(true)
  })

  it('should apply correct size classes for md', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        size: 'md'
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    const classes = checkbox.classes()
    expect(classes.some(c => c.includes('h-4'))).toBe(true)
    expect(classes.some(c => c.includes('w-4'))).toBe(true)
  })

  it('should apply correct size classes for lg', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        size: 'lg'
      }
    })

    const checkbox = wrapper.find('input[type="checkbox"]')
    const classes = checkbox.classes()
    expect(classes.some(c => c.includes('h-5'))).toBe(true)
    expect(classes.some(c => c.includes('w-5'))).toBe(true)
  })

  it('should render slot content', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false
      },
      slots: {
        default: '<span>自訂內容</span>'
      }
    })

    expect(wrapper.text()).toContain('自訂內容')
  })

  it('should not display label when label is empty', () => {
    const wrapper = mount(BaseCheckbox, {
      props: {
        modelValue: false,
        label: ''
      }
    })

    expect(wrapper.find('label').exists()).toBe(false)
  })
})
