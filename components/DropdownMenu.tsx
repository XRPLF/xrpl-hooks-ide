/** @jsxImportSource theme-ui */
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { keyframes } from "@emotion/react";
import { ThemeUIStyleObject, jsx } from "theme-ui";
import { theme } from "../theme";

interface StyledProps {
  sx?: ThemeUIStyleObject;
}

const Root = DropdownMenu.Root;

const Trigger = DropdownMenu.Trigger;

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: translate3d(0,0,0);
  }

  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }

  70% {
    transform: translate3d(0, -15px, 0);
  }

  90% {
    transform: translate3d(0,-4px,0);
  }
`;

const animationTypeOne = keyframes({
  "0%": {
    opacity: 1,
  },
  "20%": {
    opacity: 0,
  },
  "100%": {
    opacity: 1,
  },
});

const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

const itemStyles: ThemeUIStyleObject = {
  all: "unset",
  fontSize: 1,
  lineHeight: 1,
  color: (theme) => theme.rawColors?.modes?.light?.text,
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  height: "auto",
  padding: "10px 5px",
  position: "relative",
  paddingLeft: 2,
  userSelect: "none",
  "&[data-disabled]": {
    color: (theme) => theme.rawColors?.modes?.light.muted,
    pointerEvents: "none",
  },
  "&:focus": {
    backgroundColor: (theme) => theme.rawColors?.modes?.light?.text,
    color: (theme) => theme.rawColors?.modes?.light?.background,
  },
};

const Content = (props: DropdownMenu.DropdownMenuContentProps) => (
  <DropdownMenu.Content
    {...props}
    sx={{
      minWidth: 220,
      backgroundColor: (theme) => theme.rawColors?.modes?.light?.background,
      borderRadius: 6,
      padding: 1,
      boxShadow:
        "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
      "@media (prefers-reduced-motion: no-preference)": {
        animationDuration: "400ms",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform, opacity",
        '&[data-state="open"]': {
          '&[data-side="top"]': {
            animationName: slideDownAndFade.toString(),
          },
          '&[data-side="right"]': {
            animationName: slideLeftAndFade.toString(),
          },
          '&[data-side="bottom"]': {
            animationName: slideUpAndFade.toString(),
          },
          '&[data-side="left"]': {
            animationName: slideRightAndFade.toString(),
          },
        },
      },
    }}
  />
);

const Item = (props: DropdownMenu.MenuItemProps) => (
  <DropdownMenu.Item {...props} sx={{ ...itemStyles }} />
);

const Label = (props: DropdownMenu.MenuLabelProps) => (
  <DropdownMenu.Label {...props} sx={{ ...itemStyles }} />
);

const Group = DropdownMenu.Group;
const Separator = DropdownMenu.Separator;

const Arrow = (props: DropdownMenu.MenuArrowProps) => (
  <DropdownMenu.Arrow
    {...props}
    sx={{
      fill: (theme) => theme.rawColors?.modes?.light.background,
    }}
  />
);

const Dropdown = {
  Root,
  Label,
  Trigger,
  Content,
  Item,
  Arrow,
  Group,
  Separator,
};

export default Dropdown;
