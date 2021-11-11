import { Box } from "theme-ui";
import { useSnapshot } from "valtio";
import { state } from "../state";

const Footer = () => {
  const snap = useSnapshot(state);
  return (
    <Box as="footer" sx={{ display: "flex" }}>
      <Box
        as="pre"
        sx={{
          borderRadius: "6px",
          backgroundColor: "#242426",
          display: "flex",
          width: "100%",
          height: "160px",
          fontFamily: "monospace",
          fontSize: 0,
          overflowY: "scroll",
          py: 3,
          px: 3,
          m: 3,
        }}
      >
        {snap.logs.map((log, index) => index + 1 + ": " + log + "\n")}
      </Box>
    </Box>
  );
};

export default Footer;
