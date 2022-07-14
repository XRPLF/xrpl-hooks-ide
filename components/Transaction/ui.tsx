import { FC, useCallback, useEffect, useState } from "react";
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
  getTxFields,
} from "../../state/transactions";
import { useSnapshot } from "valtio";
import state from "../../state";
import { streamState } from "../DebugStream";
import { Button } from "..";
import Textarea from "../Textarea";

interface UIProps {
  setState: (
    pTx?: Partial<TransactionState> | undefined
  ) => TransactionState | undefined;
  state: TransactionState;
  estimateFee?: (...arg: any) => Promise<string | undefined>;
}

export const TxUI: FC<UIProps> = ({
  state: txState,
  setState,
  estimateFee,
}) => {
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

  const [feeLoading, setFeeLoading] = useState(false);

  const resetOptions = useCallback(
    (tt: string) => {
      const fields = getTxFields(tt);
      if (!fields.Destination) setState({ selectedDestAccount: null });
      return setState({ txFields: fields });
    },
    [setState]
  );

  const handleSetAccount = (acc: SelectOption) => {
    setState({ selectedAccount: acc });
    streamState.selectedAccount = acc;
  };

  const handleSetField = useCallback(
    (field: keyof TxFields, value: string, opFields?: TxFields) => {
      const fields = opFields || txFields;
      const obj = fields[field];
      setState({
        txFields: {
          ...fields,
          [field]: typeof obj === "object" ? { ...obj, $value: value } : value,
        },
      });
    },
    [setState, txFields]
  );

  const handleEstimateFee = useCallback(
    async (state?: TransactionState, silent?: boolean) => {
      setFeeLoading(true);

      const fee = await estimateFee?.(state, { silent });
      if (fee) handleSetField("Fee", fee, state?.txFields);

      setFeeLoading(false);
    },
    [estimateFee, handleSetField]
  );

  const handleChangeTxType = useCallback(
    (tt: SelectOption) => {
      setState({ selectedTransaction: tt });

      const newState = resetOptions(tt.value);

      handleEstimateFee(newState, true);
    },
    [handleEstimateFee, resetOptions, setState]
  );

  const specialFields = ["TransactionType", "Account", "Destination"];

  const otherFields = Object.keys(txFields).filter(
    k => !specialFields.includes(k)
  ) as [keyof TxFields];

  const switchToJson = () =>
    setState({ editorSavedValue: null, viewType: "json" });

  // default tx
  useEffect(() => {
    if (selectedTransaction?.value) return;

    const defaultOption = transactionsOptions.find(
      tt => tt.value === "Payment"
    );
    if (defaultOption) {
      handleChangeTxType(defaultOption);
    }
  }, [handleChangeTxType, selectedTransaction?.value, transactionsOptions]);

  return (
    <Container
      css={{
        p: "$3 01",
        fontSize: "$sm",
        height: "calc(100% - 45px)",
      }}
    >
      <Flex column fluid css={{ height: "100%", overflowY: "auto", pr: "$1" }}>
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
              value = JSON.stringify(_value.$value, null, 2);
            } else {
              value = _value.$value.toString();
            }
          } else {
            value = _value?.toString();
          }

          const isXrp = typeof _value === "object" && _value.$type === "xrp";
          const isJson = typeof _value === "object" && _value.$type === "json";
          const isFee = field === "Fee";
          let rows = isJson
            ? (value?.match(/\n/gm)?.length || 0) + 1
            : undefined;
          if (rows && rows > 5) rows = 5;
          return (
            <Flex column key={field} css={{ mb: "$2", pr: "1px" }}>
              <Flex
                row
                fluid
                css={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <Text muted css={{ mr: "$3" }}>
                  {field + (isXrp ? " (XRP)" : "")}:{" "}
                </Text>
                {isJson ? (
                  <Textarea
                    rows={rows}
                    value={value}
                    spellCheck={false}
                    onChange={switchToJson}
                    css={{
                      width: "70%",
                      flex: "inherit",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <Input
                    type={isFee ? "number" : "text"}
                    value={value}
                    onChange={e => {
                      if (isFee) {
                        const val = e.target.value
                          .replaceAll(".", "")
                          .replaceAll(",", "");
                        handleSetField(field, val);
                      } else {
                        handleSetField(field, e.target.value);
                      }
                    }}
                    onKeyPress={
                      isFee
                        ? e => {
                            if (e.key === "." || e.key === ",") {
                              e.preventDefault();
                            }
                          }
                        : undefined
                    }
                    css={{
                      width: "70%",
                      flex: "inherit",
                      "-moz-appearance": "textfield",
                      "&::-webkit-outer-spin-button": {
                        "-webkit-appearance": "none",
                        margin: 0,
                      },
                      "&::-webkit-inner-spin-button ": {
                        "-webkit-appearance": "none",
                        margin: 0,
                      },
                    }}
                  />
                )}
                {isFee && (
                  <Button
                    size="xs"
                    variant="primary"
                    outline
                    disabled={txState.txIsDisabled}
                    isDisabled={txState.txIsDisabled}
                    isLoading={feeLoading}
                    css={{
                      position: "absolute",
                      right: "$2",
                      fontSize: "$xs",
                      cursor: "pointer",
                      alignContent: "center",
                      display: "flex",
                    }}
                    onClick={() => handleEstimateFee()}
                  >
                    Suggest
                  </Button>
                )}
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Container>
  );
};
