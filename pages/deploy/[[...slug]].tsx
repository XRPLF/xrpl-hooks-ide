import React from "react";
import dynamic from "next/dynamic";
import Flex from "../../components/Flex";
import { useSnapshot } from "valtio";
import state from "../../state";

const DeployEditor = dynamic(() => import("../../components/DeployEditor"), {
  ssr: false,
});

const Accounts = dynamic(() => import("../../components/Accounts"), {
  ssr: false,
});

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});

const Deploy = () => {
  const snap = useSnapshot(state);
  return (
    <>
      <main style={{ display: "flex", flex: 1 }}>
        <DeployEditor />
      </main>
      <Flex css={{ flexDirection: "row", width: "100%" }}>
        <Accounts />
        <LogBox
          title="Deploy Log"
          logs={snap.deployLogs}
          clearLog={() => (state.deployLogs = [])}
        />
      </Flex>
    </>
  );
};

export default Deploy;
