/** @jsxImportSource theme-ui */
import Link from "next/link";
import { DownloadSimple, Plus, Share, BookOpen } from "phosphor-react";
import {
  Container,
  Box,
  Heading,
  Button,
  Spinner,
  useColorMode,
} from "theme-ui";
import { useSnapshot } from "valtio";
import { Sun, MoonStars } from "phosphor-react";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import Dropdown from "./DropdownMenu";

import Stack from "./Stack";
import Logo from "./Logo";
// import Button from "./Button";
import { state } from "../state";

const Navigation = () => {
  const snap = useSnapshot(state);
  const [mode, setColorMode] = useColorMode();
  const { data: session, status } = useSession();
  console.log(session);
  return (
    <Box
      as="nav"
      sx={{
        display: "flex",
        height: "60px",
        bg: "background",
        // borderBottom: "1px solid",
        borderColor: "text",
      }}
    >
      <Container sx={{ display: "flex", alignItems: "center", py: 2 }}>
        <Link href="/" passHref>
          <Box as="a" sx={{ display: "flex", alignItems: "center" }}>
            <Logo width="30px" height="30px" />
            <Heading as="h3" sx={{ fontWeight: "bold", ml: 2 }}>
              XRPL Hooks
            </Heading>
          </Box>
        </Link>
        <Box sx={{ ml: 3 }}></Box>
        <Stack sx={{ ml: 3 }} spacing={2}>
          {state.loading && "loading"}
          {snap.files &&
            snap.files.length > 0 &&
            snap.files?.map((file, index) => (
              <Button
                onClick={() => (state.active = index)}
                key={file.name}
                variant={snap.active === index ? "secondary" : "muted"}
              >
                {file.name}
              </Button>
            ))}
        </Stack>
        <Stack sx={{ color: "text", ml: "auto" }}>
          <Plus sx={{ display: "flex" }} size="20px" />
          <Share sx={{ display: "flex" }} size="20px" />
          <DownloadSimple sx={{ display: "flex" }} size="20px" />
          <Box
            color="text"
            onClick={(e) => {
              setColorMode(mode === "light" ? "dark" : "light");
            }}
            sx={{
              display: "flex",
              marginLeft: "auto",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            {mode === "dark" ? <Sun size="20px" /> : <MoonStars size="20px" />}
          </Box>
          {status === "authenticated" && (
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <Box sx={{ borderRadius: "100%", overflow: "hidden" }}>
                  <Image
                    src={session?.user?.image || ""}
                    width="30px"
                    height="30px"
                    objectFit="cover"
                    alt="User avatar"
                  />
                </Box>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <Dropdown.Item onClick={() => signOut()}>Log out</Dropdown.Item>
                <Dropdown.Arrow offset={10} />
              </Dropdown.Content>
            </Dropdown.Root>
          )}
          {status === "unauthenticated" && (
            <Button
              sx={{ size: "sm", cursor: "pointer" }}
              onClick={() => signIn("github")}
            >
              Github Login
            </Button>
          )}
          {status === "loading" && <Spinner size="20px" />}
          {/* <Box
              sx={{
                border: "1px solid",
                borderRadius: "3px",
                borderColor: "text",
                p: 1,
              }}
            >
              <BookOpen sx={{ display: "flex" }} size="20px" />
            </Box> */}
        </Stack>
      </Container>
    </Box>
  );
};

export default Navigation;
