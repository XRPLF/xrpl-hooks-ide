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

      const TransactionType = selectedTransaction?.value;
      const Destination = selectedDestAccount?.value;
      const Account = selectedAccount?.value;

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
  }, [txIsLoading, selectedTransaction, selectedAccount, accounts, setState]);

  const submitTest = useCallback(async () => {
    let st: TransactionState | undefined;
    if (viewType === "json") {
      // save the editor state first
      const pst = prepareState(editorValue);
      if (!pst) return;

      st = setState(pst);
    }

    const account = accounts.find(
      acc => acc.address === selectedAccount?.value
    );
    const TransactionType = selectedTransaction?.value;
    if (!account || !TransactionType || txIsDisabled) return;

    setState({ txIsLoading: true });
    try {
      const options = prepareOptions(st);
      const logPrefix = header ? `${header.split(".")[0]}: ` : undefined;

      await sendTransaction(account, options, { logPrefix });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        state.transactionLogs.push({ type: "error", message: error.message });
      }
    }
    setState({ txIsLoading: false });
  }, [
    viewType,
    editorValue,
    accounts,
    selectedTransaction?.value,
    txIsDisabled,
    setState,
    selectedAccount?.value,
    prepareOptions,
    header,
  ]);

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
          {viewType === "ui" ? "VIEW AS JSON" : "EXIT JSON VIEW"}
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
