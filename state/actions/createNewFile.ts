import { getFileExtention } from '../../utils/helpers'
import state, { IFile, ILang } from '../index'

const languageMapping: Record<string, ILang | undefined> = {
  ts: 'ts',
  js: 'javascript',
  md: 'markdown',
  c: 'c',
  h: 'c',
  txt: 'text'
}

export const createNewFile = (name: string) => {
  const ext = getFileExtention(name) || ''

  const emptyFile: IFile = { name, language: languageMapping[ext] || 'text', content: '' }
  state.files.push(emptyFile)
  state.active = state.files.length - 1
}

export const renameFile = (oldName: string, nwName: string) => {
  const file = state.files.find(file => file.name === oldName)
  if (!file) throw Error(`No file exists with name ${oldName}`)

  const ext = getFileExtention(nwName) || ''
  const language = languageMapping[ext] || 'text'
  file.name = nwName
  file.language = language
}
