import Editor, { loader } from "@monaco-editor/react";
import { FC, useMemo } from 'react';
import { useTheme } from "next-themes";

import dark from "../../theme/editor/amy.json";
import light from "../../theme/editor/xcode_default.json";
import { useSnapshot } from 'valtio';
import state from '../../state';

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

interface JsonProps {
  prepareOptions?: () => any
}

export const TxJson: FC<JsonProps> = ({ prepareOptions }) => {
  const { editorSettings } = useSnapshot(state);

  const { theme } = useTheme();

  const value = useMemo(() => {
    return JSON.stringify(
      prepareOptions?.() || {},
      null,
      editorSettings.tabSize
    );
  }, [editorSettings.tabSize, prepareOptions])

  return (
    <Editor
      className="hooks-editor"
      language={"json"}
      height="calc(100% - 45px)"
      beforeMount={monaco => {
        monaco.editor.defineTheme("dark", dark as any);
        monaco.editor.defineTheme("light", light as any);
      }}
      value={value}
      onMount={(editor, monaco) => {
        editor.updateOptions({
          minimap: { enabled: false },
          glyphMargin: true,
          tabSize: editorSettings.tabSize,
          dragAndDrop: true,
          fontSize: 14,
          readOnly: true,
        });
      }}
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
};
