import Editor, { loader } from "@monaco-editor/react";
import { FC, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import dark from "../../theme/editor/amy.json";
import light from "../../theme/editor/xcode_default.json";
import { useSnapshot } from "valtio";
import state, { parseJSON, prepareState, TransactionState } from "../../state";
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
  state: TransactionState;
}

export const TxJson: FC<JsonProps> = ({
  value = "",
  state: txState,
  header,
  setState,
}) => {
  const { editorSettings } = useSnapshot(state);
  const { editorValue = value } = txState;
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

  const saveState = (value: string) => {
    const tx = prepareState(value);
    if (tx) setState(tx);
  };

  const discardChanges = () => {
    let discard = confirm("Are you sure to discard these changes");
    if (discard) {
      setState({ editorValue: value });
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
      setState({ editorValue: value });
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
        onChange={val => setState({ editorValue: val })}
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
