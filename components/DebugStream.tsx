import { useCallback, useEffect } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import { Select } from ".";
import state, { ILog } from "../state";
import { extractJSON } from "../utils/json";
import LogBox from "./LogBox";

interface ISelect<T = string> {
  label: string;
  value: T;
}

const streamState = proxy({
  selectedAccount: null as ISelect | null,
  logs: [] as ILog[],
  socket: undefined as WebSocket | undefined,
});

const DebugStream = () => {
  const { selectedAccount, logs, socket } = useSnapshot(streamState);
  const { accounts } = useSnapshot(state);

  const accountOptions = accounts.map((acc) => ({
    label: acc.name,
    value: acc.address,
  }));

  const renderNav = () => (
    <>
      <Select
        instanceId="DSAccount"
        placeholder="Select account"
        options={accountOptions}
        hideSelectedOptions
        value={selectedAccount}
        onChange={(acc) => (streamState.selectedAccount = acc as any)}
        css={{ width: "100%" }}
      />
    </>
  );

  const prepareLog = useCallback((str: any): ILog => {
    if (typeof str !== "string") throw Error("Unrecognized debug log stream!");

    const match = str.match(/([\s\S]+(?:UTC|ISO|GMT[+|-]\d+))\ ?([\s\S]*)/m);
    const [_, tm, msg] = match || [];

    const extracted = extractJSON(msg);
    const timestamp = isNaN(Date.parse(tm || ""))
      ? tm
      : new Date(tm).toLocaleTimeString();

    const message = !extracted
      ? msg
      : msg.slice(0, extracted.start) + msg.slice(extracted.end + 1);

    const jsonData = extracted
      ? JSON.stringify(extracted.result, null, 2)
      : undefined;
    return {
      type: "log",
      message,
      timestamp,
      jsonData,
      defaultCollapsed: true,
    };
  }, []);

  useEffect(() => {
    const account = selectedAccount?.value;
    if (account && (!socket || !socket.url.endsWith(account))) {
      socket?.close();
      streamState.socket = ref(
        new WebSocket(
          `wss://${process.env.NEXT_PUBLIC_DEBUG_STREAM_URL}/${account}`
        )
      );
    } else if (!account && socket) {
      socket.close();
      streamState.socket = undefined;
    }
  }, [selectedAccount?.value, socket]);

  useEffect(() => {
    const account = selectedAccount?.value;
    const socket = streamState.socket;
    if (!socket) return;

    const onOpen = () => {
      streamState.logs = [];
      streamState.logs.push({
        type: "success",
        message: `Debug stream opened for account ${account}`,
      });
    };
    const onError = () => {
      streamState.logs.push({
        type: "error",
        message: "Something went wrong! Check your connection and try again.",
      });
    };
    const onClose = (e: CloseEvent) => {
      streamState.logs.push({
        type: "error",
        message: `Connection was closed. [code: ${e.code}]`,
      });
      streamState.selectedAccount = null;
    };
    const onMessage = (event: any) => {
      if (!event.data) return;
      const log = prepareLog(event.data);
      // Filter out account_info and account_objects requests
      try {
        const parsed = JSON.parse(log.jsonData);
        if (parsed.id.includes("hooks-builder-req")) {
          return;
        }
      } catch (err) {
        // Lets just skip if we cannot parse the message
      }
      return streamState.logs.push(log);
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);
    socket.addEventListener("message", onMessage);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("message", onMessage);
      socket.removeEventListener("error", onError);
    };
  }, [prepareLog, selectedAccount?.value, socket]);
  return (
    <LogBox
      enhanced
      renderNav={renderNav}
      title="Debug stream"
      logs={logs}
      clearLog={() => (streamState.logs = [])}
    />
  );
};

export default DebugStream;
