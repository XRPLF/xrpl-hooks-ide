import { FC } from "react";
import { Link } from ".";

interface Props {
  result?: string;
}

const ResultLink: FC<Props> = ({ result }) => {
  if (!result) return null;
  return (
    <Link
      as="a"
      title={result}
      href={"https://xrpl.org/transaction-results.html"}
      target="_blank"
      rel="noopener noreferrer"
    >
      {result}
    </Link>
  );
};

export default ResultLink;
