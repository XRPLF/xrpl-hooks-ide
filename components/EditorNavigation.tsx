import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Share,
  DownloadSimple,
  Gear,
  X,
  GithubLogo,
  SignOut,
  ArrowSquareOut,
  CloudArrowUp,
  CaretDown,
  User,
  FilePlus,
} from "phosphor-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
  DropdownMenuSeparator,
} from "./DropdownMenu";
import NewWindow from "react-new-window";
import { signOut, useSession } from "next-auth/react";
import { useSnapshot } from "valtio";

import { createNewFile, syncToGist, updateEditorSettings, downloadAsZip } from "../state/actions";
import state from "../state";
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
import Input from "./Input";
import Text from "./Text";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "./AlertDialog";
import { styled } from "../stitches.config";

const DEFAULT_EXTENSION = ".c";

const ErrorText = styled(Text, {
  color: "$red9",
  mt: "$1",
  display: "block",
});

const EditorNavigation = ({ showWat }: { showWat?: boolean }) => {
  const snap = useSnapshot(state);
  const [createNewAlertOpen, setCreateNewAlertOpen] = useState(false);
  const [editorSettingsOpen, setEditorSettingsOpen] = useState(false);
  const [isNewfileDialogOpen, setIsNewfileDialogOpen] = useState(false);
  const [newfileError, setNewfileError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const { data: session, status } = useSession();
  const [popup, setPopUp] = useState(false);
  const [editorSettings, setEditorSettings] = useState(snap.editorSettings);
  useEffect(() => {
    if (session && session.user && popup) {
      setPopUp(false);
    }
  }, [session, popup]);

  // when filename changes, reset error
  useEffect(() => {
    setNewfileError(null);
  }, [filename, setNewfileError]);

  const validateFilename = useCallback(
    (filename: string): { error: string | null } => {
      if (snap.files.find(file => file.name === filename)) {
        return { error: "Filename already exists." };
      }
      // More checks in future
      return { error: null };
    },
    [snap.files]
  );
  const handleConfirm = useCallback(() => {
    // add default extension in case omitted
    let _filename = filename.includes(".") ? filename : filename + DEFAULT_EXTENSION;
    const chk = validateFilename(_filename);
    if (chk.error) {
      setNewfileError(`Error: ${chk.error}`);
      return;
    }

    setIsNewfileDialogOpen(false);
    createNewFile(_filename);
    setFilename("");
  }, [filename, setIsNewfileDialogOpen, setFilename, validateFilename]);

  const files = snap.files;
  return (
    <Flex css={{ flexShrink: 0, gap: "$0" }}>
      <Flex
        css={{
          overflowX: "scroll",
          py: "$3",
          flex: 1,
          "&::-webkit-scrollbar": {
            height: 0,
            background: "transparent",
          },
        }}
      >
        <Container css={{ flex: 1 }}>
          <Stack
            css={{
              gap: "$3",
              flex: 1,
              flexWrap: "nowrap",
              marginBottom: "-1px",
            }}
          >
            {files &&
              files.length > 0 &&
              files.map((file, index) => {
                if (!file.compiledContent && showWat) {
                  return null;
                }
                return (
                  <Button
                    size="sm"
                    outline={showWat ? snap.activeWat !== index : snap.active !== index}
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
                    {showWat && ".wat"}
                    {!showWat && (
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
                          state.active = index > snap.active ? snap.active : snap.active - 1;
                        }}
                      >
                        <X size="9px" weight="bold" />
                      </Box>
                    )}
                  </Button>
                );
              })}
            {!showWat && (
              <Dialog open={isNewfileDialogOpen} onOpenChange={setIsNewfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button ghost size="sm" css={{ alignItems: "center", px: "$2", mr: "$3" }}>
                    <Plus size="16px" /> {snap.files.length === 0 && "Add new file"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Create new file</DialogTitle>
                  <DialogDescription>
                    <label>Filename</label>
                    <Input
                      value={filename}
                      onChange={e => setFilename(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === "Enter") {
                          handleConfirm();
                        }
                      }}
                    />
                    <ErrorText>{newfileError}</ErrorText>
                  </DialogDescription>

                  <Flex
                    css={{
                      marginTop: 25,
                      justifyContent: "flex-end",
                      gap: "$3",
                    }}
                  >
                    <DialogClose asChild>
                      <Button outline>Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="primary"
                      onClick={handleConfirm}
                    >
                      Create file
                    </Button>
                  </Flex>
                  <DialogClose asChild>
                    <Box css={{ position: "absolute", top: "$3", right: "$3" }}>
                      <X size="20px" />
                    </Box>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            )}
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
        <Container css={{ width: "unset", display: "flex", alignItems: "center" }}>
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Box
                  css={{
                    display: "flex",
                    borderRadius: "$full",
                    overflow: "hidden",
                    width: "$6",
                    height: "$6",
                    boxShadow: "0px 0px 0px 1px $colors$mauve11",
                    position: "relative",
                    mr: "$3",
                    "@hover": {
                      "&:hover": {
                        cursor: "pointer",
                        boxShadow: "0px 0px 0px 1px $colors$mauve12",
                      },
                    },
                  }}
                >
                  <Image
                    src={session?.user?.image || ""}
                    width="30px"
                    height="30px"
                    objectFit="cover"
                    alt="User avatar"
                  />
                </Box>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem disabled onClick={() => signOut()}>
                  <User size="16px" /> {session?.user?.username} ({session?.user.name})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`http://gist.github.com/${session?.user.username}`)}
                >
                  <ArrowSquareOut size="16px" />
                  Go to your Gist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <SignOut size="16px" /> Log out
                </DropdownMenuItem>

                <DropdownMenuArrow offset={10} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button outline size="sm" css={{ mr: "$3" }} onClick={() => setPopUp(true)}>
              <GithubLogo size="16px" /> Login
            </Button>
          )}

          <Stack
            css={{
              display: "inline-flex",
              marginLeft: "auto",
              flexShrink: 0,
              gap: "$0",
              borderRadius: "$sm",
              boxShadow: "inset 0px 0px 0px 1px $colors$mauve10",
              zIndex: 9,
              position: "relative",
              button: {
                borderRadius: 0,
                px: "$2",
                alignSelf: "flex-start",
                boxShadow: "none",
              },
              "button:not(:first-child):not(:last-child)": {
                borderRight: 0,
                borderLeft: 0,
              },
              "button:first-child": {
                borderTopLeftRadius: "$sm",
                borderBottomLeftRadius: "$sm",
              },
              "button:last-child": {
                borderTopRightRadius: "$sm",
                borderBottomRightRadius: "$sm",
                boxShadow: "inset 0px 0px 0px 1px $colors$mauve10",
                "&:hover": {
                  boxShadow: "inset 0px 0px 0px 1px $colors$mauve12",
                },
              },
            }}
          >
            <Button disabled={state.zipLoading} onClick={downloadAsZip} outline size="sm" css={{ alignItems: "center" }}>
              <DownloadSimple size="16px" />
            </Button>
            <Button
              outline
              size="sm"
              css={{ alignItems: "center" }}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/develop/${snap.gistId}`);
                toast.success("Copied share link to clipboard!");
              }}
            >
              <Share size="16px" />
            </Button>
            <Button
              outline
              size="sm"
              disabled={!session || !session.user}
              isLoading={snap.gistLoading}
              css={{ alignItems: "center" }}
              onClick={() => {
                if (snap.gistOwner === session?.user.username) {
                  syncToGist(session);
                } else {
                  setCreateNewAlertOpen(true);
                }
              }}
            >
              <CloudArrowUp size="16px" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button outline size="sm">
                  <CaretDown size="16px" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem disabled={state.zipLoading} onClick={downloadAsZip}>
                  <DownloadSimple size="16px" /> Download as ZIP
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/develop/${snap.gistId}`
                    );
                    toast.success("Copied share link to clipboard!");
                  }}
                >
                  <Share size="16px" />
                  Copy share link to clipboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={session?.user.username !== snap.gistOwner || !snap.gistId}
                  onClick={() => {
                    syncToGist(session);
                  }}
                >
                  <CloudArrowUp size="16px" /> Push to Gist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={status !== "authenticated"}
                  onClick={() => {
                    setCreateNewAlertOpen(true);
                  }}
                >
                  <FilePlus size="16px" /> Create as a new Gist
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setEditorSettingsOpen(true)}>
                  <Gear size="16px" /> Editor Settings
                </DropdownMenuItem>

                <DropdownMenuArrow offset={10} />
              </DropdownMenuContent>
            </DropdownMenu>
          </Stack>

          {popup && !session ? <NewWindow center="parent" url="/sign-in" /> : null}
        </Container>
      </Flex>
      <AlertDialog open={createNewAlertOpen} onOpenChange={value => setCreateNewAlertOpen(value)}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will create new <strong>public</strong> Github Gist from your current saved
            files. You can delete gist anytime from your GitHub Gists page.
          </AlertDialogDescription>
          <Flex css={{ justifyContent: "flex-end", gap: "$3" }}>
            <AlertDialogCancel asChild>
              <Button outline>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="primary"
                onClick={() => {
                  syncToGist(session, true);
                }}
              >
                <FilePlus size="15px" /> Create new Gist
              </Button>
            </AlertDialogAction>
          </Flex>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editorSettingsOpen} onOpenChange={setEditorSettingsOpen}>
        <DialogTrigger asChild>
          {/* <Button outline size="sm" css={{ alignItems: "center" }}>
                  <Gear size="16px" />
                </Button> */}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Editor settings</DialogTitle>
          <DialogDescription>
            <label>Tab size</label>
            <Input
              type="number"
              min="1"
              value={editorSettings.tabSize}
              onChange={e =>
                setEditorSettings(curr => ({
                  ...curr,
                  tabSize: Number(e.target.value),
                }))
              }
            />
          </DialogDescription>

          <Flex css={{ marginTop: 25, justifyContent: "flex-end", gap: "$3" }}>
            <DialogClose asChild>
              <Button outline onClick={() => updateEditorSettings(editorSettings)}>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="primary" onClick={() => updateEditorSettings(editorSettings)}>
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
    </Flex>
  );
};

export default EditorNavigation;
