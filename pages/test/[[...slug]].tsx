import { Container, Flex, Box, Tabs, Tab, Input, Select, Text, Button } from "../../components";
import { Play } from "phosphor-react";
import dynamic from "next/dynamic";
import { useSnapshot } from "valtio";
import state from "../../state";
import { sendTransaction } from "../../state/actions";
import { useCallback, useEffect, useState } from "react";
import transactionsData from "../../content/transactions.json";

const LogBox = dynamic(() => import("../../components/LogBox"), {
  ssr: false,
});
const Accounts = dynamic(() => import("../../components/Accounts"), {
  ssr: false,
});

// type SelectOption<T> = { value: T, label: string };
type TxFields = Omit<typeof transactionsData[0], "Account" | "Sequence" | "TransactionType">;
type OtherFields = (keyof Omit<TxFields, "Destination">)[];

const Transaction = () => {
  const snap = useSnapshot(state);

  const transactionsOptions = transactionsData.map(tx => ({
    value: tx.TransactionType,
    label: tx.TransactionType,
  }));
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

  const [txIsLoading, setTxIsLoading] = useState(false);
  const [txIsDisabled, setTxIsDisabled] = useState(false);
  const [txFields, setTxFields] = useState<TxFields>({});

  useEffect(() => {
    const transactionType = selectedTransaction?.value;
    const account = snap.accounts.find(acc => acc.address === selectedAccount?.value);
    if (!account || !transactionType || txIsLoading) {
      setTxIsDisabled(true);
    } else {
      setTxIsDisabled(false);
    }
  }, [txIsLoading, selectedTransaction, selectedAccount, snap.accounts]);

  useEffect(() => {
    let _txFields: TxFields | undefined = transactionsData.find(
      tx => tx.TransactionType === selectedTransaction?.value
    );
    if (!_txFields) return setTxFields({});
    _txFields = { ..._txFields } as TxFields;

    setSelectedDestAccount(null);
    // @ts-ignore
    delete _txFields.TransactionType;
    // @ts-ignore
    delete _txFields.Account;
    // @ts-ignore
    delete _txFields.Sequence;
    setTxFields(_txFields);
  }, [selectedTransaction, setSelectedDestAccount]);

  const submitTest = useCallback(async () => {
    const account = snap.accounts.find(acc => acc.address === selectedAccount?.value);
    const TransactionType = selectedTransaction?.value;
    if (!account || !TransactionType || txIsDisabled) return;

    setTxIsLoading(true);
    // setTxIsError(null)
    let options = { ...txFields };

    options.Destination = selectedDestAccount?.value;
    (Object.keys(options) as (keyof TxFields)[]).forEach(field => {
      let _value = options[field];
      // convert currency
      if (typeof _value === "object" && _value.type === "currency") {
        if (+_value.value) {
          options[field] = (+_value.value * 1000000 + "") as any;
        } else {
          options[field] = undefined; // 👇 💀
        }
      }
      // delete unneccesary fields
      if (!options[field]) {
        delete options[field];
      }
    });
    await sendTransaction(account, {
      TransactionType,
      ...options,
    });

    setTxIsLoading(false);
    // TODO catch error for UI to show
  }, [
    selectedAccount,
    selectedDestAccount,
    selectedTransaction,
    snap.accounts,
    txFields,
    txIsDisabled,
  ]);

  const resetState = useCallback(() => {
    setSelectedAccount(null);
    setSelectedDestAccount(null);
    setSelectedTransaction(null);
    setTxFields({});
    setTxIsDisabled(false);
    setTxIsLoading(false);
  }, []);

  const usualFields = ["TransactionType", "Amount", "Account", "Destination"];
  const otherFields = Object.keys(txFields).filter(k => !usualFields.includes(k)) as OtherFields;
  return (
    <Box css={{ position: "relative", height: "calc(100% - 28px)" }}>
      <Container css={{ p: "$3 0", fontSize: "$sm", height: "calc(100% - 28px)" }}>
        <Flex column fluid css={{ height: "100%", overflowY: "auto" }}>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              Transaction type:{" "}
            </Text>
            <Select
              instanceId="transactionsType"
              placeholder="Select transaction type"
              options={transactionsOptions}
              hideSelectedOptions
              css={{ width: "70%" }}
              value={selectedTransaction}
              onChange={tt => setSelectedTransaction(tt as any)}
            />
          </Flex>
          <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
            <Text muted css={{ mr: "$3" }}>
              Account:{" "}
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
          {txFields.Amount !== undefined && (
            <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
              <Text muted css={{ mr: "$3" }}>
                Amount (XRP):{" "}
              </Text>
              <Input
                value={txFields.Amount.value}
                onChange={e =>
                  setTxFields({
                    ...txFields,
                    Amount: { type: "currency", value: e.target.value },
                  })
                }
                variant="deep"
                css={{ width: "70%", flex: "inherit", height: "$9" }}
              />
            </Flex>
          )}
          {txFields.Destination !== undefined && (
            <Flex row fluid css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}>
              <Text muted css={{ mr: "$3" }}>
                Destination account:{" "}
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
          )}
          {otherFields.map(field => {
            let _value = txFields[field];
            let value = typeof _value === "object" ? _value.value : _value;
            let isCurrency = typeof _value === "object" && _value.type === "currency";
            return (
              <Flex
                key={field}
                row
                fluid
                css={{ justifyContent: "flex-end", alignItems: "center", mb: "$3" }}
              >
                <Text muted css={{ mr: "$3" }}>
                  {field + (isCurrency ? " (XRP)" : "")}:{" "}
                </Text>
                <Input
                  value={value?.toString()} // TODO handle list maybe
                  onChange={e =>
                    setTxFields({
                      ...txFields,
                      [field]:
                        typeof _value === "object"
                          ? { ..._value, value: e.target.value }
                          : e.target.value,
                    })
                  }
                  variant="deep"
                  css={{ width: "70%", flex: "inherit", height: "$9" }}
                />
              </Flex>
            );
          })}
        </Flex>
      </Container>
      <Flex
        row
        css={{
          justifyContent: "space-between",
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
        }}
      >
        <Button outline>VIEW AS JSON</Button>
        <Flex row>
          <Button onClick={resetState} outline css={{ mr: "$3" }}>
            RESET
          </Button>
          <Button
            variant="primary"
            onClick={submitTest}
            isLoading={txIsLoading}
            disabled={txIsDisabled}
          >
            <Play weight="bold" size="16px" />
            RUN TEST
          </Button>
        </Flex>
      </Flex>
    </Box>
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
        <Box css={{ width: "60%", px: "$2", maxWidth: "800px", height: "100%", overflow: "auto" }}>
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
