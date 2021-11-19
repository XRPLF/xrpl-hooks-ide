import { Spinner as SpinnerIcon } from "phosphor-react";
import { styled, keyframes } from "../stitches.config";

const rotate = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

const Spinner = styled(SpinnerIcon, {
  animation: `${rotate} 150ms cubic-bezier(0.16, 1, 0.3, 1) infinite`,
});

export default Spinner;
