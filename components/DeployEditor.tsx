import React, { useRef, useState } from "react";
import { useSnapshot, ref } from "valtio";
import Editor, { loader } from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import NextLink from "next/link";
import ReactTimeAgo from "react-time-ago";
import filesize from "filesize";

import Box from "./Box";
import Container from "./Container";
import dark from "../theme/editor/amy.json";
import light from "../theme/editor/xcode_default.json";
import state from "../state";
import wat from "../utils/wat-highlight";

import EditorNavigation from "./EditorNavigation";
import { Button, Text, Link, Flex } from ".";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

const FILESIZE_BREAKPOINTS: [number, number] = [2 * 1024, 5 * 1024];

const DeployEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const snap = useSnapshot(state);
  const router = useRouter();
  const { theme } = useTheme();

  const [showContent, setShowContent] = useState(false);

  const activeFile = snap.files[snap.active];
  const compiledSize = activeFile?.compiledContent?.byteLength || 0;
  const color =
    compiledSize > FILESIZE_BREAKPOINTS[1]
      ? "$error"
      : compiledSize > FILESIZE_BREAKPOINTS[0]
      ? "$warning"
      : "$success";

  const CompiledStatView = activeFile && (
    <Flex
      column
      align="center"
      css={{
        fontSize: "$sm",
        fontFamily: "$monospace",
        textAlign: "center",
      }}
    >
      <Flex row align="center">
        <Text css={{ mr: "$1" }}>
          Compiled {activeFile.name.split(".")[0] + ".wasm"}
        </Text>
        {activeFile?.lastCompiled && (
          <ReactTimeAgo date={activeFile.lastCompiled} locale="en-US" />
        )}
        {activeFile.compiledContent?.byteLength && (
          <Text css={{ ml: "$2", color }}>
            ({filesize(activeFile.compiledContent.byteLength)})
          </Text>
        )}
      </Flex>
      <Button variant="link" onClick={() => setShowContent(true)}>
        View as WAT-file
      </Button>
    </Flex>
  );
  const NoContentView = !snap.loading && router.isReady && (
    <Text
      css={{
        mt: "-60px",
        fontSize: "$sm",
        fontFamily: "$monospace",
        maxWidth: "300px",
        textAlign: "center",
      }}
    >
      {`You haven't compiled any files yet, compile files on `}
      <NextLink shallow href={`/develop/${router.query.slug}`} passHref>
        <Link as="a">develop view</Link>
      </NextLink>
    </Text>
  );
  const isContent =
    snap.files?.filter((file) => file.compiledWatContent).length > 0 &&
    router.isReady;
  return (
    <Box
      css={{
        flex: 1,
        display: "flex",
        position: "relative",
        flexDirection: "column",
        backgroundColor: "$mauve2",
        width: "100%",
      }}
    >
      <EditorNavigation showWat />
      <Container
        css={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!isContent ? (
          NoContentView
        ) : !showContent ? (
          CompiledStatView
        ) : (
          <Editor
            className="hooks-editor"
            defaultLanguage={"wat"}
            language={"wat"}
            path={`file://tmp/c/${snap.files?.[snap.active]?.name}.wat`}
            value={snap.files?.[snap.active]?.compiledWatContent || ""}
            beforeMount={(monaco) => {
              monaco.languages.register({ id: "wat" });
              monaco.languages.setLanguageConfiguration("wat", wat.config);
              monaco.languages.setMonarchTokensProvider("wat", wat.tokens);
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
                readOnly: true,
              });
            }}
            theme={theme === "dark" ? "dark" : "light"}
          />
        )}
      </Container>
    </Box>
  );
};

export default DeployEditor;
