import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Play } from "phosphor-react";
import Hotkeys from "react-hot-keys";
import Split from "react-split";
import { useSnapshot } from "valtio";
import Box from "../../components/Box";
import Button from "../../components/Button";
import state from "../../state";
import { compileCode } from "../../state/actions";
import { getSplit, saveSplit } from "../../state/actions/persistSplits";


const HooksEditor = dynamic(() => import("../../components/HooksEditor"), {
  ssr: false,
});

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});

const Home: NextPage = () => {
  const snap = useSnapshot(state);

  return (
    <Split
      direction="vertical"
      sizes={getSplit("developVertical") || [70, 30]}
      minSize={[100, 100]}
      gutterAlign="center"
      gutterSize={4}
      style={{ height: "calc(100vh - 60px)" }}
      onDragEnd={(e) => saveSplit("developVertical", e)}
    >
      <main style={{ display: "flex", flex: 1, position: "relative" }}>
        <HooksEditor />
        {snap.files[snap.active]?.name?.split(".")?.[1].toLowerCase() ===
          "c" && (
          <Hotkeys
            keyName="command+b,ctrl+b"
            onKeyDown={() =>
              !snap.compiling && snap.files.length && compileCode(snap.active)
            }
          >
            <Button
              variant="primary"
              uppercase
              disabled={!snap.files.length}
              isLoading={snap.compiling}
              onClick={() => compileCode(snap.active)}
              css={{
                position: "absolute",
                bottom: "$4",
                left: "$4",
                alignItems: "center",
                display: "flex",
                cursor: "pointer",
              }}
            >
              <Play weight="bold" size="16px" />
              Compile to Wasm
            </Button>
          </Hotkeys>
        )}
      </main>
      <Box
        css={{
          display: "flex",
          background: "$mauve1",
          position: "relative",
        }}
      >
        <LogBox
          title="Development Log"
          clearLog={() => (state.logs = [])}
          logs={snap.logs}
        />
      </Box>
    </Split>
  );
};

export default Home;
