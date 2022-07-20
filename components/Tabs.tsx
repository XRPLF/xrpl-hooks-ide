import React, {
  useEffect,
  useState,
  Fragment,
  isValidElement,
  useCallback,
} from "react";
import type { ReactNode, ReactElement } from "react";
import { Box, Button, Flex, Input, Label, Stack, Text } from ".";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./Dialog";
import { Plus, X } from "phosphor-react";
import { styled } from "../stitches.config";
import { capitalize } from "../utils/helpers";
import ContextMenu from "./ContextMenu";

const ErrorText = styled(Text, {
  color: "$error",
  mt: "$1",
  display: "block",
});

interface TabProps {
  header: string;
  children?: ReactNode;
}

// TODO customize messages shown
interface Props {
  label?: string;
  activeIndex?: number;
  activeHeader?: string;
  headless?: boolean;
  children: ReactElement<TabProps>[];
  keepAllAlive?: boolean;
  defaultExtension?: string;
  extensionRequired?: boolean;
  allowedExtensions?: string[];
  headerExtraValidation?: {
    regex: string | RegExp;
    error: string;
  };
  onCreateNewTab?: (name: string) => any;
  onCloseTab?: (index: number, header?: string) => any;
  onChangeActive?: (index: number, header?: string) => any;
}

export const Tab = (props: TabProps) => null;

export const Tabs = ({
  label = "Tab",
  children,
  activeIndex,
  activeHeader,
  headless,
  keepAllAlive = false,
  onCreateNewTab,
  onCloseTab,
  onChangeActive,
  headerExtraValidation,
  extensionRequired,
  defaultExtension = "",
  allowedExtensions,
}: Props) => {
  const [active, setActive] = useState(activeIndex || 0);
  const tabs: TabProps[] = children.map(elem => elem.props);

  const [isNewtabDialogOpen, setIsNewtabDialogOpen] = useState(false);
  const [tabname, setTabname] = useState("");
  const [newtabError, setNewtabError] = useState<string | null>(null);

  useEffect(() => {
    if (activeIndex) setActive(activeIndex);
  }, [activeIndex]);

  useEffect(() => {
    if (activeHeader) {
      const idx = tabs.findIndex(tab => tab.header === activeHeader);
      if (idx !== -1) setActive(idx);
      else setActive(0);
    }
  }, [activeHeader, tabs]);

  // when filename changes, reset error
  useEffect(() => {
    setNewtabError(null);
  }, [tabname, setNewtabError]);

  const validateTabname = useCallback(
    (tabname: string): { error: string | null } => {
      if (!tabname) {
        return { error: `Please enter ${label.toLocaleLowerCase()} name.` };
      }
      if (tabs.find(tab => tab.header === tabname)) {
        return { error: `${capitalize(label)} name already exists.` };
      }
      const ext =
        (tabname.includes(".") && tabname.split(".").pop()) ||
        defaultExtension ||
        "";
      if (extensionRequired && !ext) {
        return { error: "File extension is required!" };
      }
      if (allowedExtensions && !allowedExtensions.includes(ext)) {
        return { error: "This file extension is not allowed!" };
      }
      if (
        headerExtraValidation &&
        !tabname.match(headerExtraValidation.regex)
      ) {
        return { error: headerExtraValidation.error };
      }
      return { error: null };
    },
    [
      allowedExtensions,
      defaultExtension,
      extensionRequired,
      headerExtraValidation,
      label,
      tabs,
    ]
  );

  const handleActiveChange = useCallback(
    (idx: number, header?: string) => {
      setActive(idx);
      onChangeActive?.(idx, header);
    },
    [onChangeActive]
  );

  const handleCreateTab = useCallback(() => {
    const chk = validateTabname(tabname);
    if (chk.error) {
      setNewtabError(`Error: ${chk.error}`);
      return;
    }
    let _tabname = tabname;
    if (defaultExtension && !_tabname.endsWith(defaultExtension)) {
      _tabname = `${_tabname}.${defaultExtension}`;
    }

    setIsNewtabDialogOpen(false);
    setTabname("");

    onCreateNewTab?.(_tabname);

    handleActiveChange(tabs.length, _tabname);
  }, [
    tabname,
    defaultExtension,
    validateTabname,
    onCreateNewTab,
    handleActiveChange,
    tabs.length,
  ]);

  const handleCloseTab = useCallback(
    (idx: number) => {
      if (idx <= active && active !== 0) {
        setActive(active - 1);
      }

      onCloseTab?.(idx, tabs[idx].header);

      handleActiveChange(idx, tabs[idx].header);
    },
    [active, handleActiveChange, onCloseTab, tabs]
  );

  return (
    <>
      {!headless && (
        <Stack
          css={{
            gap: "$3",
            flex: 1,
            flexWrap: "nowrap",
            marginBottom: "$2",
            width: "100%",
            overflow: "auto",
          }}
        >
          {tabs.map((tab, idx) => (
            <ContextMenu key={tab.header}>
              <Button
                role="tab"
                tabIndex={idx}
                onClick={() => handleActiveChange(idx, tab.header)}
                onKeyPress={() => handleActiveChange(idx, tab.header)}
                outline={active !== idx}
                size="sm"
                css={{
                  "&:hover": {
                    span: {
                      visibility: "visible",
                    },
                  },
                }}
              >
                {tab.header || idx}
                {onCloseTab && (
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
                      handleCloseTab(idx);
                    }}
                  >
                    <X size="9px" weight="bold" />
                  </Box>
                )}
              </Button>
            </ContextMenu>
          ))}
          {onCreateNewTab && (
            <Dialog
              open={isNewtabDialogOpen}
              onOpenChange={setIsNewtabDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  ghost
                  size="sm"
                  css={{ alignItems: "center", px: "$2", mr: "$3" }}
                >
                  <Plus size="16px" />{" "}
                  {tabs.length === 0 && `Add new ${label.toLocaleLowerCase()}`}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>
                  Create new {label.toLocaleLowerCase()}
                </DialogTitle>
                <DialogDescription>
                  <Label>{label} name</Label>
                  <Input
                    value={tabname}
                    onChange={e => setTabname(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === "Enter") {
                        handleCreateTab();
                      }
                    }}
                  />
                  <ErrorText>{newtabError}</ErrorText>
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
                  <Button variant="primary" onClick={handleCreateTab}>
                    Create
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
      )}
      {keepAllAlive
        ? tabs.map((tab, idx) => {
            // TODO Maybe rule out fragments as children
            if (!isValidElement(tab.children)) {
              if (active !== idx) return null;
              return tab.children;
            }
            let key = tab.children.key || tab.header || idx;
            let { children } = tab;
            let { style, ...props } = children.props;
            return (
              <children.type
                key={key}
                {...props}
                style={{
                  ...style,
                  display: active !== idx ? "none" : undefined,
                }}
              />
            );
          })
        : tabs[active] && (
            <Fragment key={tabs[active].header || active}>
              {tabs[active].children}
            </Fragment>
          )}
    </>
  );
};
