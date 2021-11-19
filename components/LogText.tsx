import { styled } from "../stitches.config";

const Text = styled("span", {
  fontFamily: "$monospace",
  lineHeight: "$body",
  color: "$text",
  variants: {
    variant: {
      log: {
        color: "$text",
      },
      warning: {
        color: "$yellow11",
      },
      error: {
        color: "$red11",
      },
    },
    capitalize: {
      true: {
        textTransform: "capitalize",
      },
    },
  },
});

export default Text;
