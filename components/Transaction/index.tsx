import { Play } from "phosphor-react";
import { FC, useCallback, useState } from "react";
import { useSnapshot } from "valtio";
import state from "../../state";
import {
  modifyTransaction,
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
  const { accounts } = useSnapshot(state);
  const {
    selectedAccount,
    selectedDestAccount,
    selectedTransaction,
    txFields,
    txIsDisabled,
    txIsLoading,
  } = txState;

  const [viewType, setViewType] = useState<"ui" | "json">("ui");

  const setState = useCallback(
    (pTx?: Partial<TransactionState>) => {
      modifyTransaction(header, pTx);
    },
    [header]
  );

  const prepareOptions = useCallback(() => {
    const TransactionType = selectedTransaction?.value;
    const Destination = selectedDestAccount?.value;
    const Account = selectedAccount?.value;

    return prepareTransaction({
      ...txFields,
      TransactionType,
      Destination,
      Account,
    });
  }, [
    selectedAccount?.value,
    selectedDestAccount?.value,
    selectedTransaction?.value,
    txFields,
  ]);

  const submitTest = useCallback(async () => {
    const account = accounts.find(
      acc => acc.address === selectedAccount?.value
    );
    const TransactionType = selectedTransaction?.value;
    if (!account || !TransactionType || txIsDisabled) return;

    setState({ txIsLoading: true });
    try {
      const options = prepareOptions();
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
    accounts,
    selectedTransaction?.value,
    txIsDisabled,
    setState,
    prepareOptions,
    selectedAccount?.value,
    header,
  ]);

  const resetState = useCallback(() => {
    setState({});
  }, [setState]);

  return (
    <Box css={{ position: "relative", height: "calc(100% - 28px)" }} {...props}>
      {viewType === "json" ? (
        <TxJson prepareOptions={prepareOptions} />
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
          onClick={() => setViewType(viewType === "ui" ? "json" : "ui")}
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
