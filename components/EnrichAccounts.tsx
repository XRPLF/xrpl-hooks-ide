import { FC, useState } from "react";
import regexifyString from "regexify-string";
import { useSnapshot } from "valtio";
import { Link } from ".";
import state from "../state";
import { AccountDialog } from "./Accounts";

interface EnrichAccountsProps {
  str?: string;
}

const EnrichAccounts: FC<EnrichAccountsProps> = ({ str }) => {
  const { accounts } = useSnapshot(state);
  const [dialogAccount, setDialogAccount] = useState<string | null>(null);
  if (!str || !accounts.length) return <>{str}</>;

  const pattern = `(${accounts.map(acc => acc.address).join("|")})`;
  const res = regexifyString({
    pattern: new RegExp(pattern, "gim"),
    decorator: (match, idx) => {
      const name = accounts.find(acc => acc.address === match)?.name;
      return (
        <Link
          key={match + idx}
          as="a"
          onClick={() => setDialogAccount(match)}
          title={match}
          highlighted
        >
          {name || match}
        </Link>
      );
    },
    input: str,
  });

  return (
    <>
      {res}
      <AccountDialog
        setActiveAccountAddress={setDialogAccount}
        activeAccountAddress={dialogAccount}
      />
    </>
  );
};

export default EnrichAccounts;
