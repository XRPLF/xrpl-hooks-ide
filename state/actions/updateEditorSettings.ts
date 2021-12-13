import state, { IState } from '../index';

export const updateEditorSettings = (
  editorSettings: IState["editorSettings"]
) => {
  state.editorCtx?.getModels().forEach((model) => {
    model.updateOptions({
      ...editorSettings,
    });
  });
  return (state.editorSettings = editorSettings);
};