import React from "react";
import { styled } from "../stitches.config";
import Flex from "./Flex";
import Spinner from "./Spinner";

export const StyledButton = styled("button", {
  // Reset
  all: "unset",
  appereance: "none",
  fontFamily: "$body",
  alignItems: "center",
  boxSizing: "border-box",
  userSelect: "none",
  "&::before": {
    boxSizing: "border-box",
  },
  "&::after": {
    boxSizing: "border-box",
  },
  // Custom reset?
  display: "inline-flex",
  flexShrink: 0,
  justifyContent: "center",
  lineHeight: "1",
  gap: "5px",
  WebkitTapHighlightColor: "rgba(0,0,0,0)",
  // Custom
  height: "$6",
  px: "$2",
  fontSize: "$2",
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
  cursor: "pointer",
  width: "max-content",
  "&:disabled": {
    opacity: 0.6,
    pointerEvents: "none",
    cursor: "not-allowed",
  },
  variants: {
    size: {
      sm: {
        borderRadius: "$sm",
        height: "$7",
        px: "$3",
        fontSize: "$xs",
      },
      md: {
        borderRadius: "$sm",
        height: "$8",
        px: "$3",
        fontSize: "$xs",
      },
      lg: {
        borderRadius: "$sm",
        height: "$10",
        px: "$4",
        fontSize: "$xs",
      },
    },
    variant: {
      default: {
        backgroundColor: "$mauve12",
        boxShadow: "inset 0 0 0 1px $colors$mauve12",
        color: "$mauve1",
        "@hover": {
          "&:hover": {
            backgroundColor: "$mauve12",
            boxShadow: "inset 0 0 0 1px $colors$mauve12",
          },
        },
        "&:active": {
          backgroundColor: "$mauve10",
          boxShadow: "inset 0 0 0 1px $colors$mauve11",
        },
        "&:focus": {
          boxShadow:
            "inset 0 0 0 1px $colors$mauve12, inset 0 0 0 2px $colors$mauve12",
        },
        '&[data-radix-popover-trigger][data-state="open"], &[data-radix-dropdown-menu-trigger][data-state="open"]':
          {
            backgroundColor: "$mauve4",
            boxShadow: "inset 0 0 0 1px $colors$mauve8",
          },
      },
      primary: {
        backgroundColor: `$pink9`,
        boxShadow: "inset 0 0 0 1px $colors$pink9",
        color: "$white",
        "@hover": {
          "&:hover": {
            backgroundColor: "$pink10",
            boxShadow: "inset 0 0 0 1px $colors$pink11",
          },
        },
        "&:active": {
          backgroundColor: "$pink8",
          boxShadow: "inset 0 0 0 1px $colors$pink8",
        },
        "&:focus": {
          boxShadow: "inset 0 0 0 2px $colors$pink12",
        },
        '&[data-radix-popover-trigger][data-state="open"], &[data-radix-dropdown-menu-trigger][data-state="open"]':
          {
            backgroundColor: "$mauve4",
            boxShadow: "inset 0 0 0 1px $colors$pink8",
          },
      },
    },
    outline: {
      true: {
        backgroundColor: "transparent",
      },
    },
    uppercase: {
      true: {
        textTransform: "uppercase",
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
    ghost: {
      true: {
        boxShadow: "none",
        background: "transparent",
        color: "$mauve12",
        "@hover": {
          "&:hover": {
            backgroundColor: "$mauve6",
            boxShadow: "none",
          },
        },
        "&:active": {
          backgroundColor: "$mauve8",
          boxShadow: "none",
        },
        "&:focus": {
          boxShadow: "none",
        },
      },
    },
    isLoading: {
      true: {
        "& .button-content": {
          visibility: "hidden",
        },
        pointerEvents: "none",
      },
    },
  },
  compoundVariants: [
    {
      outline: true,
      variant: "default",
      css: {
        background: "transparent",
        color: "$mauve12",
        boxShadow: "inset 0 0 0 1px $colors$mauve10",
        "&:hover": {
          color: "$mauve12",
          background: "$mauve5",
        },
      },
    },
    {
      outline: true,
      variant: "primary",
      css: {
        background: "transparent",
        color: "$mauve12",
        "&:hover": {
          color: "$mauve12",
          background: "$mauve5",
        },
      },
    },
  ],
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

const CustomButton: React.FC<
  React.ComponentProps<typeof StyledButton> & { as?: string }
> = React.forwardRef(({ children, as = "button", ...rest }, ref) => (
  // @ts-expect-error
  <StyledButton {...rest} ref={ref} as={as}>
    <Flex
      as="span"
      css={{ gap: "$2", alignItems: "center" }}
      className="button-content"
    >
      {children}
    </Flex>
    {rest.isLoading && <Spinner css={{ position: "absolute" }} />}
  </StyledButton>
));

CustomButton.displayName = "CustomButton";

export default CustomButton;
