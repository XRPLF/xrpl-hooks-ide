import { styled } from "../stitches.config";

const Text = styled("span", {
  fontFamily: "$monospace",
  lineHeight: "$body",
  color: "$text",
  wordWrap: "break-word",
  variants: {
    variant: {
      log: {
        color: "$text",
      },
      warning: {
        color: "$amber11",
      },
      error: {
        color: "$crimson11",
      },
      success: {
        color: "$grass11",
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
