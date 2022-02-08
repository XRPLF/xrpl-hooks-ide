import React, { useRef } from "react";
import { useSnapshot, ref } from "valtio";
import Editor, { loader } from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import NextLink from "next/link";

import Box from "./Box";
import Container from "./Container";
import dark from "../theme/editor/amy.json";
import light from "../theme/editor/xcode_default.json";
import state from "../state";

import EditorNavigation from "./EditorNavigation";
import Text from "./Text";
import Link from "./Link";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

const DeployEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const snap = useSnapshot(state);
  const router = useRouter();
  const { theme } = useTheme();
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
      {snap.files?.filter((file) => file.compiledWatContent).length > 0 &&
      router.isReady ? (
        <Editor
          className="hooks-editor"
          // keepCurrentModel
          defaultLanguage={snap.files?.[snap.active]?.language}
          language={snap.files?.[snap.active]?.language}
          path={`file://tmp/c/${snap.files?.[snap.active]?.name}.wat`}
          value={snap.files?.[snap.active]?.compiledWatContent || ""}
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
            editor.updateOptions({
              glyphMargin: true,
              readOnly: true,
            });
          }}
          theme={theme === "dark" ? "dark" : "light"}
        />
      ) : (
        <Container
          css={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!snap.loading && router.isReady && (
            <Text
              css={{
                mt: "-60px",
                fontSize: "14px",
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
          )}
        </Container>
      )}
    </Box>
  );
};

export default DeployEditor;
