import React from "react";
import Link from "next/link";

import { useSnapshot } from "valtio";
import { useRouter } from "next/router";
import { FolderOpen, X, ArrowUpRight, BookOpen } from "phosphor-react";

import Stack from "./Stack";
import Logo from "./Logo";
import Button from "./Button";
import Flex from "./Flex";
import Container from "./Container";
import Box from "./Box";
import ThemeChanger from "./ThemeChanger";
import state from "../state";
import Heading from "./Heading";
import Text from "./Text";
import Spinner from "./Spinner";
import truncate from "../utils/truncate";
import ButtonGroup from "./ButtonGroup";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import PanelBox from "./PanelBox";
import { templateFileIds } from "../state/constants";

const Navigation = () => {
  const router = useRouter();
  const snap = useSnapshot(state);
  const slug = router.query?.slug;
  const gistId = Array.isArray(slug) ? slug[0] : null;

  return (
    <Box
      as="nav"
      css={{
        display: "flex",
        backgroundColor: "$mauve1",
        borderBottom: "1px solid $mauve6",
        position: "relative",
        zIndex: 2003,
        height: "60px",
      }}
    >
      <Container
        css={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Flex
          css={{
            flex: 1,
            alignItems: "center",
            borderRight: "1px solid $colors$mauve6",
            py: "$3",
            pr: "$4",
          }}
        >
          <Link href={gistId ? `/develop/${gistId}` : "/develop"} passHref>
            <Box
              as="a"
              css={{
                display: "flex",
                alignItems: "center",
                color: "$textColor",
              }}
            >
              <Logo width="32px" height="32px" />
            </Box>
          </Link>
          <Flex
            css={{
              ml: "$5",
              flexDirection: "column",
              gap: "1px",
            }}
          >
            {snap.loading ? (
              <Spinner />
            ) : (
              <>
                <Heading css={{ lineHeight: 1 }}>
                  {snap.files?.[0]?.name || "XRPL Hooks"}
                </Heading>
                <Text
                  css={{ fontSize: "$xs", color: "$mauve10", lineHeight: 1 }}
                >
                  {snap.files.length > 0 ? "Gist: " : "Playground"}
                  {snap.files.length > 0 && (
                    <Link
                      href={`https://gist.github.com/${snap.gistOwner || ""}/${
                        snap.gistId || ""
                      }`}
                      passHref
                    >
                      <Text
                        as="a"
                        target="_blank"
                        rel="noreferrer noopener"
                        css={{ color: "$mauve12" }}
                      >
                        {`${snap.gistOwner || "-"}/${truncate(
                          snap.gistId || ""
                        )}`}
                      </Text>
                    </Link>
                  )}
                </Text>
              </>
            )}
          </Flex>
          {router.isReady && (
            <ButtonGroup css={{ marginLeft: "auto" }}>
              <Dialog
                open={snap.mainModalOpen}
                onOpenChange={(open) => (state.mainModalOpen = open)}
              >
                <DialogTrigger asChild>
                  <Button outline>
                    <FolderOpen size="15px" />
                  </Button>
                </DialogTrigger>
                <DialogContent
                  css={{
                    maxWidth: "100%",
                    width: "80vw",
                    height: "80%",
                    backgroundColor: "$mauve1 !important",
                    overflowY: "auto",
                    p: 0,
                  }}
                >
                  <Flex
                    css={{
                      flexDirection: "column",
                      flex: 1,
                      height: "auto",
                      "@md": {
                        flexDirection: "row",
                        height: "100%",
                      },
                    }}
                  >
                    <Flex
                      css={{
                        borderBottom: "1px solid $colors$mauve5",
                        width: "100%",
                        flexDirection: "column",
                        p: "$7",
                        height: "100%",
                        backgroundColor: "$mauve2",
                        "@md": {
                          width: "30%",
                          maxWidth: "300px",
                          borderBottom: "0px",
                          borderRight: "1px solid $colors$mauve6",
                        },
                      }}
                    >
                      <DialogTitle
                        css={{
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "$3",
                          fontSize: "$xl",
                          lineHeight: "$one",
                          fontWeight: "$bold",
                        }}
                      >
                        <Logo width="48px" height="48px" /> XRPL Hooks Builder
                      </DialogTitle>
                      <DialogDescription as="div">
                        <Text
                          css={{
                            display: "inline-flex",
                            color: "inherit",
                            my: "$5",
                            mb: "$7",
                          }}
                        >
                          Hooks add smart contract functionality to the XRP
                          Ledger.
                        </Text>
                        <Flex
                          css={{ flexDirection: "column", gap: "$2", mt: "$2" }}
                        >
                          <Text
                            css={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "$3",
                              color: "$purple10",
                              "&:hover": {
                                color: "$purple11",
                              },
                              "&:focus": {
                                outline: 0,
                              },
                            }}
                            as="a"
                            rel="noreferrer noopener"
                            target="_blank"
                            href="https://github.com/XRPL-Labs/xrpld-hooks"
                          >
                            <ArrowUpRight size="15px" /> Hooks Github
                          </Text>

                          <Text
                            css={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "$3",
                              color: "$purple10",
                              "&:hover": {
                                color: "$purple11",
                              },
                              "&:focus": {
                                outline: 0,
                              },
                            }}
                            as="a"
                            rel="noreferrer noopener"
                            target="_blank"
                            href="https://xrpl-hooks.readme.io/docs"
                          >
                            <ArrowUpRight size="15px" /> Hooks documentation
                          </Text>
                          <Text
                            css={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "$3",
                              color: "$purple10",
                              "&:hover": {
                                color: "$purple11",
                              },
                              "&:focus": {
                                outline: 0,
                              },
                            }}
                            as="a"
                            rel="noreferrer noopener"
                            target="_blank"
                            href="https://xrpl.org/docs.html"
                          >
                            <ArrowUpRight size="15px" /> XRPL documentation
                          </Text>
                        </Flex>
                      </DialogDescription>
                    </Flex>
                    <div>
                      <Flex
                        css={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gridTemplateRows: "max-content",
                          flex: 1,
                          p: "$7",
                          gap: "$3",
                          alignItems: "normal",
                          flexWrap: "wrap",
                          backgroundColor: "$mauve1",
                          "@md": {
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gridTemplateRows: "max-content",
                          },
                        }}
                      >
                        <PanelBox
                          as="a"
                          href={`/develop/${templateFileIds.starter}`}
                        >
                          <Heading>Starter</Heading>
                          <Text>
                            Just a basic starter with essential imports
                          </Text>
                        </PanelBox>
                        <PanelBox
                          as="a"
                          href={`/develop/${templateFileIds.firewall}`}
                        >
                          <Heading>Firewall</Heading>
                          <Text>
                            This Hook essentially checks a blacklist of accounts
                          </Text>
                        </PanelBox>
                        <PanelBox
                          as="a"
                          href={`/develop/${templateFileIds.notary}`}
                        >
                          <Heading>Notary</Heading>
                          <Text>
                            Collecting signatures for multi-sign transactions
                          </Text>
                        </PanelBox>
                        <PanelBox
                          as="a"
                          href={`/develop/${templateFileIds.carbon}`}
                        >
                          <Heading>Carbon</Heading>
                          <Text>Send a percentage of sum to an address</Text>
                        </PanelBox>
                        <PanelBox
                          as="a"
                          href={`/develop/${templateFileIds.peggy}`}
                        >
                          <Heading>Peggy</Heading>
                          <Text>An oracle based stable coin hook</Text>
                        </PanelBox>
                      </Flex>
                    </div>
                  </Flex>
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
              <ThemeChanger />
            </ButtonGroup>
          )}
        </Flex>
        <Flex
          css={{
            flexWrap: "nowrap",
            marginLeft: "$4",
            overflowX: "scroll",
            "&::-webkit-scrollbar": {
              height: 0,
              background: "transparent",
            },
          }}
        >
          <Stack
            css={{
              ml: "$4",
              gap: "$3",
              flexWrap: "nowrap",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <ButtonGroup>
              <Link
                href={gistId ? `/develop/${gistId}` : "/develop"}
                passHref
                shallow
              >
                <Button
                  as="a"
                  outline={!router.pathname.includes("/develop")}
                  uppercase
                >
                  Develop
                </Button>
              </Link>
              <Link
                href={gistId ? `/deploy/${gistId}` : "/deploy"}
                passHref
                shallow
              >
                <Button
                  as="a"
                  outline={!router.pathname.includes("/deploy")}
                  uppercase
                >
                  Deploy
                </Button>
              </Link>
              <Link
                href={gistId ? `/test/${gistId}` : "/test"}
                passHref
                shallow
              >
                <Button
                  as="a"
                  outline={!router.pathname.includes("/test")}
                  uppercase
                >
                  Test
                </Button>
              </Link>
            </ButtonGroup>
            <Link href="https://xrpl-hooks.readme.io/" passHref>
              <a target="_blank" rel="noreferrer noopener">
                <Button outline>
                  <BookOpen size="15px" />
                </Button>
              </a>
            </Link>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navigation;
