import { useTheme } from "next-themes";

import { styled } from "../stitches.config";

const SVG = styled("svg", {
  "& #path-one, & #path-two": {
    fill: "$text",
  },
});
function Logo({
  width,
  height,
}: {
  width?: string | number;
  height?: string | number;
}) {
  return (
    <SVG
      width={width || "1em"}
      height={height || "1em"}
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="path-one"
        d="M19.603 3.87h2.3l-4.786 4.747a4.466 4.466 0 01-6.276 0L6.054 3.871h2.3l3.636 3.605a2.828 2.828 0 003.975 0l3.638-3.605zM8.325 17.069h-2.3l4.816-4.776a4.466 4.466 0 016.276 0l4.816 4.776h-2.3l-3.665-3.635a2.828 2.828 0 00-3.975 0l-3.668 3.635z"
      />
      <path
        id="path-two"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.556 9.769h4.751v1.555H1.556v10.072H0V0h1.556v9.769zM26.444 9.769h-4.751v1.555h4.751v10.072H28V0h-1.556v9.769z"
      />
    </SVG>
  );
}

export default Logo;
