import { useRef, useLayoutEffect, ReactNode, FC, useState } from "react";
import { Notepad, Prohibit } from "phosphor-react";
import useStayScrolled from "react-stay-scrolled";
import NextLink from "next/link";

import Container from "./Container";
import LogText from "./LogText";
import { ILog } from "../state";
import { Code, Link, Heading, Button, Text, Flex, Box } from ".";

interface ILogBox {
  title: string;
  clearLog?: () => void;
  logs: ILog[];
  renderNav?: () => ReactNode;
  enhanced?: boolean;
}

const LogBox: FC<ILogBox> = ({ title, clearLog, logs, children, renderNav, enhanced }) => {
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
        height: "100%",
      }}
    >
      <Container
        css={{
          px: 0,
          height: "100%",
        }}
      >
        <Flex
          fluid
          css={{
            height: "48px",
            alignItems: "center",
            fontSize: "$sm",
            fontWeight: 300,
          }}
        >
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
          <Flex
            row
            align="center"
            css={{
              width: "50%", // TODO make it max without breaking layout!
            }}
          >
            {renderNav?.()}
          </Flex>
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
            height: "calc(100% - 48px)", // 100% minus the logbox header height
            overflowY: "auto",
            fontSize: "13px",
            fontWeight: "$body",
            fontFamily: "$monospace",
            px: "$3",
            pb: "$2",
            whiteSpace: "normal",
          }}
        >
          {logs?.map((log, index) => (
            <Box
              as="span"
              key={log.type + index}
              css={{
                "@hover": {
                  "&:hover": {
                    backgroundColor: enhanced ? "$backgroundAlt" : undefined,
                  },
                },
                p: enhanced ? "$1" : undefined,
              }}
            >
              <Log {...log} />
            </Box>
          ))}
          {children}
        </Box>
      </Container>
    </Flex>
  );
};

export const Log: FC<ILog> = ({
  type,
  timestamp,
  message,
  link,
  linkText,
  defaultCollapsed,
  jsonData,
}) => {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  return (
    <LogText variant={type}>
      {timestamp && <Text muted>{timestamp.toLocaleTimeString()} </Text>}
      {message}{" "}
      {link && (
        <NextLink href={link} shallow passHref>
          <Link as="a">{linkText}</Link>
        </NextLink>
      )}
      {jsonData && (
        <Link onClick={() => setExpanded(!expanded)} as="a">
          {expanded ? "Collapse" : "Expand"}
        </Link>
      )}
      {expanded && jsonData && <Code>{JSON.stringify(jsonData, null, 2)}</Code>}
    </LogText>
  );
};

export default LogBox;
