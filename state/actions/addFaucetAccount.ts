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

export const addFaucetAccount = async (showToast: boolean = false) => {
  if (state.accounts.length > 4) {
    return toast.error("You can only have maximum 5 accounts");
  }
  const toastId = showToast ? toast.loading("Creating account") : "";
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/faucet`, {
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
};