import dynamic from "next/dynamic";
import Split from "react-split";
import { useSnapshot } from "valtio";
import { Box, Container, Flex, Tab, Tabs } from "../../components";
import Transaction from "../../components/Transaction";
import state from "../../state";
import { getSplit, saveSplit } from "../../state/actions/persistSplits";
import { transactionsState, modifyTransaction } from "../../state";

const DebugStream = dynamic(() => import("../../components/DebugStream"), {
  ssr: false,
});

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});
const Accounts = dynamic(() => import("../../components/Accounts"), {
  ssr: false,
});

const Test = () => {
  const { transactionLogs } = useSnapshot(state);
  const { transactions, activeHeader } = useSnapshot(transactionsState);

  return (
    <Container css={{ px: 0 }}>
      <Split
        direction="vertical"
        sizes={getSplit("testVertical") || [50, 50]}
        gutterSize={4}
        gutterAlign="center"
        style={{ height: "calc(100vh - 60px)" }}
        onDragEnd={e => saveSplit("testVertical", e)}
      >
        <Flex
          row
          fluid
          css={{
            justifyContent: "center",
            p: "$3 $2",
          }}
        >
          <Split
            direction="horizontal"
            sizes={getSplit("testHorizontal") || [50, 50]}
            minSize={[180, 320]}
            gutterSize={4}
            gutterAlign="center"
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
            }}
            onDragEnd={e => saveSplit("testHorizontal", e)}
          >
            <Box css={{ width: "55%", px: "$2" }}>
              <Tabs
                activeHeader={activeHeader}
                // TODO make header a required field
                onChangeActive={(idx, header) => {
                  if (header) transactionsState.activeHeader = header;
                }}
                keepAllAlive
                forceDefaultExtension
                defaultExtension=".json"
                onCreateNewTab={header => modifyTransaction(header, {})}
                onCloseTab={(idx, header) =>
                  header && modifyTransaction(header, undefined)
                }
              >
                {transactions.map(({ header, state }) => (
                  <Tab key={header} header={header}>
                    <Transaction
                      state={state}
                      header={header}
                    />
                  </Tab>
                ))}
              </Tabs>
            </Box>
            <Box css={{ width: "45%", mx: "$2", height: "100%" }}>
              <Accounts card hideDeployBtn showHookStats />
            </Box>
          </Split>
        </Flex>

        <Flex row fluid>
          <Split
            direction="horizontal"
            sizes={[50, 50]}
            minSize={[320, 160]}
            gutterSize={4}
            gutterAlign="center"
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
            }}
          >
            <Box
              css={{
                borderRight: "1px solid $mauve8",
                height: "100%",
              }}
            >
              <LogBox
                title="Development Log"
                logs={transactionLogs}
                clearLog={() => (state.transactionLogs = [])}
              />
            </Box>
            <Box css={{ height: "100%" }}>
              <DebugStream />
            </Box>
          </Split>
        </Flex>
      </Split>
    </Container>
  );
};

export default Test;
