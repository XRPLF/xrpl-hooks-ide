import state, { IFile } from '../index'

const languageMapping = {
  ts: 'typescript',
  js: 'javascript',
  md: 'markdown',
  c: 'c',
  h: 'c',
  other: ''
} /* Initializes empty file to global state */
export const createNewFile = (name: string) => {
  const tempName = name.split('.')
  const fileExt = tempName[tempName.length - 1] || 'other'
  const emptyFile: IFile = {
    name,
    language: languageMapping[fileExt as 'ts' | 'js' | 'md' | 'c' | 'h' | 'other'],
    content: ''
  }
  state.files.push(emptyFile)
  state.active = state.files.length - 1
}

export const renameFile = (oldName: string, nwName: string) => {
  const file = state.files.find(file => file.name === oldName)
  if (!file) throw Error(`No file exists with name ${oldName}`)

  file.name = nwName
}
