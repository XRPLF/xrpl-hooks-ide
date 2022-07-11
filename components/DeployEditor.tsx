import React, { useState } from "react";
import { useSnapshot, ref } from "valtio";

import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import NextLink from "next/link";
import ReactTimeAgo from "react-time-ago";
import filesize from "filesize";

import Box from "./Box";
import Container from "./Container";
import state from "../state";
import wat from "../utils/wat-highlight";

import EditorNavigation from "./EditorNavigation";
import { Button, Text, Link, Flex } from ".";
import Monaco from "./Monaco";

const FILESIZE_BREAKPOINTS: [number, number] = [2 * 1024, 5 * 1024];

const DeployEditor = () => {
  const snap = useSnapshot(state);
  const router = useRouter();
  const { theme } = useTheme();

  const [showContent, setShowContent] = useState(false);

  const activeFile = snap.files[snap.active]?.compiledContent
    ? snap.files[snap.active]
    : snap.files.filter(file => file.compiledContent)[0];
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
      {activeFile.compiledContent?.byteLength &&
        activeFile.compiledContent?.byteLength >= 64000 && (
          <Flex css={{ flexDirection: "column", py: "$3", pb: "$1" }}>
            <Text css={{ ml: "$2", color: "$error" }}>
              File size is larger than 64kB, cannot set hook!
            </Text>
          </Flex>
        )}
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
    snap.files?.filter(file => file.compiledWatContent).length > 0 &&
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
          <Monaco
            className="hooks-editor"
            defaultLanguage={"wat"}
            language={"wat"}
            path={`file://tmp/c/${activeFile?.name}.wat`}
            value={activeFile?.compiledWatContent || ""}
            beforeMount={monaco => {
              monaco.languages.register({ id: "wat" });
              monaco.languages.setLanguageConfiguration("wat", wat.config);
              monaco.languages.setMonarchTokensProvider("wat", wat.tokens);
            }}
            onMount={editor => {
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
