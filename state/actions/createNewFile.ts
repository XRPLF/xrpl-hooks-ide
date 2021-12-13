import state, { IFile } from '../index';

export const createNewFile = (name: string) => {
  const emptyFile: IFile = { name, language: "c", content: "" };
  state.files.push(emptyFile);
  state.active = state.files.length - 1;
};