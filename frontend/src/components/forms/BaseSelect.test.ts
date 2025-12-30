import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSelect from './BaseSelect.vue'

describe('BaseSelect', () => {
  it('should render correctly', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: ''
      }
    })

    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('should display label when provided', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        label: '測試標籤'
      }
    })

    expect(wrapper.text()).toContain('測試標籤')
  })

  it('should display required indicator when required is true', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        label: '測試標籤',
        required: true
      }
    })

    expect(wrapper.html()).toContain('*')
  })

  it('should emit update:modelValue on change', async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        options: ['選項1', '選項2', '選項3']
      }
    })

    const select = wrapper.find('select')
    await select.setValue('選項1')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['選項1'])
  })

  it('should display placeholder option', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        placeholder: '請選擇...',
        options: ['選項1', '選項2']
      }
    })

    const select = wrapper.find('select')
    const options = select.findAll('option')
    expect(options[0].text()).toBe('請選擇...')
  })

  it('should render options from options prop', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        options: ['選項1', '選項2', '選項3']
      }
    })

    const select = wrapper.find('select')
    const options = select.findAll('option')
    expect(options.length).toBe(3)
    expect(options[0].text()).toBe('選項1')
    expect(options[1].text()).toBe('選項2')
    expect(options[2].text()).toBe('選項3')
  })

  it('should render object options with default keys', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        options: [
          { value: '1', label: '選項1' },
          { value: '2', label: '選項2' }
        ]
      }
    })

    const select = wrapper.find('select')
    const options = select.findAll('option')
    expect(options.length).toBe(2)
    expect(options[0].text()).toBe('選項1')
    expect(options[1].text()).toBe('選項2')
  })

  it('should render object options with custom keys', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        optionValue: 'id',
        optionLabel: 'name',
        options: [
          { id: '1', name: '選項1' },
          { id: '2', name: '選項2' }
        ]
      }
    })

    const select = wrapper.find('select')
    const options = select.findAll('option')
    expect(options[0].attributes('value')).toBe('1')
    expect(options[0].text()).toBe('選項1')
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const select = wrapper.find('select')
    expect(select.attributes('disabled')).toBeDefined()
  })

  it('should display error message when error is provided', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        error: '這是錯誤訊息'
      }
    })

    expect(wrapper.text()).toContain('這是錯誤訊息')
  })

  it('should display hint when hint is provided and no error', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        hint: '這是提示訊息'
      }
    })

    expect(wrapper.text()).toContain('這是提示訊息')
  })

  it('should not display hint when error is present', () => {
    const wrapper = mount(BaseSelect, {
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
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: ''
      }
    })

    const select = wrapper.find('select')
    await select.trigger('blur')

    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('should emit focus event', async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: ''
      }
    })

    const select = wrapper.find('select')
    await select.trigger('focus')

    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('should apply correct size classes', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        size: 'sm'
      }
    })

    const select = wrapper.find('select')
    const classes = select.classes()
    expect(classes.some(c => c.includes('px-2') || c.includes('py-1') || c.includes('text-sm'))).toBe(true)
  })

  it('should apply error classes when error is present', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: '',
        error: '錯誤'
      }
    })

    const select = wrapper.find('select')
    const classes = select.classes()
    expect(classes.some(c => c.includes('border-red'))).toBe(true)
  })

  it('should use slot content when provided', () => {
    const wrapper = mount(BaseSelect, {
      props: {
        modelValue: ''
      },
      slots: {
        default: '<option value="slot1">Slot Option 1</option><option value="slot2">Slot Option 2</option>'
      }
    })

    const select = wrapper.find('select')
    const options = select.findAll('option')
    expect(options.length).toBe(2)
    expect(options[0].text()).toBe('Slot Option 1')
  })
})
