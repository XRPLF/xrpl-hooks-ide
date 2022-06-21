import * as Handlebars from "handlebars";
import { Play, X } from "phosphor-react";
import { useCallback, useEffect, useState } from "react";
import state, { IFile, ILog } from "../../state";
import Button from "../Button";
import Box from "../Box";
import Input from "../Input";
import Stack from "../Stack";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../Dialog";
import Flex from "../Flex";
import { useSnapshot } from "valtio";
import Select from "../Select";
import { saveFile } from "../../state/actions/saveFile";

Handlebars.registerHelper(
  "customize_input",
  function (/* dynamic arguments */) {
    return new Handlebars.SafeString(arguments[0]);
  }
);

const generateHtmlTemplate = (code: string) => {
  return `
  <html>
  <head>
    <script>
      var log = console.log;
      var errorLog = console.error;
      var infoLog = console.info;
      var warnLog = console.warn
      console.log = function(){
        var args = Array.from(arguments);
        parent.window.postMessage({ type: 'log', args: args || [] }, '*');
        log.apply(console, args);
      }
      console.error = function(){
        var args = Array.from(arguments);
        parent.window.postMessage({ type: 'error', args: args || [] }, '*');
        errorLog.apply(console, args);
      }
      console.info = function(){
        var args = Array.from(arguments);
        parent.window.postMessage({ type: 'info', args: args || [] }, '*');
        infoLog.apply(console, args);
      }
      console.warn = function(){
        var args = Array.from(arguments);
        parent.window.postMessage({ type: 'warning', args: args || [] }, '*');
        warnLog.apply(console, args);
      }
    </script>
    <script type="module">   
      ${code}
    </script>
  </head>
  <body>
  </body>
  </html>
  `;
};

type Fields = Record<
  string,
  {
    key: string;
    value: string;
    label?: string;
    type?: string;
    attach?: "account_secret" | "account_address" | string;
  }
>;

