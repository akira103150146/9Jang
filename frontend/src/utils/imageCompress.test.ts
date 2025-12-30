import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { compressImageFile, type ImageCompressOptions } from './imageCompress'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('imageCompress', () => {
  let mockImage: HTMLImageElement
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    // Mock Image
    mockImage = {
      width: 2000,
      height: 2000,
      onload: null,
      onerror: null,
      src: ''
    } as unknown as HTMLImageElement

    // Mock Canvas
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn()
    } as unknown as HTMLCanvasElement

    // Mock Context
    mockContext = {
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D

    mockCanvas.getContext = vi.fn(() => mockContext)
    mockCanvas.toBlob = vi.fn((callback) => {
      const blob = new Blob(['compressed'], { type: 'image/jpeg' })
      callback?.(blob)
    })

    // Mock document.createElement
    global.document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any
      }
      if (tagName === 'img') {
        return mockImage as any
      }
      return {} as any
    })

    // Mock Image constructor
    global.Image = vi.fn(() => mockImage) as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return original file if not a File instance', async () => {
    const notAFile = { name: 'test.txt' } as any
    const result = await compressImageFile(notAFile)
    expect(result).toBe(notAFile)
  })

  it('should return original file if not an image', async () => {
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' })
    const result = await compressImageFile(textFile)
    expect(result).toBe(textFile)
  })

  it('should compress image file successfully', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })

    // Simulate image load
    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    const result = await compressImageFile(imageFile)

    expect(global.Image).toHaveBeenCalled()
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    expect(mockContext.drawImage).toHaveBeenCalled()
    expect(mockCanvas.toBlob).toHaveBeenCalled()
  })

  it('should use default options', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    await compressImageFile(imageFile)

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.82
    )
  })

  it('should use custom options', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })

    const options: ImageCompressOptions = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.5,
      mimeType: 'image/png'
    }

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    await compressImageFile(imageFile, options)

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      0.5
    )
  })

  it('should return original file if compression fails', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })

    mockCanvas.getContext = vi.fn(() => null)

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    const result = await compressImageFile(imageFile)

    expect(result).toBe(imageFile)
  })

  it('should return original file if blob is null', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })

    mockCanvas.toBlob = vi.fn((callback) => {
      callback?.(null)
    })

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    const result = await compressImageFile(imageFile)

    expect(result).toBe(imageFile)
  })

  it('should return original file if compressed size is larger', async () => {
    const smallContent = 'small'
    const imageFile = new File([smallContent], 'test.jpg', { type: 'image/jpeg' })

    const largeContent = new Array(2000).fill('a').join('')
    const largeBlob = new Blob([largeContent], { type: 'image/jpeg' })

    mockCanvas.toBlob = vi.fn((callback) => {
      callback?.(largeBlob)
    })

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    const result = await compressImageFile(imageFile)

    // If compressed blob is larger than original, should return original
    expect(result).toBe(imageFile)
  })

  it('should change file extension to .jpg', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.png', { type: 'image/png' })

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    const result = await compressImageFile(imageFile)

    expect(result.name).toBe('test.jpg')
  })

  it('should handle image load error', async () => {
    const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' })

    setTimeout(() => {
      if (mockImage.onerror) {
        mockImage.onerror({} as any)
      }
    }, 0)

    await expect(compressImageFile(imageFile)).rejects.toBeDefined()
  })

  it('should scale down large images', async () => {
    const largeContent = new Array(1000000).fill('a').join('')
    const imageFile = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })

    mockImage.width = 3000
    mockImage.height = 2000

    const options: ImageCompressOptions = {
      maxWidth: 1500,
      maxHeight: 1000
    }

    setTimeout(() => {
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }
    }, 0)

    await compressImageFile(imageFile, options)

    // Should scale to fit max dimensions
    expect(mockCanvas.width).toBeLessThanOrEqual(1500)
    expect(mockCanvas.height).toBeLessThanOrEqual(1000)
  })
})
