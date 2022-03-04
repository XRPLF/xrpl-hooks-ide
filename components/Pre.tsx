import { styled } from "../stitches.config";

const Pre = styled("span", {
  m: 0,
  wordBreak: "break-all",
  fontFamily: '$monospace',
  whiteSpace: 'pre-wrap',
  variants: {
    fluid: {
      true: {
        width: "100%",
      },
    },
    line: {
      true: {
        whiteSpace: 'pre-line'
      }
    },
    block: {
      true: {
        display: 'block'
      }
    }
  },
});

export default Pre;
