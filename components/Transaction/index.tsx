import { Play } from "phosphor-react";
import { FC, useCallback, useEffect, useMemo } from "react";
import { useSnapshot } from "valtio";
import state from "../../state";
import {
  modifyTransaction,
  prepareState,
  prepareTransaction,
  TransactionState,
} from "../../state/transactions";
import { sendTransaction } from "../../state/actions";
import Box from "../Box";
import Button from "../Button";
import Flex from "../Flex";
import { TxJson } from "./json";
import { TxUI } from "./ui";

export interface TransactionProps {
  header: string;
  state: TransactionState;
}

const Transaction: FC<TransactionProps> = ({
  header,
  state: txState,
  ...props
}) => {
  const { accounts, editorSettings } = useSnapshot(state);
  const {
    selectedAccount,
    selectedTransaction,
    txIsDisabled,
    txIsLoading,
    viewType,
    editorSavedValue,
    editorValue,
  } = txState;

  const setState = useCallback(
    (pTx?: Partial<TransactionState>) => {
      return modifyTransaction(header, pTx);
    },
    [header]
  );

  const prepareOptions = useCallback(
    (state: TransactionState = txState) => {
      const {
        selectedTransaction,
        selectedDestAccount,
        selectedAccount,
        txFields,
      } = state;

      const TransactionType = selectedTransaction?.value || null;
      const Destination =
        selectedDestAccount?.value ||
        ("Destination" in txFields ? null : undefined);
      const Account = selectedAccount?.value || null;

      return prepareTransaction({
        ...txFields,
        TransactionType,
        Destination,
        Account,
      });
    },
    [txState]
  );

  useEffect(() => {
    const transactionType = selectedTransaction?.value;
    const account = selectedAccount?.value;
    if (!account || !transactionType || txIsLoading) {
      setState({ txIsDisabled: true });
    } else {
      setState({ txIsDisabled: false });
    }
  }, [selectedAccount?.value, selectedTransaction?.value, setState, txIsLoading]);

  const submitTest = useCallback(async () => {
    let st: TransactionState | undefined;
    if (viewType === "json") {
      // save the editor state first
      const pst = prepareState(editorValue || '', txState);
      if (!pst) return;

      st = setState(pst);
    }

    const account = accounts.find(
      acc => acc.address === selectedAccount?.value
    );
    if (txIsDisabled) return;

    setState({ txIsLoading: true });
    const logPrefix = header ? `${header.split(".")[0]}: ` : undefined;
    try {
      if (!account) {
        throw Error("Account must be selected from imported accounts!");
      }
      const options = prepareOptions(st);

      if (options.Destination === null) {
        throw Error("Destination account cannot be null")
      }

      await sendTransaction(account, options, { logPrefix });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        state.transactionLogs.push({
          type: "error",
          message: `${logPrefix}${error.message}`,
        });
      }
    }
    setState({ txIsLoading: false });
  }, [viewType, accounts, txIsDisabled, setState, header, editorValue, txState, selectedAccount?.value, prepareOptions]);

  const resetState = useCallback(() => {
    modifyTransaction(header, { viewType }, { replaceState: true });
  }, [header, viewType]);

  const jsonValue = useMemo(
    () =>
      editorSavedValue ||
      JSON.stringify(prepareOptions?.() || {}, null, editorSettings.tabSize),
    [editorSavedValue, editorSettings.tabSize, prepareOptions]
  );

  return (
    <Box css={{ position: "relative", height: "calc(100% - 28px)" }} {...props}>
      {viewType === "json" ? (
        <TxJson
          value={jsonValue}
          header={header}
          state={txState}
          setState={setState}
        />
      ) : (
        <TxUI state={txState} setState={setState} />
      )}
      <Flex
        row
        css={{
          justifyContent: "space-between",
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          mb: "$1",
        }}
      >
        <Button
          onClick={() => {
            if (viewType === "ui") {
              setState({ editorSavedValue: null, viewType: "json" });
            } else setState({ viewType: "ui" });
          }}
          outline
        >
          {viewType === "ui" ? "EDIT AS JSON" : "EXIT JSON MODE"}
        </Button>
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
