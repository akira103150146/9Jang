import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { debounce, type DebouncedFunction } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should delay function execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous call if called again before delay', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    vi.advanceTimersByTime(50)
    debouncedFn()
    vi.advanceTimersByTime(50)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to debounced function', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('arg1', 'arg2', 123)
    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should handle multiple rapid calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()
    debouncedFn()
    debouncedFn()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should execute function after delay for each call sequence', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)

    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should return a function with correct type', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    expect(typeof debouncedFn).toBe('function')
    expect(debouncedFn).toBeInstanceOf(Function)
  })

  it('should handle different wait times', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    const debouncedFn1 = debounce(mockFn1, 50)
    const debouncedFn2 = debounce(mockFn2, 200)

    debouncedFn1()
    debouncedFn2()

    vi.advanceTimersByTime(50)
    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).not.toHaveBeenCalled()

    vi.advanceTimersByTime(150)
    expect(mockFn2).toHaveBeenCalledTimes(1)
  })
})
