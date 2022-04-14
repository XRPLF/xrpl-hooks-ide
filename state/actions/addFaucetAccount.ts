
import toast from "react-hot-toast";
import state, { FaucetAccountRes } from '../index';

export const names = [
  "Alice",
  "Bob",
  "Carol",
  "Carlos",
  "Charlie",
  "Dan",
  "Dave",
  "David",
  "Faythe",
  "Frank",
  "Grace",
  "Heidi",
  "Judy",
  "Olive",
  "Peggy",
  "Walter",
];

/* This function adds faucet account to application global state.
 * It calls the /api/faucet endpoint which in send a HTTP POST to
 * https://hooks-testnet.xrpl-labs.com/newcreds and it returns
 * new account with 10 000 XRP. Hooks Testnet /newcreds endpoint
 * is protected with CORS so that's why we did our own endpoint
 */
export const addFaucetAccount = async (showToast: boolean = false) => {
  // Lets limit the number of faucet accounts to 5 for now
  if (state.accounts.length > 5) {
    return toast.error("You can only have maximum 6 accounts");
  }
  if (typeof window !== 'undefined') {
    const toastId = showToast ? toast.loading("Creating account") : "";
    const res = await fetch(`${window.location.origin}/api/faucet`, {
      method: "POST",
    });
    const json: FaucetAccountRes | { error: string } = await res.json();
    if ("error" in json) {
      if (showToast) {
        return toast.error(json.error, { id: toastId });
      } else {
        return;
      }
    } else {
      if (showToast) {
        toast.success("New account created", { id: toastId });
      }
      const currNames = state.accounts.map(acc => acc.name);
      state.accounts.push({
        name: names.filter(name => !currNames.includes(name))[0],
        xrp: (json.xrp || 0 * 1000000).toString(),
        address: json.address,
        secret: json.secret,
        sequence: 1,
        hooks: [],
        isLoading: false,
        version: '2'
      });
    }
  }
};

// fetch initial faucets
(async function fetchFaucets() {
  if (typeof window !== 'undefined') {
    if (state.accounts.length === 0) {
      await addFaucetAccount();
      // setTimeout(() => {
      //   addFaucetAccount();
      // }, 10000);
    }
  }
})();

export const addFunds = async (address: string) => {
  const toastId = toast.loading("Requesting funds");
  const res = await fetch(`${window.location.origin}/api/faucet?account=${address}`, {
    method: "POST",
  });
  const json: FaucetAccountRes | { error: string } = await res.json();
  if ("error" in json) {
    return toast.error(json.error, { id: toastId });
  } else {
    toast.success(`Funds added (${json.xrp} XRP)`, { id: toastId });
    const currAccount = state.accounts.find(acc => acc.address === address);
    if (currAccount) {
      currAccount.xrp = (Number(currAccount.xrp) + (json.xrp * 1000000)).toString();
    }
  }
}
