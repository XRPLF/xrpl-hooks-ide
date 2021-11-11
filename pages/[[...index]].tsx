/** @jsxImportSource theme-ui */
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { Box } from "theme-ui";

import { useRouter } from "next/router";
import HooksEditor from "../components/HooksEditor";
import { useEffect } from "react";
import { fetchFiles } from "../state";
import Footer from "../components/Footer";

const Home: NextPage = () => {
  const router = useRouter();
  const index = router.query.index;
  const gistId = index && Array.isArray(index) ? index[0] : "";
  useEffect(() => {
    fetchFiles(gistId);
  }, [gistId]);
  return (
    <>
      <Head>
        <title>XRPL Hooks Playground</title>
      </Head>

      <main sx={{ display: "flex", flex: 1 }}>
        <HooksEditor />
      </main>

      <Footer />
    </>
  );
};

export default Home;

export const getStaticPaths: GetStaticPaths = async () => {
  // ...
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async (context) => {
  // ...
  return {
    props: {},
    revalidate: 60,
  };
};
