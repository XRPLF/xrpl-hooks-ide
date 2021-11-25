import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

import Box from "../components/Box";
import Spinner from "../components/Spinner";

const SignInPage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "loading" && !session)
      void signIn("github", { redirect: false });
    if (status !== "loading" && session) window.close();
  }, [session, status]);

  return (
    <Box
      css={{
        display: "flex",
        backgroundColor: "$mauve1",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        gap: "$2",
      }}
    >
      Logging in <Spinner />
    </Box>
  );
};

export default SignInPage;
