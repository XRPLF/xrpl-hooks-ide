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
                  key={file.name}
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
                      p: "1px",
                      borderRadius: "$full",
                      mr: "-4px",
                    }}
                    onClick={() => state.files.splice(index, 1)}
                  >
                    <X size="13px" />
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
                  <span>
                    Create empty C file or select one of the existing ones
                  </span>
                  <input
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
          backgroundColor: "$slate3",
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
              border: "1px solid $slate10",
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
                  <span>You can edit your editor settings here</span>
                  <input
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
