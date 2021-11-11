import { Children } from "react";
import { Flex, Box, ThemeUIStyleObject, BoxProps } from "theme-ui";
import { useBreakpointIndex } from "@theme-ui/match-media";

const Stack: React.FC<
  BoxProps & {
    spacing?: (number | string | null)[] | string | number;
    direction?: ("column" | "row") | ("column" | "row" | null)[];
    sx?: ThemeUIStyleObject;
  }
> = ({ spacing = 3, direction = "row", sx, children, ...rest }) => {
  const breakpointIndex = useBreakpointIndex();
  const currentDirection = Array.isArray(direction)
    ? direction[breakpointIndex]
    : direction;
  const childrenLength = Array.isArray(children) ? children.length : null;
  return (
    <Box
      {...rest}
      sx={{
        display: "flex",
        flexDirection: direction,
        ...sx,
      }}
    >
      {Children.map(children, (child, index) => (
        <Box
          mt={currentDirection === "column" && index !== 0 ? spacing : 0}
          ml={currentDirection === "row" && index !== 0 ? spacing : 0}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
};

export default Stack;
