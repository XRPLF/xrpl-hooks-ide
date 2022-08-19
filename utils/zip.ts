import JSZip, { JSZipFileOptions } from 'jszip'
import { saveAs } from 'file-saver'

interface File {
  name: string
  content: any
  options?: JSZipFileOptions
}

interface Zipped {
  saveFile: (filename: string) => void
  data: Blob
}

export const createZip = async (files: File[]): Promise<Zipped> => {
  const zip = new JSZip()

  files.forEach(({ name, content, options }) => {
    zip.file(name, content, options)
  })

  const data = await zip.generateAsync({ type: 'blob' })

  return {
    saveFile: (filename: string) => saveAs(data, filename),
    data
  }
}
