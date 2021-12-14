import Router from "next/router";
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
  if (state.accounts.length > 4) {
    return toast.error("You can only have maximum 5 accounts");
  }
  if (typeof window !== 'undefined') {


    const toastId = showToast ? toast.loading("Creating account") : "";
    console.log(Router)
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
      state.accounts.push({
        name: names[state.accounts.length],
        xrp: (json.xrp || 0 * 1000000).toString(),
        address: json.address,
        secret: json.secret,
        sequence: 1,
        hooks: [],
        isLoading: false,
      });
    }
  }
};

// fetch initial faucets
(async function fetchFaucets() {
  if (typeof window !== 'undefined') {
    if (state.accounts.length < 2) {
      await addFaucetAccount();
      setTimeout(() => {
        addFaucetAccount();
      }, 10000);
    }
  }
})();