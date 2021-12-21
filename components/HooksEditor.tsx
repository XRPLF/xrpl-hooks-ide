import React, { useEffect, useRef } from "react";
import { useSnapshot, ref } from "valtio";
import Editor, { loader } from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { ArrowBendLeftUp } from "phosphor-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";

import Box from "./Box";
import Container from "./Container";
import dark from "../theme/editor/amy.json";
import light from "../theme/editor/xcode_default.json";
import { saveFile } from "../state/actions";
import { apiHeaderFiles } from "../state/constants";
import state from "../state";

import EditorNavigation from "./EditorNavigation";
import Text from "./Text";
import { MonacoServices } from "@codingame/monaco-languageclient";
import { createLanguageClient, createWebSocket } from "../utils/languageClient";
import { listen } from "@codingame/monaco-jsonrpc";
import ReconnectingWebSocket from "reconnecting-websocket";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

const validateWritability = (editor: monaco.editor.IStandaloneCodeEditor) => {
  const currPath = editor.getModel()?.uri.path;
  if (apiHeaderFiles.find(h => currPath?.endsWith(h))) {
    editor.updateOptions({ readOnly: true });
  } else {
    editor.updateOptions({ readOnly: false });
  }
};

const HooksEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const subscriptionRef = useRef<ReconnectingWebSocket | null>(null);
  const snap = useSnapshot(state);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (editorRef.current) validateWritability(editorRef.current);
  }, [snap.active]);

  useEffect(() => {
    return () => {
      subscriptionRef?.current?.close();
    };
  }, []);
  return (
    <Box
      css={{
        flex: 1,
        flexShrink: 1,
        display: "flex",
        position: "relative",
        flexDirection: "column",
        backgroundColor: "$mauve3",
        width: "100%",
      }}
    >
      <EditorNavigation />
      {snap.files.length > 0 && router.isReady ? (
        <Editor
          className="hooks-editor"
          keepCurrentModel
          defaultLanguage={snap.files?.[snap.active]?.language}
          language={snap.files?.[snap.active]?.language}
          path={`file://tmp/c/${snap.files?.[snap.active]?.name}`}
          defaultValue={snap.files?.[snap.active]?.content}
          beforeMount={monaco => {
            if (!snap.editorCtx) {
              snap.files.forEach(file =>
                monaco.editor.createModel(
                  file.content,
                  file.language,
                  monaco.Uri.parse(`file://tmp/c/${file.name}`)
                )
              );
            }

            // monaco.editor.createModel(value, 'c', monaco.Uri.parse('file:///tmp/c/file.c'))
            // create the web socket
            if (!subscriptionRef.current) {
              monaco.languages.register({
                id: "c",
                extensions: [".c", ".h"],
                aliases: ["C", "c", "H", "h"],
                mimetypes: ["text/plain"],
              });
              MonacoServices.install(monaco);
              const webSocket = createWebSocket(
                process.env.NEXT_PUBLIC_LANGUAGE_SERVER_API_ENDPOINT || ""
              );
              subscriptionRef.current = webSocket;
              // listen when the web socket is opened
              listen({
                webSocket: webSocket as WebSocket,
                onConnection: connection => {
                  // create and start the language client
                  const languageClient = createLanguageClient(connection);
                  const disposable = languageClient.start();
                  connection.onClose(() => {
                    try {
                      // disposable.stop();
                      disposable.dispose();
                    } catch (err) {
                      console.log("err", err);
                    }
                  });
                },
              });
            }

            // // hook editor to global state
            // editor.updateOptions({
            //   minimap: {
            //     enabled: false,
            //   },
            //   ...snap.editorSettings,
            // });
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
            editor.updateOptions({
              glyphMargin: true,
              lightbulb: {
                enabled: true,
              },
            });
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              saveFile();
            });
            validateWritability(editor)
          }}
          theme={theme === "dark" ? "dark" : "light"}
        />
      ) : (
        <Container>
          {!snap.loading && router.isReady && (
            <Box
              css={{
                flexDirection: "row",
                width: "$spaces$wide",
                gap: "$3",
                display: "inline-flex",
              }}
            >
              <Box css={{ display: "inline-flex", pl: "35px" }}>
                <ArrowBendLeftUp size={30} />
              </Box>
              <Box css={{ pl: "0px", pt: "15px", flex: 1, display: "inline-flex" }}>
                <Text
                  css={{
                    fontSize: "14px",
                    maxWidth: "220px",
                    fontFamily: "$monospace",
                  }}
                >
                  Click the link above to create a your file
                </Text>
              </Box>
            </Box>
          )}
        </Container>
      )}
    </Box>
  );
};

export default HooksEditor;
