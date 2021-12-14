import state, { IState } from '../index';

// Updates editor settings and stores them
// in global state
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