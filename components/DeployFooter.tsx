import React, { useRef, useLayoutEffect } from "react";
import { useSnapshot } from "valtio";
import { Play, Prohibit } from "phosphor-react";
import useStayScrolled from "react-stay-scrolled";

import Container from "./Container";
import Box from "./Box";
import LogText from "./LogText";
import { compileCode, state } from "../state";
import Button from "./Button";
import Heading from "./Heading";

const Footer = () => {
  const snap = useSnapshot(state);
  const logRef = useRef<HTMLPreElement>(null);
  const { stayScrolled /*, scrollBottom*/ } = useStayScrolled(logRef);

  useLayoutEffect(() => {
    stayScrolled();
  }, [snap.logs, stayScrolled]);

  return (
    <Box
      as="footer"
      css={{
        display: "flex",
        borderTop: "1px solid $mauve6",
        background: "$mauve1",
        position: "relative",
      }}
    >
      <Container css={{ py: "$3", flexShrink: 1 }}>
        <Heading
          as="h3"
          css={{ fontWeight: 300, m: 0, fontSize: "11px", color: "$mauve9" }}
        >
          DEVELOPMENT LOG
        </Heading>
        <Button
          ghost
          size="xs"
          css={{
            position: "absolute",
            right: "$3",
            top: "$2",
            color: "$mauve10",
          }}
          onClick={() => {
            state.logs = [];
          }}
        >
          <Prohibit size="14px" />
        </Button>
        <Box
          as="pre"
          ref={logRef}
          css={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "160px",
            fontSize: "13px",
            fontWeight: "$body",
            fontFamily: "$monospace",
            overflowY: "auto",
            wordWrap: "break-word",
            py: 3,
          }}
        >
          {snap.logs?.map((log, index) => (
            <Box as="span" key={log.type + index}>
              <LogText capitalize variant={log.type}>
                {log.type}:{" "}
              </LogText>
              <LogText>{log.message}</LogText>
            </Box>
          ))}
        </Box>
        <Button
          variant="primary"
          uppercase
          disabled={!snap.files.length}
          isLoading={snap.compiling}
          onClick={() => compileCode(snap.active)}
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
        </Button>
      </Container>
    </Box>
  );
};

export default Footer;
