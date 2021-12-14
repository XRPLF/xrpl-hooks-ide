import React, { useRef, useLayoutEffect } from "react";
import { Notepad, Prohibit } from "phosphor-react";
import useStayScrolled from "react-stay-scrolled";
import NextLink from "next/link";

import Container from "./Container";
import Box from "./Box";
import Flex from "./Flex";
import LogText from "./LogText";
import { ILog } from "../state";
import Text from "./Text";
import Button from "./Button";
import Heading from "./Heading";
import Link from "./Link";

interface ILogBox {
  title: string;
  clearLog?: () => void;
  logs: ILog[];
}

const LogBox: React.FC<ILogBox> = ({ title, clearLog, logs, children }) => {
  const logRef = useRef<HTMLPreElement>(null);
  const { stayScrolled /*, scrollBottom*/ } = useStayScrolled(logRef);

  useLayoutEffect(() => {
    stayScrolled();
  }, [stayScrolled, logs]);

  return (
    <Flex
      as="div"
      css={{
        display: "flex",
        borderTop: "1px solid $mauve6",
        background: "$mauve1",
        position: "relative",
        flex: 1,
      }}
    >
      <Container css={{ px: 0, flexShrink: 1 }}>
        <Flex css={{ py: "$3" }}>
          <Heading
            as="h3"
            css={{
              fontWeight: 300,
              m: 0,
              fontSize: "11px",
              color: "$mauve12",
              px: "$3",
              textTransform: "uppercase",
              alignItems: "center",
              display: "inline-flex",
              gap: "$3",
            }}
          >
            <Notepad size="15px" /> <Text css={{ lineHeight: 1 }}>{title}</Text>
          </Heading>
          <Flex css={{ ml: "auto", gap: "$3", marginRight: "$3" }}>
            {clearLog && (
              <Button ghost size="xs" onClick={clearLog}>
                <Prohibit size="14px" />
              </Button>
            )}
          </Flex>
        </Flex>
        <Box
          as="pre"
          ref={logRef}
          css={{
            margin: 0,
            // display: "inline-block",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "160px",
            fontSize: "13px",
            fontWeight: "$body",
            fontFamily: "$monospace",
            px: "$3",
            pb: "$2",
            whiteSpace: "normal",
            overflowY: "auto",
          }}
        >
          {logs?.map((log, index) => (
            <Box as="span" key={log.type + index}>
              {/* <LogText capitalize variant={log.type}>
                {log.type}:{" "}
              </LogText> */}
              <LogText variant={log.type}>
                {log.message}{" "}
                {log.link && (
                  <NextLink href={log.link} shallow passHref>
                    <Link as="a">{log.linkText}</Link>
                  </NextLink>
                )}
              </LogText>
            </Box>
          ))}
          {children}
        </Box>
      </Container>
    </Flex>
  );
};

export default LogBox;
