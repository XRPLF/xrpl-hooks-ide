import { useCallback, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { Select } from ".";
import state, { ILog } from "../state";
import { extractJSON } from "../utils/json";
import LogBox from "./LogBox";

const DebugStream = () => {
  const snap = useSnapshot(state);

  const accountOptions = snap.accounts.map(acc => ({
    label: acc.name,
    value: acc.address,
  }));
  const [selectedAccount, setSelectedAccount] = useState<typeof accountOptions[0] | null>(null);

  const renderNav = () => (
    <>
      <Select
        instanceId="debugStreamAccount"
        placeholder="Select account"
        options={accountOptions}
        hideSelectedOptions
        value={selectedAccount}
        onChange={acc => setSelectedAccount(acc as any)}
        css={{ width: "100%" }}
      />
    </>
  );

  const prepareLog = useCallback((str: any): ILog => {
    if (typeof str !== "string") throw Error("Unrecognized debug log stream!");

    const match = str.match(/([\s\S]+(?:UTC|ISO|GMT[+|-]\d+))\ ?([\s\S]*)/m);
    const [_, time, msg] = match || [];

    const jsonData = extractJSON(msg);
    const timestamp = time ? new Date(time) : undefined;
    const message = !jsonData
      ? msg
      : msg.slice(0, jsonData.start) + msg.slice(jsonData.end + 1);

    return {
      type: "log",
      message,
      timestamp,
      jsonData: jsonData?.result,
    };
  }, []);

  useEffect(() => {
    const account = selectedAccount?.value;
    if (!account) {
      return;
    }
    const socket = new WebSocket(`wss://hooks-testnet-debugstream.xrpl-labs.com/${account}`);

    const onOpen = () => {
      state.debugLogs = [];
      state.debugLogs.push({
        type: "success",
        message: `Debug stream opened for account ${account}`,
      });
    };
    const onError = () => {
      state.debugLogs.push({
        type: "error",
        message: "Something went wrong in establishing connection!",
      });
    };
    const onClose = () => {
      state.debugLogs.push({
        type: "error",
        message: "Connection was closed!",
      });
      setSelectedAccount(null)
    };
    const onMessage = (event: any) => {
      if (!event.data) return;
      state.debugLogs.push(prepareLog(event.data));
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

      socket.close();
    };
  }, [prepareLog, selectedAccount]);

  return (
    <LogBox
      enhanced
      renderNav={renderNav}
      title="Debug stream"
      logs={snap.debugLogs}
      clearLog={() => (state.debugLogs = [])}
    />
  );
};

export default DebugStream;
