import Editor, { loader, useMonaco } from "@monaco-editor/react";
import { FC, useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import dark from "../../theme/editor/amy.json";
import light from "../../theme/editor/xcode_default.json";
import { useSnapshot } from "valtio";
import state, {
  prepareState,
  transactionsData,
  TransactionState,
} from "../../state";
import Text from "../Text";
import Flex from "../Flex";
import { Link } from "..";
import { showAlert } from "../../state/actions/showAlert";
import { parseJSON } from "../../utils/json";
import { extractSchemaProps } from "../../utils/schema";
import amountSchema from "../../content/amount-schema.json";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

interface JsonProps {
  value?: string;
  header?: string;
  setState: (pTx?: Partial<TransactionState> | undefined) => void;
  state: TransactionState;
}

export const TxJson: FC<JsonProps> = ({
  value = "",
  state: txState,
  header,
  setState,
}) => {
  const { editorSettings, accounts } = useSnapshot(state);
  const { editorValue = value, selectedTransaction } = txState;
  const { theme } = useTheme();
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    setState({ editorValue: value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (editorValue === value) setHasUnsaved(false);
    else setHasUnsaved(true);
  }, [editorValue, value]);

  const saveState = (value: string, txState: TransactionState) => {
    const tx = prepareState(value, txState);
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
      saveState(value, txState);
      return;
    }
    showAlert("Error!", {
      body: `Malformed Transaction in ${header}, would you like to discard these changes?`,
      confirmText: "Discard",
      onConfirm: () => setState({ editorValue: value }),
      onCancel: () => setState({ viewType: "json", editorSavedValue: value }),
    });
  };

  const path = `file:///${header}`;
  const monaco = useMonaco();

  const getSchemas = useCallback((): any[] => {
    const tt = selectedTransaction?.value;
    const txObj = transactionsData.find(td => td.TransactionType === tt);

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
        ...amountSchema,
      },
    ];
  }, [accounts, header, selectedTransaction?.value]);

  useEffect(() => {
    if (!monaco) return;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: getSchemas(),
    });
  }, [getSchemas, monaco]);

  return (
    <Flex
      fluid
      column
      css={{ height: "calc(100% - 45px)", position: "relative" }}
    >
      <Editor
        className="hooks-editor"
        language={"json"}
        path={path}
        height="100%"
        beforeMount={monaco => {
          monaco.editor.defineTheme("dark", dark as any);
          monaco.editor.defineTheme("light", light as any);
        }}
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

          // register onExit cb
          const model = editor.getModel();
          model?.onWillDispose(() => onExit(model.getValue()));

          // set json defaults
          monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: getSchemas(),
          });
        }}
        theme={theme === "dark" ? "dark" : "light"}
      />
      {hasUnsaved && (
        <Text muted small css={{ position: "absolute", bottom: 0, right: 0 }}>
          This file has unsaved changes.{" "}
          <Link onClick={() => saveState(editorValue, txState)}>save</Link>{" "}
          <Link onClick={discardChanges}>discard</Link>
        </Text>
      )}
    </Flex>
  );
};
