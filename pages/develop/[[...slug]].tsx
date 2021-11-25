import dynamic from "next/dynamic";

import type { NextPage } from "next";

const HooksEditor = dynamic(() => import("../../components/HooksEditor"), {
  ssr: false,
});

const Footer = dynamic(() => import("../../components/Footer"), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <>
      <main style={{ display: "flex", flex: 1 }}>
        <HooksEditor />
      </main>
      <Footer />
    </>
  );
};

export default Home;
