import { Label } from "@radix-ui/react-label";
import { Switch, SwitchThumb } from "../../components/Switch";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Gear, Play } from "phosphor-react";
import Hotkeys from "react-hot-keys";
import Split from "react-split";
import { useSnapshot } from "valtio";
import { ButtonGroup, Flex } from "../../components";
import Box from "../../components/Box";
import Button from "../../components/Button";
import Popover from "../../components/Popover";
import state from "../../state";
import { compileCode } from "../../state/actions";
import { getSplit, saveSplit } from "../../state/actions/persistSplits";

const HooksEditor = dynamic(() => import("../../components/HooksEditor"), {
  ssr: false,
});

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});

const CompilerSettings = () => {
  const snap = useSnapshot(state);
  return (
    <Flex css={{ minWidth: 200, flexDirection: "column", gap: "$5" }}>
      <Box>
        <Label>Optimization level</Label>
        <ButtonGroup css={{ mt: "$2", fontFamily: "$monospace" }}>
          <Button
            css={{ fontFamily: "$monospace" }}
            outline={snap.compileOptions.optimisationLevel !== "-O0"}
            onClick={() => (state.compileOptions.optimisationLevel = "-O0")}
          >
            -O0
          </Button>
          <Button
            css={{ fontFamily: "$monospace" }}
            outline={snap.compileOptions.optimisationLevel !== "-O1"}
            onClick={() => (state.compileOptions.optimisationLevel = "-O1")}
          >
            -O1
          </Button>
          <Button
            css={{ fontFamily: "$monospace" }}
            outline={snap.compileOptions.optimisationLevel !== "-O2"}
            onClick={() => (state.compileOptions.optimisationLevel = "-O2")}
          >
            -O2
          </Button>
          <Button
            css={{ fontFamily: "$monospace" }}
            outline={snap.compileOptions.optimisationLevel !== "-O3"}
            onClick={() => (state.compileOptions.optimisationLevel = "-O3")}
          >
            -O3
          </Button>
          <Button
            css={{ fontFamily: "$monospace" }}
            outline={snap.compileOptions.optimisationLevel !== "-O4"}
            onClick={() => (state.compileOptions.optimisationLevel = "-O4")}
          >
            -O4
          </Button>
          <Button
            css={{ fontFamily: "$monospace" }}
            outline={snap.compileOptions.optimisationLevel !== "-Os"}
            onClick={() => (state.compileOptions.optimisationLevel = "-Os")}
          >
            -Os
          </Button>
        </ButtonGroup>
      </Box>
      <Flex css={{ flexDirection: "column" }}>
        <Label>Clean code</Label>
        <Switch
          css={{ mt: "$2" }}
          checked={snap.compileOptions.strip}
          onCheckedChange={(checked) => {
            console.log(checked);
            state.compileOptions.strip = checked;
          }}
        >
          <SwitchThumb />
        </Switch>
      </Flex>
    </Flex>
  );
};

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
            <Flex
              css={{
                position: "absolute",
                bottom: "$4",
                left: "$4",
                alignItems: "center",
                display: "flex",
                cursor: "pointer",
                gap: "$2",
              }}
            >
              <Button
                variant="primary"
                uppercase
                disabled={!snap.files.length}
                isLoading={snap.compiling}
                onClick={() => compileCode(snap.active)}
              >
                <Play weight="bold" size="16px" />
                Compile to Wasm
              </Button>
              <Popover content={<CompilerSettings />}>
                <Button variant="primary" css={{ px: "10px" }}>
                  <Gear size="16px" />
                </Button>
              </Popover>
            </Flex>
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
