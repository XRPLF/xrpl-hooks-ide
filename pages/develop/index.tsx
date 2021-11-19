import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

import Footer from "../../components/Footer";

const HooksEditor = dynamic(() => import("../../components/HooksEditor"), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>XRPL Hooks Playground</title>
      </Head>
      <main style={{ display: "flex", flex: 1 }}>
        <HooksEditor />
      </main>

      <Footer />
    </>
  );
};

export default Home;

// export const getStaticPaths: GetStaticPaths = async () => {
//   // ...
//   return { paths: [], fallback: "blocking" };
// };

// export const getStaticProps: GetStaticProps = async (context) => {
//   // ...
//   return {
//     props: {},
//     revalidate: 60,
//   };
// };
