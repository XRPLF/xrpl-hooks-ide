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
import { state } from "../state";
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
        borderBottom: "1px solid $mauve6",
        position: "relative",
        zIndex: 2003,
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
          <Link href="/" passHref>
            <Box
              as="a"
              css={{
                display: "flex",
                alignItems: "center",
                color: "$textColor",
              }}
            >
              <Logo width="30px" height="30px" />
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
                  <Text css={{ color: "$mauve12" }}>
                    {snap.files.length > 0 &&
                      `${snap.gistOwner || "-"}/${truncate(snap.gistId || "")}`}
                  </Text>
                </Text>
              </>
            )}
          </Flex>
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
                      "@md": {
                        width: "30%",
                        borderBottom: "0px",
                        borderRight: "1px solid $colors$mauve5",
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
                      }}
                    >
                      <Logo width="30px" height="30px" /> XRPL Hooks Editor
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
                            color: "$green9",
                            "&:hover": {
                              color: "$green11 !important",
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
                          <ArrowUpRight size="15px" /> Developing Hooks
                        </Text>

                        <Text
                          css={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "$3",
                            color: "$green9",
                            "&:hover": {
                              color: "$green11 !important",
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
                            color: "$green9",
                            "&:hover": {
                              color: "$green11 !important",
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

                  <Flex
                    css={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gridTemplateRows: "max-content",
                      flex: 1,
                      p: "$7",
                      gap: "$3",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      backgroundImage: `url('/pattern.svg'), url('/pattern-2.svg')`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "bottom left, top right",
                      "@md": {
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gridTemplateRows: "max-content",
                      },
                    }}
                  >
                    <PanelBox
                      as="a"
                      href="/develop/be088224fb37c0075e84491da0e602c1"
                    >
                      <Heading>Starter</Heading>
                      <Text>Just an empty starter with essential imports</Text>
                    </PanelBox>
                    <PanelBox
                      as="a"
                      href="/develop/be088224fb37c0075e84491da0e602c1"
                    >
                      <Heading>Firewall</Heading>
                      <Text>
                        This Hook essentially checks a blacklist of accounts
                      </Text>
                    </PanelBox>
                    <PanelBox
                      as="a"
                      href="/develop/be088224fb37c0075e84491da0e602c1"
                    >
                      <Heading>Accept</Heading>
                      <Text>
                        This hook just accepts any transaction coming through it
                      </Text>
                    </PanelBox>
                    <PanelBox
                      as="a"
                      href="/develop/be088224fb37c0075e84491da0e602c1"
                    >
                      <Heading>Accept</Heading>
                      <Text>
                        This hook just accepts any transaction coming through it
                      </Text>
                    </PanelBox>
                  </Flex>
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
            <Button outline disabled>
              <BookOpen size="15px" />
            </Button>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navigation;
