import { Container, Flex, Box, Tabs, Tab, Input, Select, Text, Button } from "../../components";
import { Play } from "phosphor-react";
import dynamic from "next/dynamic";
import { getTransactionTypes } from "../../utils/getTransactionTypes";
import { useQuery } from "react-query";
import { useSnapshot } from "valtio";
import state from "../../state";
import { sendTransaction } from "../../state/actions";
import { useCallback, useState } from "react";

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});
const Accounts = dynamic(() => import("../../components/Accounts"), {
  ssr: false,
});

// type SelectOption<T> = { value: T, label: string };

const Transaction = () => {
  const snap = useSnapshot(state);
  const {
    data: typesData,
    isLoading: typesDataLoading,
    isError: typesDataError,
  } = useQuery("transactionTypes", getTransactionTypes);

  const transactionsOptions =
    typesData
      ?.map(tt => ({
        value: tt.transactionType,
        label: tt.transactionType,
      }))
      .filter(opt => Boolean(opt.value)) || [];
  const [selectedTransaction, setSelectedTransaction] = useState<
    typeof transactionsOptions[0] | null
  >(null);

  const accountOptions = snap.accounts.map(acc => ({
    label: acc.name,
    value: acc.address,
  }));
  const [selectedAccount, setSelectedAccount] = useState<typeof accountOptions[0] | null>(null);

  const destAccountOptions = snap.accounts
    .map(acc => ({
      label: acc.name,
      value: acc.address,
    }))
    .filter(acc => acc.value !== selectedAccount?.value);
  const [selectedDestAccount, setSelectedDestAccount] = useState<
    typeof destAccountOptions[0] | null
  >(null);

  const [txOptions, setTxOptions] = useState({
    Amount: "0",
  });
  const [txIsLoading, setTxIsLoading] = useState(false)
  // const [txIsError, setTxIsError] = useState<string | null>(null)
  const submitTest = useCallback(async () => {
    const account = snap.accounts.find(acc => acc.address === selectedAccount?.value);
    const TransactionType = selectedTransaction?.value;
    if (!account || !TransactionType || txIsLoading) return;

    setTxIsLoading(true)
    // setTxIsError(null)
    const { Amount, ...opts } = txOptions
    await sendTransaction(account, {
      TransactionType,
      Destination: selectedDestAccount?.value,
      Amount: +Amount ? +Amount * 1000000 + "" : undefined, // convert xrp to ...
      ...opts,
    });

    setTxIsLoading(false)
    // TODO catch error for UI to show
  }, [selectedAccount, selectedDestAccount, selectedTransaction, snap.accounts, txOptions, txIsLoading]);

  return (
    <>
      <Container css={{ p: "$3 0", fontSize: "$sm" }}>
        <Flex column fluid>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              Transaction type:{" "}
            </Text>
            <Select
              instanceId="transactionsType"
              placeholder="Select transaction type"
              isLoading={typesDataLoading}
              isDisabled={typesDataError}
              options={transactionsOptions}
              hideSelectedOptions
              css={{ width: "70%" }}
              value={selectedTransaction}
              onChange={tt => setSelectedTransaction(tt as any)}
            />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              From account:{" "}
            </Text>
            <Select
              instanceId="from-account"
              placeholder="Select your account"
              css={{ width: "70%" }}
              options={accountOptions}
              value={selectedAccount}
              onChange={acc => setSelectedAccount(acc as any)}
            />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              Amount (XRP):{" "}
            </Text>
            <Input
              value={txOptions.Amount}
              onChange={e => setTxOptions({ ...txOptions, Amount: e.target.value })}
              variant="deep"
              css={{ width: "70%", flex: "inherit", height: "$9" }}
            />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              To account:{" "}
            </Text>
            <Select
              instanceId="to-account"
              placeholder="Select the destination account"
              css={{ width: "70%" }}
              options={destAccountOptions}
              value={selectedDestAccount}
              isClearable
              onChange={acc => setSelectedDestAccount(acc as any)}
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
          <Button variant="primary" onClick={submitTest} isLoading={txIsLoading}>
            <Play weight="bold" size="16px" />
            RUN TEST
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

const Test = () => {
  const snap = useSnapshot(state);
  return (
    <Container css={{ py: "$3", px: 0 }}>
      <Flex
        row
        fluid
        css={{ justifyContent: "center", mb: "$2", height: "40vh", minHeight: "300px", p: "$3 $2" }}
      >
        <Box css={{ width: "60%", px: "$2", maxWidth: "800px" }}>
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
        <Box css={{ width: "40%", mx: "$2", height: "100%", maxWidth: "750px" }}>
          <Accounts card hideDeployBtn showHookStats />
        </Box>
      </Flex>

      <Flex row fluid css={{ borderBottom: "1px solid $mauve8" }}>
        <Box css={{ width: "50%", borderRight: "1px solid $mauve8" }}>
          <LogBox
            title="From Log"
            logs={snap.transactionLogs}
            clearLog={() => (state.transactionLogs = [])}
          />
        </Box>
        <Box css={{ width: "50%" }}>
          <LogBox title="To Log" logs={[]} clearLog={() => {}} />
        </Box>
      </Flex>
    </Container>
  );
};

export default Test;
