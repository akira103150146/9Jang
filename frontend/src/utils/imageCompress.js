export async function compressImageFile(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options

  if (!(file instanceof File)) return file
  if (!file.type?.startsWith('image/')) return file

  const img = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = URL.createObjectURL(file)
  })

  const { width: w, height: h } = img
  const scale = Math.min(1, maxWidth / w, maxHeight / h)
  const targetW = Math.max(1, Math.round(w * scale))
  const targetH = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, targetW, targetH)

  URL.revokeObjectURL(img.src)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
  if (!blob) return file

  // 若壓縮後反而更大，就回傳原檔
  if (blob.size >= file.size) return file

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: mimeType })
}

