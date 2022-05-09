import toast from "react-hot-toast";
import state from '../index';

// Saves the current editor content to global state
export const saveFile = (showToast: boolean = true) => {
  const editorModels = state.editorCtx?.getModels();
  const sought = '/' + state.files[state.active].name;
  const currentModel = editorModels?.find((editorModel) => {
    return editorModel.uri.path.endsWith(sought);
  });
  if (state.files.length > 0) {
    state.files[state.active].content = currentModel?.getValue() || "";
  }
  if (showToast) {
    toast.success("Saved successfully", { position: "bottom-center" });
  }
};

export const saveAllFiles = () => {
  const editorModels = state.editorCtx?.getModels();
  state.files.forEach(file => {
    const currentModel = editorModels?.find(model => model.uri.path.endsWith('/' + file.name))
    if (currentModel) {
      file.content = currentModel?.getValue() || '';
    }
  })
}
