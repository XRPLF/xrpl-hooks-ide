import ReactMarkdown from 'react-markdown';
import { styled } from '../stitches.config';
 
const Markdown = styled(ReactMarkdown, {
  px: "$8",
  "@md": {
    px: "$20",
  },
  pb: "$5",
  height: "100%",
  overflowY: "auto"
});
 
export default Markdown;