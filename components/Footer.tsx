import { useSnapshot } from "valtio";
import Container from "./Container";
import Box from "./Box";

import LogText from "./LogText";
import { state } from "../state";

const Footer = () => {
  const snap = useSnapshot(state);
  return (
    <Box
      as="footer"
      css={{
        display: "flex",
        borderTop: "1px solid $mauve6",
        background: "$mauve1",
      }}
    >
      <Container css={{ py: "$3", flexShrink: 1 }}>
        <Box
          as="pre"
          css={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "160px",
            fontSize: "13px",
            fontWeight: "$body",
            fontFamily: "$monospace",
            overflowY: "scroll",
            wordWrap: "break-word",
            py: 3,
            px: 3,
            m: 3,
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
      </Container>
    </Box>
  );
};

export default Footer;
