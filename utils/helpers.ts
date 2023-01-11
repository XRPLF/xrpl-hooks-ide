interface File {
  name: string
}

export const guessZipFileName = (files: File[]) => {
  let parts = (files.filter(f => f.name.endsWith('.c'))[0]?.name || 'hook').split('.')
  parts = parts.length > 1 ? parts.slice(0, -1) : parts
  return parts.join('')
}

export const capitalize = (value?: string) => {
  if (!value) return ''

  return value[0].toLocaleUpperCase() + value.slice(1)
}

export const getFileExtention = (filename?: string): string | undefined => {
  if (!filename) return
  const ext = (filename.includes('.') && filename.split('.').pop()) || undefined
  return ext
}

export const getFileNamePart = (filename?: string): string | undefined => {
  if (!filename) return
  const name = (filename.includes('.') && filename.split('.').slice(0, -1).join(".")) || filename
  return name
}