const RunScript: React.FC<{ file: IFile }> = ({ file: { content, name } }) => {
  const snap = useSnapshot(state);
  const [templateError, setTemplateError] = useState("");
  const getFieldValues = useCallback(() => {
    try {
      const parsed = Handlebars.parse(content);
      const names = parsed.body
        .filter((i) => i.type === "MustacheStatement")
        .map((block) => {
          // @ts-expect-error
          const type = block.hash?.pairs?.find((i) => i.key == "type");
          // @ts-expect-error
          const attach = block.hash?.pairs?.find((i) => i.key == "attach");
          // @ts-expect-error
          const label = block.hash?.pairs?.find((i) => i.key == "label");
          const key =
            // @ts-expect-error
            block?.path?.original === "customize_input"
              ? // @ts-expect-error
                block?.params?.[0].original
              : // @ts-expect-error
                block?.path?.original;
          return {
            key,
            label: label?.value?.original || key,
            attach: attach?.value?.original,
            type: type?.value?.original,
            value: "",
          };
        });
      const defaultState: Fields = {};

      if (names) {
        names.forEach((field) => (defaultState[field.key] = field));
      }
      setTemplateError("");
      return defaultState;
    } catch (err) {
      console.log(err);
      setTemplateError("Could not parse template");
      return undefined;
    }
  }, [content]);

  // const defaultFieldValues = getFieldValues();

  const [fields, setFields] = useState<Fields>({});
  const [iFrameCode, setIframeCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const runScript = () => {
    const fieldsToSend: Record<string, string> = {};
    Object.entries(fields).map(([key, obj]) => {
      fieldsToSend[key] = obj.value;
    });
    const template = Handlebars.compile(content, { strict: false });
    try {
      const code = template(fieldsToSend);
      setIframeCode(generateHtmlTemplate(code));
      state.scriptLogs = [
        ...snap.scriptLogs,
        { type: "success", message: "Started running..." },
      ];
    } catch (err) {
      state.scriptLogs = [
        ...snap.scriptLogs,
        // @ts-expect-error
        { type: "error", message: err?.message || "Could not parse template" },
      ];
    }
  };

  useEffect(() => {
    const handleEvent = (e: any) => {
      if (e.data.type === "log" || e.data.type === "error") {
        const data: ILog[] = e.data.args.map((msg: any) => ({
          type: e.data.type,
          message: typeof msg === "string" ? msg : JSON.stringify(msg, null, 2),
        }));
        state.scriptLogs = [...snap.scriptLogs, ...data];
      }
    };
    window.addEventListener("message", handleEvent);
    return () => window.removeEventListener("message", handleEvent);
  }, [snap.scriptLogs]);

  useEffect(() => {
    const newDefaultState = getFieldValues();
    setFields(newDefaultState || {});
  }, [content, setFields, getFieldValues]);

  const options = snap.accounts?.map((acc) => ({
    label: acc.name,
    secret: acc.secret,
    address: acc.address,
    value: acc.address,
  }));

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="primary"
            onClick={() => {
              saveFile(false);
              setIframeCode("");
            }}
          >
            <Play weight="bold" size="16px" /> {name}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Run {name} script</DialogTitle>
          <DialogDescription>
            You are about to run scripts provided by the developer of the hook,
            make sure you know what you are doing.
            <br />
            {templateError && (
              <Box
                as="span"
                css={{ display: "block", color: "$error", mt: "$3" }}
              >
                Error occured while parsing template, modify script and try
                again!
              </Box>
            )}
            <br />
            {Object.keys(fields).length > 0
              ? `You also need to fill in following parameters to run the script`
              : ""}
          </DialogDescription>
          <Stack css={{ width: "100%" }}>
            {Object.keys(fields).map((key) => (
              <Box key={key} css={{ width: "100%" }}>
                <label>
                  {fields[key]?.label || key}{" "}
                  {fields[key].attach === "account_secret" &&
                    `(Script uses account secret)`}
                </label>
                {fields[key].attach === "account_secret" ||
                fields[key].attach === "account_address" ? (
                  <Select
                    css={{ mt: "$1" }}
                    options={options}
                    onChange={(val: any) => {
                      setFields({
                        ...fields,
                        [key]: {
                          ...fields[key],
                          value:
                            fields[key].attach === "account_secret"
                              ? val.secret
                              : val.address,
                        },
                      });
                    }}
                    value={options.find(
                      (opt) =>
                        opt.address === fields[key].value ||
                        opt.secret === fields[key].value
                    )}
                  />
                ) : (
                  <Input
                    type={fields[key].type || "text"}
                    value={
                      typeof fields[key].value !== "string"
                        ? // @ts-expect-error
                          fields[key].value.value
                        : fields[key].value
                    }
                    css={{ mt: "$1" }}
                    onChange={(e) => {
                      setFields({
                        ...fields,
                        [key]: { ...fields[key], value: e.target.value },
                      });
                    }}
                  />
                )}
              </Box>
            ))}
            <Flex
              css={{ justifyContent: "flex-end", width: "100%", gap: "$3" }}
            >
              <DialogClose asChild>
                <Button outline>Cancel</Button>
              </DialogClose>
              <Button
                variant="primary"
                isDisabled={
                  (Object.entries(fields).length > 0 &&
                    Object.entries(fields).some(([key, obj]) => !obj.value)) ||
                  Boolean(templateError)
                }
                onClick={() => {
                  state.scriptLogs = [];
                  runScript();
                  setIsDialogOpen(false);
                }}
              >
                Run script
              </Button>
            </Flex>
          </Stack>
          <DialogClose asChild>
            <Box
              css={{
                position: "absolute",
                top: "$1",
                right: "$1",
                cursor: "pointer",
                background: "$mauve1",
                display: "flex",
                borderRadius: "$full",
                p: "$1",
              }}
            >
              <X size="20px" />
            </Box>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {iFrameCode && (
        <iframe
          style={{ display: "none" }}
          srcDoc={iFrameCode}
          sandbox="allow-scripts"
        />
      )}
    </>
  );
};

export default RunScript;
