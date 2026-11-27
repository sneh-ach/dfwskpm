/** Compress an image file to a data URL suitable for local CMS preview storage. */
export async function fileToDataUrl(
  file: File,
  opts: { maxWidth?: number; quality?: number } = {},
): Promise<string> {
  const maxWidth = opts.maxWidth ?? 1400
  const quality = opts.quality ?? 0.82

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process image.')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', quality)
}
