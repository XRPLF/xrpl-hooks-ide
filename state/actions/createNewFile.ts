import state, { IFile } from '../index';

/* Initializes empty file to global state */
export const createNewFile = (name: string) => {
  const emptyFile: IFile = { name, language: "c", content: "" };
  state.files.push(emptyFile);
  state.active = state.files.length - 1;
};