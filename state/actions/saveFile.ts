import toast from "react-hot-toast";
import state from '../index';

// Saves the current editor content to global state
export const saveFile = (showToast: boolean = true, activeId?: number) => {
  const editorModels = state.editorCtx?.getModels();
  const sought = '/' + state.files[state.active].name;
  const currentModel = editorModels?.find((editorModel) => {
    return editorModel.uri.path.endsWith(sought);
  });
  const file = state.files[activeId || state.active]
  if (state.files.length > 0) {
    file.content = currentModel?.getValue() || "";
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
