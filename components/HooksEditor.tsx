/** @jsxImportSource theme-ui */
import { useRef } from "react";
import { useSnapshot } from "valtio";
import Editor from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { useColorMode } from "@theme-ui/color-modes";
import { Button, Box } from "theme-ui";
import { ArrowRight } from "phosphor-react";

import { state } from "../state";
import dark from "../theme/editor/amy.json";
import light from "../theme/editor/xcode_default.json";

const HooksEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [mode, setColorMode] = useColorMode();
  const snap = useSnapshot(state);
  return (
    <Box sx={{ flex: 1, display: "flex", position: "relative" }}>
      <Editor
        defaultLanguage={snap.files?.[snap.active]?.language}
        path={snap.files?.[snap.active]?.name}
        defaultValue={snap.files?.[snap.active]?.content}
        beforeMount={(monaco) => {
          // @ts-expect-error
          monaco.editor.defineTheme("dark", dark);
          // @ts-expect-error
          monaco.editor.defineTheme("light", light);
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          editor.updateOptions({
            minimap: {
              enabled: false,
            },
          });
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            () => {
              if (
                state.files &&
                state.files.length > 0 &&
                state.files[snap.active]
              ) {
                console.log(
                  `File ${snap.files[snap.active].name} saved successfully ✅`
                );
                state.files[snap.active].content = editor.getValue();
              }
            }
          );
        }}
        theme={mode === "dark" ? "dark" : "light"}
        wrapperProps={{ style: { display: "flex", flex: 1 } }}
      />
      <Button
        sx={{
          position: "absolute",
          bottom: 1,
          left: 3,
          alignItems: "center",
          display: "flex",
          cursor: "pointer",
        }}
      >
        Compile{" "}
        <ArrowRight sx={{ mb: "0px", ml: 2 }} weight="bold" size="20px" />
      </Button>
    </Box>
  );
};

export default HooksEditor;
