import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

import { darkTheme } from "../stitches.config";
import Navigation from "../components/Navigation";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
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
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}
export default MyApp;
