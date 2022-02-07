import { styled } from "../stitches.config";

const SVG = styled("svg", {
  "& #path": {
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
      viewBox="0 0 31 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        id="path"
        d="M27.3592 0H30.9723L31 0.0223244L23.1184 9.80415L30.7749 19.3066H27.116L20.6074 11.2287H12.9394L19.5082 19.3066H15.8361L9.75411 11.8274L3.67217 19.3066H0L7.91803 9.56953L0.136216 0H3.80838L9.75411 7.31164L15.6998 0H19.372L12.5578 8.37963H20.6074L27.3592 0Z"
      />
    </SVG>
  );
}

export default Logo;
