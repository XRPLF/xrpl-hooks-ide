import { listen } from "@codingame/monaco-jsonrpc";
import { MonacoServices } from "@codingame/monaco-languageclient";
import Editor, { loader } from "@monaco-editor/react";
import uniqBy from "lodash.uniqby";
import type monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { ArrowBendLeftUp } from "phosphor-react";
import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import ReconnectingWebSocket from "reconnecting-websocket";
import { ref, useSnapshot } from "valtio";
import state from "../state";
import { saveFile } from "../state/actions";
import { apiHeaderFiles } from "../state/constants";
import dark from "../theme/editor/amy.json";
import light from "../theme/editor/xcode_default.json";
import { createLanguageClient, createWebSocket } from "../utils/languageClient";
import docs from "../xrpl-hooks-docs/docs";
import Box from "./Box";
import Container from "./Container";
import EditorNavigation from "./EditorNavigation";
import Text from "./Text";




loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

const validateWritability = (editor: monaco.editor.IStandaloneCodeEditor) => {
  const currPath = editor.getModel()?.uri.path;
  if (apiHeaderFiles.find((h) => currPath?.endsWith(h))) {
    editor.updateOptions({ readOnly: true });
  } else {
    editor.updateOptions({ readOnly: false });
  }
};

let decorations: { [key: string]: string[] } = {};

const setMarkers = (monacoE: typeof monaco) => {
  // Get all the markers that are active at the moment,
  // Also if same error is there twice, we can show the content
  // only once (that's why we're using uniqBy)
  const markers = uniqBy(
    monacoE.editor
      .getModelMarkers({})
      // Filter out the markers that are hooks specific
      .filter(
        (marker) =>
          typeof marker?.code === "string" &&
          // Take only markers that starts with "hooks-"
          marker?.code?.includes("hooks-")
      ),
    "code"
  );

  // Get the active model (aka active file you're editing)
  // const model = monacoE.editor?.getModel(
  //   monacoE.Uri.parse(`file:///work/c/${state.files?.[state.active]?.name}`)
  // );
  // console.log(state.active);
  // Add decoration (aka extra hoverMessages) to markers in the
  // exact same range (location) where the markers are
  const models = monacoE.editor.getModels();
  models.forEach((model) => {
    decorations[model.id] = model?.deltaDecorations(
      decorations?.[model.id] || [],
      markers
        .filter((marker) =>
          marker?.resource.path
            .split("/")
            .includes(`${state.files?.[state.active]?.name}`)
        )
        .map((marker) => ({
          range: new monacoE.Range(
            marker.startLineNumber,
            marker.startColumn,
            marker.endLineNumber,
            marker.endColumn
          ),
          options: {
            hoverMessage: {
              value:
                // Find the related hover message markdown from the
                // /xrpl-hooks-docs/xrpl-hooks-docs-files.json file
                // which was generated from rst files

                (typeof marker.code === "string" &&
                  docs[marker?.code]?.toString()) ||
                "",
              supportHtml: true,
              isTrusted: true,
            },
          },
        }))
    );
  });
};

const HooksEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monaco>();
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
  useEffect(() => {
    if (monacoRef.current) {
      setMarkers(monacoRef.current);
    }
  }, [snap.active]);

  return (
    <Box
      css={{
        flex: 1,
        flexShrink: 1,
        display: "flex",
        position: "relative",
        flexDirection: "column",
        backgroundColor: "$mauve2",
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
          path={`file:///work/c/${snap.files?.[snap.active]?.name}`}
          defaultValue={snap.files?.[snap.active]?.content}
          beforeMount={(monaco) => {
            if (!snap.editorCtx) {
              snap.files.forEach((file) =>
                monaco.editor.createModel(
                  file.content,
                  file.language,
                  monaco.Uri.parse(`file:///work/c/${file.name}`)
                )
              );
            }

            // create the websocket
            if (!subscriptionRef.current) {
              monaco.languages.register({
                id: "c",
                extensions: [".c", ".h"],
                aliases: ["C", "c", "H", "h"],
                mimetypes: ["text/plain"],
              });
              MonacoServices.install(monaco);

              const webSocket: ReconnectingWebSocket = createWebSocket(
                process.env.NEXT_PUBLIC_LANGUAGE_SERVER_API_ENDPOINT || ""
              );
              subscriptionRef.current = webSocket;
              // listen when the websocket is opened
              listen({
                webSocket: webSocket as WebSocket,
                onConnection: (connection) => {
                  // create and start the language client
                  const languageClient = createLanguageClient(connection);
                  const disposable = languageClient.start();
                  connection.onClose(() => {
                    try {
                      // disposable.stop();
                      disposable.dispose();
                    } catch (err) {
                      toast.error('Connection to language server lost!')
                      console.error("Couldn't dispose the language server connection! ", err);
                    }
                  });
                  connection.onDispose(() => {
                    toast.error('Connection to language server lost!')
                  })
                  // TODO: Check if we need to listen to more connection events
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
            monacoRef.current = monaco;
            editor.updateOptions({
              glyphMargin: true,
              lightbulb: {
                enabled: true,
              },
            });
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
              () => {
                saveFile();
              }
            );
            // When the markers (errors/warnings from clangd language server) change
            // Lets improve the markers by adding extra content to them from related
            // md files
            monaco.editor.onDidChangeMarkers(() => {
              if (monacoRef.current) {
                setMarkers(monacoRef.current);
              }
            });

            // Hacky way to hide Peek menu
            editor.onContextMenu((e) => {
              const host =
                document.querySelector<HTMLElement>(".shadow-root-host");

              const contextMenuItems =
                host?.shadowRoot?.querySelectorAll("li.action-item");
              contextMenuItems?.forEach((k) => {
                // If menu item contains "Peek" lets hide it
                if (k.querySelector(".action-label")?.textContent === "Peek") {
                  // @ts-expect-error
                  k["style"].display = "none";
                }
              });
            });

            validateWritability(editor);
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
              <Box
                css={{ pl: "0px", pt: "15px", flex: 1, display: "inline-flex" }}
              >
                <Text
                  css={{
                    fontSize: "14px",
                    maxWidth: "220px",
                    fontFamily: "$monospace",
                  }}
                >
                  Click the link above to create your file
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
