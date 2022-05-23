import {
  useRef,
  useLayoutEffect,
  ReactNode,
  FC,
  useState,
  useCallback,
} from "react";
import { Notepad, Prohibit } from "phosphor-react";
import useStayScrolled from "react-stay-scrolled";
import NextLink from "next/link";

import Container from "./Container";
import LogText from "./LogText";
import state, { ILog } from "../state";
import { Pre, Link, Heading, Button, Text, Flex, Box } from ".";
import regexifyString from "regexify-string";
import { useSnapshot } from "valtio";
import { AccountDialog } from "./Accounts";

interface ILogBox {
  title: string;
  clearLog?: () => void;
  logs: ILog[];
  renderNav?: () => ReactNode;
  enhanced?: boolean;
  children?: React.ReactNode;
}

const LogBox: FC<ILogBox> = ({
  title,
  clearLog,
  logs,
  children,
  renderNav,
  enhanced,
}) => {
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
                my: enhanced ? "$1" : undefined,
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
  timestring,
  message: _message,
  link,
  linkText,
  defaultCollapsed,
  jsonData: _jsonData,
}) => {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const { accounts } = useSnapshot(state);
  const [dialogAccount, setDialogAccount] = useState<string | null>(null);

  const enrichAccounts = useCallback(
    (str?: string): ReactNode => {
      if (!str || !accounts.length) return null;

      const pattern = `(${accounts.map((acc) => acc.address).join("|")})`;
      const res = regexifyString({
        pattern: new RegExp(pattern, "gim"),
        decorator: (match, idx) => {
          const name = accounts.find((acc) => acc.address === match)?.name;
          return (
            <Link
              key={match + idx}
              as="a"
              onClick={() => setDialogAccount(match)}
              title={match}
              highlighted
            >
              {name || match}
            </Link>
          );
        },
        input: str,
      });

      return <>{res}</>;
    },
    [accounts]
  );

  let message: ReactNode;
  
  if (typeof _message === 'string') {
    _message = _message.trim().replace(/\n /gi, "\n");
    message = enrichAccounts(_message)
  }
  else {
    message = _message
  }

  const jsonData = enrichAccounts(_jsonData);

  return (
    <>
      <AccountDialog
        setActiveAccountAddress={setDialogAccount}
        activeAccountAddress={dialogAccount}
      />
      <LogText variant={type}>
        {timestring && (
          <Text muted monospace>
            {timestring}{" "}
          </Text>
        )}
        <Pre>{message} </Pre>
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
        {expanded && jsonData && <Pre block>{jsonData}</Pre>}
      </LogText>
      <br />
    </>
  );
};

export default LogBox;
