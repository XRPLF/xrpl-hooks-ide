import { styled } from "../stitches.config";

const Text = styled("span", {
  fontFamily: "$monospace",
  lineHeight: "$body",
  color: "$text",
  wordWrap: "break-word",
  whiteSpace: 'pre-wrap',
  variants: {
    variant: {
      log: {
        color: "$text",
      },
      warning: {
        color: "$warning",
      },
      error: {
        color: "$error",
      },
      success: {
        color: "$success",
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
