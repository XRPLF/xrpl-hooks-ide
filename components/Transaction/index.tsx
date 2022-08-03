import { Play } from "phosphor-react";
import { FC, useCallback, useEffect } from "react";
import { useSnapshot } from "valtio";
import state from "../../state";
import {
  defaultTransactionType,
  getTxFields,
  modifyTxState,
  prepareState,
  prepareTransaction,
  SelectOption,
  TransactionState,
} from "../../state/transactions";
import { sendTransaction } from "../../state/actions";
import Box from "../Box";
import Button from "../Button";
import Flex from "../Flex";
import { TxJson } from "./json";
import { TxUI } from "./ui";
import { default as _estimateFee } from "../../utils/estimateFee";
import toast from "react-hot-toast";

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
    editorValue,
  } = txState;

  const setState = useCallback(
    (pTx?: Partial<TransactionState>) => {
      return modifyTxState(header, pTx);
    },
    [header]
  );

  const prepareOptions = useCallback(
    (state: Partial<TransactionState> = txState) => {
      const {
        selectedTransaction,
        selectedDestAccount,
        selectedAccount,
        txFields,
      } = state;

      const TransactionType = selectedTransaction?.value || null;
      const Destination = selectedDestAccount?.value || txFields?.Destination;
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
  }, [
    selectedAccount?.value,
    selectedTransaction?.value,
    setState,
    txIsLoading,
  ]);

  const submitTest = useCallback(async () => {
    let st: TransactionState | undefined;
    const tt = txState.selectedTransaction?.value;
    if (viewType === "json") {
      // save the editor state first
      const pst = prepareState(editorValue || "", tt);
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

      const fields = getTxFields(options.TransactionType);
      if (fields.Destination && !options.Destination) {
        throw Error("Destination account is required!");
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
  }, [
    viewType,
    accounts,
    txIsDisabled,
    setState,
    header,
    editorValue,
    txState,
    selectedAccount?.value,
    prepareOptions,
  ]);

  const getJsonString = useCallback(
    (state?: Partial<TransactionState>) =>
      JSON.stringify(
        prepareOptions?.(state) || {},
        null,
        editorSettings.tabSize
      ),
    [editorSettings.tabSize, prepareOptions]
  );

  const resetState = useCallback(
    (transactionType: SelectOption | undefined = defaultTransactionType) => {
      const fields = getTxFields(transactionType?.value);

      const nwState: Partial<TransactionState> = {
        viewType,
        selectedTransaction: transactionType,
        selectedDestAccount: null
      };

      // Currently in schema "Destination": "SomeVal" means 'Destination is required' while empty string indicates it is optional
      // TODO Update schema with clear required tag
      if (fields.Destination !== undefined) {
        fields.Destination = "";
      } else {
        fields.Destination = undefined;
      }
      nwState.txFields = fields;

      const state = modifyTxState(header, nwState, { replaceState: true });
      const editorValue = getJsonString(state);
      return setState({ editorValue });
    },
    [getJsonString, header, setState, viewType]
  );

  const estimateFee = useCallback(
    async (st?: TransactionState, opts?: { silent?: boolean }) => {
      const state = st || txState;
      const ptx = prepareOptions(state);
      const account = accounts.find(
        acc => acc.address === state.selectedAccount?.value
      );
      if (!account) {
        if (!opts?.silent) {
          toast.error("Please select account from the list.");
        }
        return;
      }

      ptx.Account = account.address;
      ptx.Sequence = account.sequence;

      const res = await _estimateFee(ptx, account, opts);
      const fee = res?.base_fee;
      setState({ estimatedFee: fee });
      return fee;
    },
    [accounts, prepareOptions, setState, txState]
  );

  return (
    <Box css={{ position: "relative", height: "calc(100% - 28px)" }} {...props}>
      {viewType === "json" ? (
        <TxJson
          getJsonString={getJsonString}
          header={header}
          state={txState}
          setState={setState}
          estimateFee={estimateFee}
        />
      ) : (
        <TxUI state={txState} setState={setState} estimateFee={estimateFee} />
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
              setState({ viewType: "json" });
            } else setState({ viewType: "ui" });
          }}
          outline
        >
          {viewType === "ui" ? "EDIT AS JSON" : "EXIT JSON MODE"}
        </Button>
        <Flex row>
          <Button onClick={() => resetState()} outline css={{ mr: "$3" }}>
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
