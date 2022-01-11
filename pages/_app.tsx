import { useEffect, useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { IdProvider } from "@radix-ui/react-id";

import { darkTheme, css } from "../stitches.config";
import Navigation from "../components/Navigation";
import { fetchFiles } from "../state/actions";
import state from "../state";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const slug = router.query?.slug;
  const gistId = (Array.isArray(slug) && slug[0]) ?? null;

  useEffect(() => {
    if (gistId && router.isReady) {
      fetchFiles(gistId);
    } else {
      if (!gistId && router.isReady && !router.pathname.includes("/sign-in")) {
        state.mainModalOpen = true;
      }
    }
  }, [gistId, router.isReady, router.pathname]);

  return (
    <>
      <Head>
        <title>XRPL Hooks Playground</title>
      </Head>
      <IdProvider>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            value={{
              light: "light",
              dark: darkTheme.className,
            }}
          >
            <Navigation />
            <Component {...pageProps} />
            <Toaster
              toastOptions={{
                className: css({
                  backgroundColor: "$mauve1",
                  color: "$mauve10",
                  fontSize: "$sm",
                  zIndex: 9999,
                  ".dark &": {
                    backgroundColor: "$mauve4",
                    color: "$mauve12",
                  },
                })(),
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </IdProvider>
    </>
  );
}
export default MyApp;
