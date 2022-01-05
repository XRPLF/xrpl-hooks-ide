import { Container, Flex, Box, Tabs, Tab, Input, Select, Text, Button } from "../../components";
import { Play } from "phosphor-react";
import dynamic from "next/dynamic";

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});
const Accounts = dynamic(() => import("../../components/Accounts"), {
  ssr: false,
});

const Transaction = () => {
  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
    {
      value: "long",
      label: "lorem woy uiwyf wyfw8 fwfw98f w98fy wf8fw89f 9w8fy w9fyw9f wf7tdw9f ",
    },
  ];
  return (
    <>
      <Container css={{ p: "$3 0", fontSize: "$sm" }}>
        <Flex column fluid>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              Transaction type:{" "}
            </Text>
            <Select
              instanceId="transaction"
              placeholder="Select transaction type"
              css={{ width: "70%" }}
              options={options}
            />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              From account:{" "}
            </Text>
            <Select
              instanceId="from-account"
              placeholder="Select account from which to send from"
              css={{ width: "70%" }}
              options={options}
            />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              Amount (XRP):{" "}
            </Text>
            <Input defaultValue="0" variant="deep" css={{ width: "70%", flex: "inherit", height: "$9" }} />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              To account:{" "}
            </Text>
            <Select
              instanceId="to-account"
              placeholder="Select account from which to send from"
              css={{ width: "70%" }}
              options={options}
            />
          </Flex>
        </Flex>
      </Container>
      <Flex row css={{ justifyContent: "space-between" }}>
        <Button outline>VIEW AS JSON</Button>
        <Flex row>
          <Button outline css={{ mr: "$3" }}>
            RESET
          </Button>
          <Button variant="primary">
            <Play weight="bold" size="16px" />
            RUN TEST
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

const Test = () => {
  return (
    <Container css={{ py: "$3", px: 0 }}>
      <Flex row fluid css={{ justifyContent: 'center', mb: "$2", height: '40vh', minHeight: '300px', p: '$3 $2' }}>
        <Box css={{ width: "60%", px: "$2", maxWidth: '800px' }}>
          <Tabs>
            {/* TODO Dynamic tabs */}
            <Tab header="test1.json">
              <Transaction />
            </Tab>
            <Tab header="test2.json">
              <Transaction />
            </Tab>
          </Tabs>
        </Box>
        <Box css={{ width: "40%", mx: "$2", height: '100%', maxWidth: '750px' }}>
          <Accounts card hideDeployBtn showHookStats />
        </Box>
      </Flex>

      <Flex row fluid css={{ borderBottom: "1px solid $mauve8" }}>
        <Box css={{ width: "50%", borderRight: "1px solid $mauve8" }}>
          <LogBox title="From Log" logs={[]} clearLog={() => {}} />
        </Box>
        <Box css={{ width: "50%" }}>
          <LogBox title="To Log" logs={[]} clearLog={() => {}} />
        </Box>
      </Flex>
    </Container>
  );
};

export default Test;
