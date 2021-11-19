import React, { useEffect, useRef } from "react";
import { useSnapshot, ref } from "valtio";
import Editor from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { Play } from "phosphor-react";
import { useTheme } from "next-themes";

import Box from "./Box";
import Button from "./Button";
import dark from "../theme/editor/amy.json";
import light from "../theme/editor/xcode_default.json";
import { compileCode, saveFile, state } from "../state";

import EditorNavigation from "./EditorNavigation";
import Spinner from "./Spinner";

const HooksEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const snap = useSnapshot(state);
  const { theme } = useTheme();
  // useEffect(() => {
  //   if (snap.editorCtx) {
  //     snap.editorCtx.getModels().forEach((model) => {
  //       // console.log(model.id,);
  //       snap.editorCtx?.createModel(model.getValue(), "c", model.uri);
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  console.log("reinit");
  return (
    <Box
      css={{
        flex: 1,
        flexShrink: 1,
        display: "flex",
        position: "relative",
        flexDirection: "column",
        backgroundColor: "$slate3",
        width: "100%",
      }}
    >
      <EditorNavigation />
      <Editor
        keepCurrentModel
        // defaultLanguage={snap.files?.[snap.active]?.language}
        path={snap.files?.[snap.active]?.name}
        // defaultValue={snap.files?.[snap.active]?.content}
        beforeMount={(monaco) => {
          if (!state.editorCtx) {
            state.editorCtx = ref(monaco.editor);
            // @ts-expect-error
            monaco.editor.defineTheme("dark", dark);
            // @ts-expect-error
            monaco.editor.defineTheme("light", light);
          }
        }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          // hook editor to global state
          editor.updateOptions({
            minimap: {
              enabled: false,
            },
            ...snap.editorSettings,
          });
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            () => {
              saveFile(editor.getValue());
            }
          );
        }}
        theme={theme === "dark" ? "dark" : "light"}
      />
      <Button
        variant="primary"
        uppercase
        onClick={() => compileCode(snap.active)}
        disabled={snap.compiling}
        css={{
          position: "absolute",
          bottom: "$4",
          left: "$4",
          alignItems: "center",
          display: "flex",
          cursor: "pointer",
        }}
      >
        <Play weight="bold" size="16px" />
        Compile to Wasm
        {snap.compiling && <Spinner />}
      </Button>
    </Box>
  );
};

export default HooksEditor;
