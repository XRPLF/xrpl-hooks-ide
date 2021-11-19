import React from "react";
import Link from "next/link";
import {
  Gear,
  GithubLogo,
  SignOut,
  User,
  ArrowSquareOut,
} from "phosphor-react";
import { useSnapshot } from "valtio";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
  DropdownMenuSeparator,
} from "./DropdownMenu";

import Stack from "./Stack";
import Logo from "./Logo";
import Button from "./Button";
import Flex from "./Flex";
import Container from "./Container";
import Box from "./Box";
import ThemeChanger from "./ThemeChanger";
import { useRouter } from "next/router";

const Navigation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  return (
    <Box
      as="nav"
      css={{
        display: "flex",
        height: "60px",
        borderBottom: "1px solid $mauve6",
        position: "relative",
        zIndex: 2003,
      }}
    >
      <Container
        css={{
          display: "flex",
          alignItems: "center",
          py: "$2",
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
            flex: 1,
            flexWrap: "nowrap",
            marginLeft: "$3",
            overflowX: "scroll",
          }}
        >
          <Stack
            css={{
              ml: "$4",
              gap: "$3",
              flexWrap: "nowrap",
              alignItems: "center",
              pr: "$3",
            }}
          >
            <Link href="/develop" passHref shallow>
              <Button
                as="a"
                outline={!router.pathname.includes("/develop")}
                uppercase
              >
                Develop
              </Button>
            </Link>
            <Link href="/deploy" passHref shallow>
              <Button
                as="a"
                outline={!router.pathname.includes("/deploy")}
                uppercase
              >
                Deploy
              </Button>
            </Link>
            <Link href="/test" passHref shallow>
              <Button
                as="a"
                outline={!router.pathname.includes("/test")}
                uppercase
              >
                Test
              </Button>
            </Link>
            <ThemeChanger />
          </Stack>
        </Flex>
        <Stack
          css={{
            color: "text",
            ml: "auto",
            flexWrap: "nowrap",
            marginLeft: "$3",
            "@sm": {
              marginLeft: "auto",
            },
          }}
        >
          {status === "authenticated" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Box
                  css={{
                    borderRadius: "$full",
                    overflow: "hidden",
                    width: "30px",
                    height: "30px",
                    position: "relative",
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
                  <User size="16px" /> {session?.user?.username} (
                  {session?.user.name})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `http://gist.github.com/${session?.user.username}`
                    )
                  }
                >
                  <ArrowSquareOut size="16px" />
                  Go to your Gist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Gear size="16px" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <SignOut size="16px" /> Log out
                </DropdownMenuItem>
                <DropdownMenuArrow offset={10} />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {status !== "authenticated" && (
            <Button
              isLoading={status === "loading"}
              outline
              onClick={() => signIn("github")}
            >
              <GithubLogo size="16px" /> GitHub Login
            </Button>
          )}
          {/* <Box
              css={{
                border: "1px solid",
                borderRadius: "3px",
                borderColor: "text",
                p: 1,
              }}
            >
              <BookOpen size="20px" />
            </Box> */}
        </Stack>
      </Container>
    </Box>
  );
};

export default Navigation;
