import { styled } from "../stitches.config";

const Button = styled("button", {
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
  backgroundColor: "red",
  cursor: "pointer",
  "&:disabled": {
    opacity: 0.8,
    pointerEvents: "none",
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
        backgroundColor: "$slate12",
        boxShadow: "inset 0 0 0 1px $colors$slate12",
        color: "$slate1",
        "@hover": {
          "&:hover": {
            backgroundColor: "$slate12",
            boxShadow: "inset 0 0 0 1px $colors$slate12",
          },
        },
        "&:active": {
          backgroundColor: "$slate10",
          boxShadow: "inset 0 0 0 1px $colors$slate11",
        },
        "&:focus": {
          boxShadow:
            "inset 0 0 0 1px $colors$slate12, 0 0 0 1px $colors$slate12",
        },
        '&[data-radix-popover-trigger][data-state="open"], &[data-radix-dropdown-menu-trigger][data-state="open"]':
          {
            backgroundColor: "$slate4",
            boxShadow: "inset 0 0 0 1px $colors$slate8",
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
          boxShadow: "inset 0 0 0 1px $colors$pink8",
        },
        '&[data-radix-popover-trigger][data-state="open"], &[data-radix-dropdown-menu-trigger][data-state="open"]':
          {
            backgroundColor: "$slate4",
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
    ghost: {
      true: {
        boxShadow: "none",
        background: "transparent",
        color: "$slate12",
        "@hover": {
          "&:hover": {
            backgroundColor: "$slate6",
            boxShadow: "none",
          },
        },
        "&:active": {
          backgroundColor: "$slate8",
          boxShadow: "none",
        },
        "&:focus": {
          boxShadow: "none",
        },
      },
    },
  },

  compoundVariants: [
    {
      outline: true,
      variant: "default",
      css: {
        background: "transparent",
        color: "$slate12",
        boxShadow: "inset 0 0 0 1px $colors$slate10",
        "&:hover": {
          color: "$slate12",
          background: "$slate5",
        },
      },
    },
    {
      outline: true,
      variant: "primary",
      css: {
        background: "transparent",
        color: "$slate12",
        "&:hover": {
          color: "$slate12",
          background: "$slate5",
        },
      },
    },
  ],
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export default Button;
