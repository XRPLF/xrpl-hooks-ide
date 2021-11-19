import React, { useRef, useState } from "react";
import { Plus, Share, DownloadSimple, Gear, X } from "phosphor-react";
import { useTheme } from "next-themes";

import { createNewFile, state, updateEditorSettings } from "../state";
import Box from "./Box";
import Button from "./Button";
import Container from "./Container";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./Dialog";
import Flex from "./Flex";
import Stack from "./Stack";
import { useSnapshot } from "valtio";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Input from "./Input";

const EditorNavigation = () => {
  const snap = useSnapshot(state);
  const [filename, setFilename] = useState("");
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editorSettings, setEditorSettings] = useState(snap.editorSettings);
  return (
    <Flex css={{ flexShrink: 0, gap: "$0" }}>
      <Flex css={{ overflowX: "scroll", py: "$3", flex: 1 }}>
        <Container css={{ flex: 1 }}>
          <Stack css={{ gap: "$3", flex: 1, flexWrap: "nowrap" }}>
            {state.loading && "loading"}
            {snap.files &&
              snap.files.length > 0 &&
              snap.files?.map((file, index) => (
                <Button
                  size="sm"
                  outline={snap.active !== index}
                  onClick={() => (state.active = index)}
                  key={file.name + index}
                  css={{
                    "&:hover": {
                      span: {
                        visibility: "visible",
                      },
                    },
                  }}
                >
                  {file.name}
                  <Box
                    as="span"
                    css={{
                      display: "flex",
                      p: "2px",
                      borderRadius: "$full",
                      mr: "-4px",
                      "&:hover": {
                        // boxSizing: "0px 0px 1px",
                        backgroundColor: "$mauve2",
                        color: "$mauve12",
                      },
                    }}
                    onClick={(ev: React.MouseEvent<HTMLElement>) => {
                      ev.stopPropagation();
                      // Remove file from state
                      state.files.splice(index, 1);
                      // Change active file state
                      // If deleted file is behind active tab
                      // we keep the current state otherwise
                      // select previous file on the list
                      state.active =
                        index > snap.active ? snap.active : snap.active - 1;
                    }}
                  >
                    <X size="9px" weight="bold" />
                  </Box>
                </Button>
              ))}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  ghost
                  size="sm"
                  css={{ alignItems: "center", px: "$2", mr: "$3" }}
                >
                  <Plus size="16px" />{" "}
                  {snap.files.length === 0 && "Add new file"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Create new file</DialogTitle>
                <DialogDescription>
                  <label>Filename</label>
                  <Input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                  />
                </DialogDescription>

                <Flex
                  css={{ marginTop: 25, justifyContent: "flex-end", gap: "$3" }}
                >
                  <DialogClose asChild>
                    <Button outline>Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="primary"
                      onClick={() => {
                        createNewFile(filename);
                        // reset
                        setFilename("");
                      }}
                    >
                      Create file
                    </Button>
                  </DialogClose>
                </Flex>
                <DialogClose asChild>
                  <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
                    <X size="20px" />
                  </Box>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </Stack>
        </Container>
      </Flex>
      <Flex
        css={{
          py: "$3",
          backgroundColor: "$mauve3",
          zIndex: 1,
        }}
      >
        <Container css={{ width: "unset" }}>
          <Stack
            css={{
              display: "inline-flex",
              marginLeft: "auto",
              flexShrink: 0,
              gap: "$0",
              border: "1px solid $mauve10",
              borderRadius: "$sm",
              zIndex: 9,
              position: "relative",
              overflow: "hidden",
              button: {
                borderRadius: "$0",
                px: "$2",
                alignSelf: "flex-start",
              },
            }}
          >
            <Button ghost size="sm" css={{ alignItems: "center" }}>
              <DownloadSimple size="16px" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button ghost size="sm" css={{ alignItems: "center" }}>
                  <Share size="16px" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Share hook</DialogTitle>
                <DialogDescription>
                  <span>
                    We will store your hook code in public GitHub Gist and
                    generate link to that
                  </span>
                </DialogDescription>

                <Flex
                  css={{ marginTop: 25, justifyContent: "flex-end", gap: "$3" }}
                >
                  <DialogClose asChild>
                    <Button outline>Cancel</Button>
                  </DialogClose>
                </Flex>
                <DialogClose asChild>
                  <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
                    <X size="20px" />
                  </Box>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button ghost size="sm" css={{ alignItems: "center" }}>
                  <Gear size="16px" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Editor settings</DialogTitle>
                <DialogDescription>
                  <label>Tab size</label>
                  <Input
                    type="number"
                    min="1"
                    value={editorSettings.tabSize}
                    onChange={(e) =>
                      setEditorSettings((curr) => ({
                        ...curr,
                        tabSize: Number(e.target.value),
                      }))
                    }
                  />
                </DialogDescription>

                <Flex
                  css={{ marginTop: 25, justifyContent: "flex-end", gap: "$3" }}
                >
                  <DialogClose asChild>
                    <Button
                      outline
                      onClick={() => updateEditorSettings(editorSettings)}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="primary"
                      onClick={() => updateEditorSettings(editorSettings)}
                    >
                      Save changes
                    </Button>
                  </DialogClose>
                </Flex>
                <DialogClose asChild>
                  <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
                    <X size="20px" />
                  </Box>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </Stack>
        </Container>
      </Flex>
    </Flex>
  );
};

export default EditorNavigation;
