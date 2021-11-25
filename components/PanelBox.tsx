import { styled } from "../stitches.config";
import Heading from "./Heading";
import Text from "./Text";

const PanelBox = styled("div", {
  display: "flex",
  flexDirection: "column",
  border: "1px solid $colors$mauve5",
  backgroundColor: "$mauve1",
  padding: "$3",
  borderRadius: "$sm",
  fontWeight: "lighter",
  height: "auto",
  cursor: "pointer",
  flex: "1 1 0px",
  "&:hover": {
    border: "1px solid $colors$mauve9",
  },
  [`& ${Heading}`]: {
    fontWeight: "lighter",
    mb: "$2",
  },
  [`& ${Text}`]: {
    fontWeight: "lighter",
    color: "$mauve10",
    fontSize: "$sm",
  },
});

export default PanelBox;
