import Editor, { loader } from "@monaco-editor/react";
import { FC, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import dark from "../../theme/editor/amy.json";
import light from "../../theme/editor/xcode_default.json";
import { useSnapshot } from "valtio";
import state, { TransactionState } from "../../state";
import Text from "../Text";
import Flex from "../Flex";
import { Link } from "..";

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs",
  },
});

interface JsonProps {
  value?: string;
  header?: string;
  setState: (pTx?: Partial<TransactionState> | undefined) => void;
}

function parseJSON(str: string): any | undefined {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" ? parsed : undefined;
  } catch (error) {
    return undefined;
  }
}

export const TxJson: FC<JsonProps> = ({ value = "", header, setState }) => {
  const { editorSettings } = useSnapshot(state);
  const { theme } = useTheme();
  const [editorValue, setEditorValue] = useState(value);
  const [hasUnsaved, setHasUnsaved] = useState(false);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  useEffect(() => {
    if (editorValue === value) setHasUnsaved(false);
    else setHasUnsaved(true);
  }, [editorValue, value]);

  const saveState = (value: string) => {
    const options = parseJSON(value);
    if (!options) return alert("Cannot save dirty editor");

    const { Account, TransactionType, Destination, ...rest } = options;
    let tx: Partial<TransactionState> = {};

    if (Account) {
      const acc = state.accounts.find(acc => acc.address === Account);
      if (acc) {
        tx.selectedAccount = {
          label: acc.name,
          value: acc.address,
        };
      } else {
        tx.selectedAccount = {
          label: Account,
          value: Account,
        };
      }
    } else {
      tx.selectedAccount = null;
    }

    if (TransactionType) {
      tx.selectedTransaction = {
        label: TransactionType,
        value: TransactionType,
      };
    } else {
      tx.selectedTransaction = null;
    }

    if (Destination) {
      const dest = state.accounts.find(acc => acc.address === Destination);
      if (dest) {
        tx.selectedDestAccount = {
          label: dest.name,
          value: dest.address,
        };
      } else {
        tx.selectedDestAccount = {
          label: Destination,
          value: Destination,
        };
      }
    }

    Object.keys(rest).forEach(field => {
      const value = rest[field];
      console.log({ field, value });
      if (field === "Amount") {
        rest[field] = {
          type: "currency",
          value: +value / 1000000, // TODO handle object currencies
        };
      } else if (typeof value === "object") {
        rest[field] = {
          type: "json",
          value,
        };
      }
    });

    tx.txFields = rest;
    tx.editorSavedValue = null;

    setState(tx);
  };

  const discardChanges = () => {
    let discard = confirm("Are you sure to discard these changes");
    if (discard) {
      setEditorValue(value);
    }
  };

  const onExit = (value: string) => {
    const options = parseJSON(value);
    if (options) {
      saveState(value);
      return;
    }
    const discard = confirm(
      `Malformed Transaction in ${header}, would you like to discard these changes?`
    );
    if (!discard) {
      setState({ viewType: "json", editorSavedValue: value });
    } else {
      setEditorValue(value);
    }
  };

  const path = `file:///${header}`;
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
        onChange={val => setEditorValue(val || "")}
        onMount={(editor, monaco) => {
          editor.updateOptions({
            minimap: { enabled: false },
            glyphMargin: true,
            tabSize: editorSettings.tabSize,
            dragAndDrop: true,
            fontSize: 14,
          });
          const model = editor.getModel();
          model?.onWillDispose(() => onExit(model.getValue()));
        }}
        theme={theme === "dark" ? "dark" : "light"}
      />
      {hasUnsaved && (
        <Text muted small css={{ position: "absolute", bottom: 0, right: 0 }}>
          This file has unsaved changes.{" "}
          <Link onClick={() => saveState(editorValue)}>save</Link>{" "}
          <Link onClick={discardChanges}>discard</Link>
        </Text>
      )}
    </Flex>
  );
};
