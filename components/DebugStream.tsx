import { useCallback, useEffect } from "react";
import { proxy, ref, useSnapshot } from "valtio";
import { Select } from ".";
import state, { ILog, transactionsState } from "../state";
import { extractJSON } from "../utils/json";
import LogBox from "./LogBox";

interface ISelect<T = string> {
  label: string;
  value: T;
}

export interface IStreamState {
  selectedAccount: ISelect | null;
  status: "idle" | "opened" | "closed";
  statusChangeTimestamp?: number;
  logs: ILog[];
  socket?: WebSocket;
}

export const streamState = proxy<IStreamState>({
  selectedAccount: null as ISelect | null,
  status: "idle",
  logs: [] as ILog[],
});

const DebugStream = () => {
  const { selectedAccount, logs, socket } = useSnapshot(streamState);
  const { activeHeader: activeTxTab } = useSnapshot(transactionsState);
  const { accounts } = useSnapshot(state);

  const accountOptions = accounts.map(acc => ({
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
        onChange={acc => (streamState.selectedAccount = acc as any)}
        css={{ width: "100%" }}
      />
    </>
  );

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

  const onMount = useCallback(async () => {
    // deliberately using `proxy` values and not the `useSnapshot` ones to have no dep list
    const acc = streamState.selectedAccount;
    const status = streamState.status;

    if (status === "opened" && acc) {
      // fetch the missing ones
      try {
        const url = `https://${process.env.NEXT_PUBLIC_DEBUG_STREAM_URL}/recent/${acc?.value}`;

        // TODO Remove after api sets cors properly
        const res = await fetch("/api/proxy", {
          method: "POST",
          body: JSON.stringify({ url }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) return;

        const body = await res.json();

        if (!body?.logs) return;

        const start = streamState.statusChangeTimestamp || 0;
        streamState.logs = [];
        pushLog(`Debug stream opened for account ${acc.value}`, {
          type: "success",
        });

        const logs = Object.entries(body.logs).filter(([tm]) => +tm >= start);

        logs.forEach(([tm, log]) => pushLog(log));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    onMount();
  }, [onMount]);

  useEffect(() => {
    const account = selectedAccount?.value;
    const socket = streamState.socket;
    if (!socket) return;

    const onOpen = () => {
      streamState.logs = [];
      streamState.status = "opened";
      streamState.statusChangeTimestamp = Date.now();
      pushLog(`Debug stream opened for account ${account}`, {
        type: "success",
      });
    };
    const onError = () => {
      pushLog("Something went wrong! Check your connection and try again.", {
        type: "error",
      });
    };
    const onClose = (e: CloseEvent) => {
      pushLog(`Connection was closed. [code: ${e.code}]`, {
        type: "error",
      });
      streamState.selectedAccount = null;
      streamState.status = "closed";
      streamState.statusChangeTimestamp = Date.now();
    };
    const onMessage = (event: any) => {
      pushLog(event.data);
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
  }, [selectedAccount?.value, socket]);

  useEffect(() => {
    const account = transactionsState.transactions.find(
      tx => tx.header === activeTxTab
    )?.state.selectedAccount;

    if (account && account.value !== streamState.selectedAccount?.value)
      streamState.selectedAccount = account;
  }, [activeTxTab]);

  const clearLog = () => {
    streamState.logs = [];
    streamState.statusChangeTimestamp = Date.now();
  };

  return (
    <LogBox
      enhanced
      renderNav={renderNav}
      title="Debug stream"
      logs={logs}
      clearLog={clearLog}
    />
  );
};

export default DebugStream;

export const pushLog = (
  str: any,
  opts: Partial<Pick<ILog, "type">> = {}
): ILog | undefined => {
  if (!str) return;
  if (typeof str !== "string") throw Error("Unrecognized debug log stream!");

  const match = str.match(/([\s\S]+(?:UTC|ISO|GMT[+|-]\d+))?\ ?([\s\S]*)/m);
  const [_, tm, msg] = match || [];

  const timestamp = Date.parse(tm || "") || undefined;
  const timestring = !timestamp ? tm : new Date(timestamp).toLocaleTimeString();

  const extracted = extractJSON(msg);
  const message = !extracted
    ? msg
    : msg.slice(0, extracted.start) + msg.slice(extracted.end + 1);

  const jsonData = extracted
    ? JSON.stringify(extracted.result, null, 2)
    : undefined;

  if (extracted?.result?.id?._Request?.includes("hooks-builder-req")) {
    return;
  }

  const { type = "log" } = opts;
  const log: ILog = {
    type,
    message,
    timestring,
    jsonData,
    defaultCollapsed: true,
  };

  if (log) streamState.logs.push(log);
  return log;
};
