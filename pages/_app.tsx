/** @jsxImportSource theme-ui */
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "theme-ui";
import { SessionProvider } from "next-auth/react";

import { theme } from "../theme";
import Navigation from "../components/Navigation";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <Navigation />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
export default MyApp;
