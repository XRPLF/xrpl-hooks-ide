import { styled } from "../stitches.config";

const Code = styled("pre", {
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
  },
});

export default Code;
