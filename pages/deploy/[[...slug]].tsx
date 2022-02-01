import React from "react";
import dynamic from "next/dynamic";
import { useSnapshot } from "valtio";
import state from "../../state";
import Split from "react-split";

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
    <Split
      direction="vertical"
      sizes={[40, 60]}
      style={{ height: "calc(100vh - 60px)" }}
    >
      <main style={{ display: "flex", flex: 1, position: "relative" }}>
        <DeployEditor />
      </main>
      <Split
        direction="horizontal"
        sizes={[50, 50]}
        minSize={[320, 160]}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{ alignItems: "stretch", display: "flex" }}>
          <Accounts />
        </div>
        <div>
          <LogBox
            title="Deploy Log"
            logs={snap.deployLogs}
            clearLog={() => (state.deployLogs = [])}
          />
        </div>
      </Split>
    </Split>
  );
};

export default Deploy;
