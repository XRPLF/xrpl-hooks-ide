import React from "react";
import dynamic from "next/dynamic";
import { Flex, Box } from "../../components";
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
      <main style={{ display: "flex", flex: 1, height: 'calc(100vh - 30vh - 60px)' }}>
        <DeployEditor />
      </main>
      <Flex css={{ flexDirection: "row", width: "100%", minHeight: '225px', height: '30vh' }}>
        <Box css={{ width: "100%" }}>
          <Accounts />
        </Box>
        <Box css={{ width: "100%" }}>
          <LogBox
            title="Deploy Log"
            logs={snap.deployLogs}
            clearLog={() => (state.deployLogs = [])}
          />
        </Box>
      </Flex>
    </>
  );
};

export default Deploy;
