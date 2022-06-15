import Handlebars from "handlebars";
import { Play, X } from "phosphor-react";
import { useEffect, useState } from "react";
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
  kissa
  </body>
  </html>
  `;
};
const RunScript: React.FC<{ file: IFile }> = ({ file }) => {
  const snap = useSnapshot(state);
  const parsed = Handlebars.parse(file.content);
  const names = parsed.body
    .filter((i) => i.type === "MustacheStatement")
    // @ts-expect-error
    .map((block) => block?.path?.original);
  const defaultState: Record<string, string> = {};
  names.forEach((name) => (defaultState[name] = ""));
  const [fields, setFields] = useState<Record<string, string>>(defaultState);
  const [iFrameCode, setIframeCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const runScript = () => {
    const template = Handlebars.compile(file.content);
    const code = template(fields);
    setIframeCode(generateHtmlTemplate(code));
  };

  useEffect(() => {
    const handleEvent = (e: any) => {
      if (e.data.type === "log" || e.data.type === "error") {
        const data: ILog[] = e.data.args.map((msg: any) => ({
          type: e.data.type,
          message: msg.toString(),
        }));
        state.scriptLogs = [...snap.scriptLogs, ...data];
      }
    };
    window.addEventListener("message", handleEvent);
    return () => window.removeEventListener("message", handleEvent);
  }, [snap.scriptLogs]);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="primary"
            onClick={() => {
              setIframeCode("");
            }}
          >
            {file.name} <Play weight="bold" size="16px" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Run {file.name} script</DialogTitle>
          <DialogDescription>
            You are about to run scripts provided by the developer of the hook,
            make sure you know what you are doing.
            <br />
            <br />
            {Object.keys(fields).length > 0
              ? `You also need to fill in following parameters to run the script`
              : ""}
          </DialogDescription>
          <Stack css={{ width: "100%" }}>
            {Object.keys(fields).map((key) => (
              <Box key={key} css={{ width: "100%" }}>
                <label>{key}</label>
                <Input
                  type="text"
                  value={fields[key]}
                  css={{ mt: "$1" }}
                  onChange={(e) =>
                    setFields({ ...fields, [key]: e.target.value })
                  }
                />
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
                  Object.entries(fields).length > 0 &&
                  Object.entries(fields).every(
                    ([key, value]: [string, string]) => !value
                  )
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
