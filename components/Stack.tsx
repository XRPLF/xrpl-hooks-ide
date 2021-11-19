import { Children } from "react";

import Box from "./Box";
import { styled } from "../stitches.config";
import type * as Stitches from "@stitches/react";

const StackComponent = styled(Box, {
  display: "flex",
  flexWrap: "wrap",
  flexDirection: "row",
  gap: "$4",
});

export default StackComponent;
