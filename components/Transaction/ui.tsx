import { FC } from "react";
import Container from "../Container";
import Flex from "../Flex";
import Input from "../Input";
import Select from "../Select";
import Text from "../Text";
import {
  SelectOption,
  TransactionState,
  transactionsData,
  TxFields,
} from "../../state/transactions";
import { useSnapshot } from "valtio";
import state from "../../state";
import { streamState } from "../DebugStream";

interface UIProps {
  setState: (pTx?: Partial<TransactionState> | undefined) => void;
  state: TransactionState;
}

export const TxUI: FC<UIProps> = ({ state: txState, setState }) => {
  const { accounts } = useSnapshot(state);
  const {
    selectedAccount,
    selectedDestAccount,
    selectedTransaction,
    txFields,
  } = txState;

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

  const resetOptions = (tt: string) => {
    const txFields: TxFields | undefined = transactionsData.find(
      tx => tx.TransactionType === tt
    );

    if (!txFields) return setState({ txFields: {} });

    const _txFields = Object.keys(txFields)
      .filter(key => !["TransactionType", "Account", "Sequence"].includes(key))
      .reduce<TxFields>(
        (tf, key) => ((tf[key as keyof TxFields] = (txFields as any)[key]), tf),
        {}
      );

    if (!_txFields.Destination) setState({ selectedDestAccount: null });
    setState({ txFields: _txFields });
  };

  const handleSetAccount = (acc: SelectOption) => {
    setState({ selectedAccount: acc });
    streamState.selectedAccount = acc;
  };

  const handleChangeTxType = (tt: SelectOption) => {
    setState({ selectedTransaction: tt });
    resetOptions(tt.value);
  };

  const specialFields = ["TransactionType", "Account", "Destination"];

  const otherFields = Object.keys(txFields).filter(
    k => !specialFields.includes(k)
  ) as [keyof TxFields];

  return (
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
            onChange={(tt: any) => handleChangeTxType(tt)}
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

          let value: string | undefined;
          if (typeof _value === "object") {
            if (_value.$type === "json" && typeof _value.$value === "object") {
              value = JSON.stringify(_value.$value);
            } else {
              value = _value.$value.toString();
            }
          } else {
            value = _value?.toString();
          }

          let isXrp = typeof _value === "object" && _value.$type === "xrp";
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
                {field + (isXrp ? " (XRP)" : "")}:{" "}
              </Text>
              <Input
                value={value}
                onChange={e => {
                  setState({
                    txFields: {
                      ...txFields,
                      [field]:
                        typeof _value === "object"
                          ? { ..._value, $value: e.target.value }
                          : e.target.value,
                    },
                  });
                }}
                css={{ width: "70%", flex: "inherit" }}
              />
            </Flex>
          );
        })}
      </Flex>
    </Container>
  );
};
