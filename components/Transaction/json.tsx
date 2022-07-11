import { FC, useCallback, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import state, {
  prepareState,
  transactionsData,
  TransactionState,
} from "../../state";
import Text from "../Text";
import { Flex, Link } from "..";
import { showAlert } from "../../state/actions/showAlert";
import { parseJSON } from "../../utils/json";
import { extractSchemaProps } from "../../utils/schema";
import amountSchema from "../../content/amount-schema.json";
import Monaco from "../Monaco";
import type monaco from "monaco-editor";

interface JsonProps {
  value?: string;
  header?: string;
  setState: (pTx?: Partial<TransactionState> | undefined) => void;
  state: TransactionState;
  estimateFee?: () => Promise<string | undefined>;
}

export const TxJson: FC<JsonProps> = ({
  value = "",
  state: txState,
  header,
  setState,
}) => {
  const { editorSettings, accounts } = useSnapshot(state);
  const { editorValue = value, estimatedFee } = txState;
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [currTxType, setCurrTxType] = useState<string | undefined>(
    txState.selectedTransaction?.value
  );

  useEffect(() => {
    setState({ editorValue: value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const parsed = parseJSON(editorValue);
    if (!parsed) return;

    const tt = parsed.TransactionType;
    const tx = transactionsData.find(t => t.TransactionType === tt);
    if (tx) setCurrTxType(tx.TransactionType);
    else {
      setCurrTxType(undefined);
    }
  }, [editorValue]);

  useEffect(() => {
    if (editorValue === value) setHasUnsaved(false);
    else setHasUnsaved(true);
  }, [editorValue, value]);

  const saveState = (value: string, transactionType?: string) => {
    const tx = prepareState(value, transactionType);
    if (tx) setState(tx);
  };

  const discardChanges = () => {
    showAlert("Confirm", {
      body: "Are you sure to discard these changes?",
      confirmText: "Yes",
      onConfirm: () => setState({ editorValue: value }),
    });
  };

  const onExit = (value: string) => {
    const options = parseJSON(value);
    if (options) {
      saveState(value, currTxType);
      return;
    }
    showAlert("Error!", {
      body: `Malformed Transaction in ${header}, would you like to discard these changes?`,
      confirmText: "Discard",
      onConfirm: () => setState({ editorValue: value }),
      onCancel: () => setState({ viewType: "json", editorSavedValue: value }),
    });
  };

  const getSchemas = useCallback(async (): Promise<any[]> => {
    const txObj = transactionsData.find(
      td => td.TransactionType === currTxType
    );

    let genericSchemaProps: any;
    if (txObj) {
      genericSchemaProps = extractSchemaProps(txObj);
    } else {
      genericSchemaProps = transactionsData.reduce(
        (cumm, td) => ({
          ...cumm,
          ...extractSchemaProps(td),
        }),
        {}
      );
    }
    return [
      {
        uri: "file:///main-schema.json", // id of the first schema
        fileMatch: ["**.json"], // associate with our model
        schema: {
          title: header,
          type: "object",
          required: ["TransactionType", "Account"],
          properties: {
            ...genericSchemaProps,
            TransactionType: {
              title: "Transaction Type",
              enum: transactionsData.map(td => td.TransactionType),
            },
            Account: {
              $ref: "file:///account-schema.json",
            },
            Destination: {
              anyOf: [
                {
                  $ref: "file:///account-schema.json",
                },
                {
                  type: "string",
                  title: "Destination Account",
                },
              ],
            },
            Amount: {
              $ref: "file:///amount-schema.json",
            },
            Fee: {
              $ref: "file:///fee-schema.json",
            },
          },
        },
      },
      {
        uri: "file:///account-schema.json",
        schema: {
          type: "string",
          title: "Account type",
          enum: accounts.map(acc => acc.address),
        },
      },
      {
        uri: "file:///fee-schema.json",
        schema: {
          type: "string",
          title: "Fee type",
          const: estimatedFee,
          description: estimatedFee
            ? "Above mentioned value is recommended base fee"
            : undefined,
        },
      },
      {
        ...amountSchema,
      },
    ];
  }, [accounts, currTxType, estimatedFee, header]);

  const [monacoInst, setMonacoInst] = useState<typeof monaco>();
  useEffect(() => {
    if (!monacoInst) return;
    getSchemas().then(schemas => {
      monacoInst.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas,
      });
    });
  }, [getSchemas, monacoInst]);

  return (
    <Monaco
      rootProps={{
        css: { height: "calc(100% - 45px)" },
      }}
      language={"json"}
      id={header}
      height="100%"
      value={editorValue}
      onChange={val => setState({ editorValue: val })}
      onMount={(editor, monaco) => {
        editor.updateOptions({
          minimap: { enabled: false },
          glyphMargin: true,
          tabSize: editorSettings.tabSize,
          dragAndDrop: true,
          fontSize: 14,
        });

        setMonacoInst(monaco);
        // register onExit cb
        const model = editor.getModel();
        model?.onWillDispose(() => onExit(model.getValue()));
      }}
      overlay={
        hasUnsaved ? (
          <Flex
            row
            align="center"
            css={{ fontSize: "$xs", color: "$textMuted", ml: 'auto' }}
          >
            <Text muted small>
              This file has unsaved changes.
            </Text>
            <Link
              css={{ ml: "$1" }}
              onClick={() => saveState(editorValue, currTxType)}
            >
              save
            </Link>
            <Link css={{ ml: "$1" }} onClick={discardChanges}>
              discard
            </Link>
          </Flex>
        ) : undefined
      }
    />
  );
};
