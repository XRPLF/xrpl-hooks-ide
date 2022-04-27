import { Play } from "phosphor-react";
import { FC, useCallback, useEffect } from "react";
import { useSnapshot } from "valtio";
import transactionsData from "../content/transactions.json";
import state, { modifyTransaction } from "../state";
import { sendTransaction } from "../state/actions";
import Box from "./Box";
import Button from "./Button";
import Container from "./Container";
import { streamState } from "./DebugStream";
import Flex from "./Flex";
import Input from "./Input";
import Text from "./Text";
import Select from "./Select";

type TxFields = Omit<
  typeof transactionsData[0],
  "Account" | "Sequence" | "TransactionType"
>;

type OtherFields = (keyof Omit<TxFields, "Destination">)[];

type SelectOption = {
  value: string;
  label: string;
};

export interface TransactionState {
  selectedTransaction: SelectOption | null;
  selectedAccount: SelectOption | null;
  selectedDestAccount: SelectOption | null;
  txIsLoading: boolean;
  txIsDisabled: boolean;
  txFields: TxFields;
}

export interface TransactionProps {
  header: string;
  state: TransactionState;
}

const Transaction: FC<TransactionProps> = ({
  header,
  state: {
    selectedAccount,
    selectedDestAccount,
    selectedTransaction,
    txFields,
    txIsDisabled,
    txIsLoading,
  },
  ...props
}) => {
  const { accounts } = useSnapshot(state);

  const setState = useCallback(
    (pTx?: Partial<TransactionState>) => {
      modifyTransaction(header, pTx);
    },
    [header]
  );

  const transactionsOptions = transactionsData.map(tx => ({
    value: tx.TransactionType,
    label: tx.TransactionType,
  }));

  const accountOptions: SelectOption[] = accounts.map(acc => ({
    label: acc.name,
    value: acc.address,
  }));

  const destAccountOptions: SelectOption[] = accounts
    .map(acc => ({
      label: acc.name,
      value: acc.address,
    }))
    .filter(acc => acc.value !== selectedAccount?.value);

  useEffect(() => {
    const transactionType = selectedTransaction?.value;
    const account = accounts.find(
      acc => acc.address === selectedAccount?.value
    );
    if (!account || !transactionType || txIsLoading) {
      setState({ txIsDisabled: true });
    } else {
      setState({ txIsDisabled: false });
    }
  }, [txIsLoading, selectedTransaction, selectedAccount, accounts, setState]);

  useEffect(() => {
    let _txFields: TxFields | undefined = transactionsData.find(
      tx => tx.TransactionType === selectedTransaction?.value
    );
    if (!_txFields) return setState({ txFields: {} });
    _txFields = { ..._txFields } as TxFields;

    if (!_txFields.Destination) setState({ selectedDestAccount: null });
    // @ts-ignore
    delete _txFields.TransactionType;
    // @ts-ignore
    delete _txFields.Account;
    // @ts-ignore
    delete _txFields.Sequence;
    setState({ txFields: _txFields });
  }, [setState, selectedTransaction]);

  const submitTest = useCallback(async () => {
    const account = accounts.find(
      acc => acc.address === selectedAccount?.value
    );
    const TransactionType = selectedTransaction?.value;
    if (!account || !TransactionType || txIsDisabled) return;

    setState({ txIsLoading: true });
    // setTxIsError(null)
    try {
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
        // handle type: `json`
        if (typeof _value === "object" && _value.type === "json") {
          if (typeof _value.value === "object") {
            options[field] = _value.value as any;
          } else {
            try {
              options[field] = JSON.parse(_value.value);
            } catch (error) {
              const message = `Input error for json field '${field}': ${
                error instanceof Error ? error.message : ""
              }`;
              throw Error(message);
            }
          }
        }

        // delete unneccesary fields
        if (!options[field]) {
          delete options[field];
        }
      });
      const logPrefix = header ? `${header.split(".")[0]}: ` : undefined;
      await sendTransaction(
        account,
        {
          TransactionType,
          ...options,
        },
        { logPrefix }
      );
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        state.transactionLogs.push({ type: "error", message: error.message });
      }
    }
    setState({ txIsLoading: false });
  }, [
    header,
    setState,
    selectedAccount?.value,
    selectedDestAccount?.value,
    selectedTransaction?.value,
    accounts,
    txFields,
    txIsDisabled,
  ]);

  const resetState = useCallback(() => {
    setState({});
  }, [setState]);

  const handleSetAccount = (acc: SelectOption) => {
    setState({ selectedAccount: acc });
    streamState.selectedAccount = acc;
  };

  const usualFields = ["TransactionType", "Amount", "Account", "Destination"];
  const otherFields = Object.keys(txFields).filter(
    k => !usualFields.includes(k)
  ) as OtherFields;
  return (
    <Box css={{ position: "relative", height: "calc(100% - 28px)" }} {...props}>
      <Container
        css={{
          p: "$3 01",
          fontSize: "$sm",
          height: "calc(100% - 45px)",
        }}
      >
        <Flex column fluid css={{ height: "100%", overflowY: "auto" }}>
          <Flex
            row
            fluid
            css={{
              justifyContent: "flex-end",
              alignItems: "center",
              mb: "$3",
              mt: "1px",
              pr: "1px",
            }}
          >
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
              onChange={(tx: any) => setState({ selectedTransaction: tx })}
            />
          </Flex>
          <Flex
            row
            fluid
            css={{
              justifyContent: "flex-end",
              alignItems: "center",
              mb: "$3",
              pr: "1px",
            }}
          >
            <Text muted css={{ mr: "$3" }}>
              Account:{" "}
            </Text>
            <Select
              instanceId="from-account"
              placeholder="Select your account"
              css={{ width: "70%" }}
              options={accountOptions}
              value={selectedAccount}
              onChange={(acc: any) => handleSetAccount(acc)} // TODO make react-select have correct types for acc
            />
          </Flex>
          {txFields.Amount !== undefined && (
            <Flex
              row
              fluid
              css={{
                justifyContent: "flex-end",
                alignItems: "center",
                mb: "$3",
                pr: "1px",
              }}
            >
              <Text muted css={{ mr: "$3" }}>
                Amount (XRP):{" "}
              </Text>
              <Input
                value={txFields.Amount.value}
                onChange={e =>
                  setState({
                    txFields: {
                      ...txFields,
                      Amount: { type: "currency", value: e.target.value },
                    },
                  })
                }
                css={{ width: "70%", flex: "inherit" }}
              />
            </Flex>
          )}
          {txFields.Destination !== undefined && (
            <Flex
              row
              fluid
              css={{
                justifyContent: "flex-end",
                alignItems: "center",
                mb: "$3",
                pr: "1px",
              }}
            >
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
                onChange={(acc: any) => setState({ selectedDestAccount: acc })}
              />
            </Flex>
          )}
          {otherFields.map(field => {
            let _value = txFields[field];
            let value = typeof _value === "object" ? _value.value : _value;
            value =
              typeof value === "object"
                ? JSON.stringify(value)
                : value?.toLocaleString();
            let isCurrency =
              typeof _value === "object" && _value.type === "currency";
            return (
              <Flex
                key={field}
                row
                fluid
                css={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  mb: "$3",
                  pr: "1px",
                }}
              >
                <Text muted css={{ mr: "$3" }}>
                  {field + (isCurrency ? " (XRP)" : "")}:{" "}
                </Text>
                <Input
                  value={value}
                  onChange={e =>
                    setState({
                      txFields: {
                        ...txFields,
                        [field]:
                          typeof _value === "object"
                            ? { ..._value, value: e.target.value }
                            : e.target.value,
                      },
                    })
                  }
                  css={{ width: "70%", flex: "inherit" }}
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
          mb: "$1"
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

export default Transaction;
