import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { Select } from ".";
import state from "../state";
import LogBox from "./LogBox";
import Text from "./Text";

const DebugStream = () => {
  const snap = useSnapshot(state);

  const accountOptions = snap.accounts.map(acc => ({
    label: acc.name,
    value: acc.address,
  }));
  const [selectedAccount, setSelectedAccount] = useState<typeof accountOptions[0] | null>(null);

  const renderNav = () => (
    <>
      <Text css={{ mx: "$2", fontSize: "inherit" }}>Account: </Text>
      <Select
        instanceId="debugStreamAccount"
        placeholder="Select account"
        options={accountOptions}
        hideSelectedOptions
        value={selectedAccount}
        onChange={acc => setSelectedAccount(acc as any)}
        css={{ width: "30%" }}
      />
    </>
  );

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
      setSelectedAccount(null);
    };
    const onMessage = (event: any) => {
      if (!event.data) return;
      state.debugLogs.push({
        type: "log",
        message: event.data,
      });
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onError);
    socket.addEventListener("error", onError);
    socket.addEventListener("message", onMessage);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onError);
      socket.removeEventListener("message", onMessage);

      socket.close();
    };
  }, [selectedAccount]);

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
