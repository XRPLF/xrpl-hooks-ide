import { styled } from "../stitches.config";

const SVG = styled("svg", {
  "& #path": {
    fill: "$accent",
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
      width={width || "1.1em"}
      height={height || "1.1em"}
      viewBox="0 0 294 283"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        id="path"
        d="M265.827 235L172.416 141.589L265.005 49H226.822L147.732 128.089H53.5514L27.4824 155.089H147.732L227.643 235H265.827Z"
        fill="#9D2DFF"
      />
    </SVG>
  );
}

export default Logo;
