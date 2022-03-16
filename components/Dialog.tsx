import React from "react";
import * as Stiches from "@stitches/react";
import { keyframes } from "@stitches/react";
import { blackA } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { styled } from "../stitches.config";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});
const StyledOverlay = styled(DialogPrimitive.Overlay, {
  zIndex: 1000,
  backgroundColor: blackA.blackA9,
  position: "fixed",
  inset: 0,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  ".dark &": {
    backgroundColor: blackA.blackA11,
  },
});

const StyledContent = styled(DialogPrimitive.Content, {
  zIndex: 1000,
  backgroundColor: "$mauve2",
  color: "$mauve12",
  borderRadius: "$md",
  boxShadow:
    "0px 10px 38px -5px rgba(22, 23, 24, 0.25), 0px 10px 20px -5px rgba(22, 23, 24, 0.2)",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "450px",
  maxHeight: "85vh",
  padding: 25,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  "&:focus": { outline: "none" },
  ".dark &": {
    backgroundColor: "$mauve5",
    boxShadow:
      "0px 10px 38px 0px rgba(0, 0, 0, 0.85), 0px 10px 20px 0px rgba(0, 0, 0, 0.6)",
  },
});

const Content: React.FC<{ css?: Stiches.CSS }> = ({ css, children }) => {
  return (
    <div style={{ overflowY: "auto" }}>
      <StyledOverlay />
      <StyledContent css={css}>{children}</StyledContent>
    </div>
  );
};

const StyledTitle = styled(DialogPrimitive.Title, {
  margin: 0,
  fontWeight: 500,
  color: "$mauve12",
  fontSize: 17,
});

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: "10px 0 10px",
  color: "$mauve11",
  fontSize: 15,
  lineHeight: 1.5,
});

// Exports
export const Dialog = styled(DialogPrimitive.Root, { overflowY: "auto" });
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = Content;
export const DialogTitle = StyledTitle;
export const DialogDescription = StyledDescription;
export const DialogClose = DialogPrimitive.Close;
