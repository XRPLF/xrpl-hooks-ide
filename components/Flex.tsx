import { styled } from "../stitches.config";
import Box from "./Box";

const Flex = styled(Box, {
  display: "flex",
  variants: {
    row: {
      true: {
        flexDirection: "row",
      },
    },
    column: {
      true: {
        flexDirection: "column",
      },
    },
    fluid: {
      true: {
        width: '100%'
      }
    }
  },
});

export default Flex;
