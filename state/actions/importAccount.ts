import toast from "react-hot-toast";
import { derive } from "xrpl-accountlib";

import state from '../index';
import { names } from './addFaucetAccount';

// Adds test account to global state with secret key
export const importAccount = (secret: string) => {
  if (!secret) {
    return toast.error("You need to add secret!");
  }
  if (state.accounts.find((acc) => acc.secret === secret)) {
    return toast.error("Account already added!");
  }
  const account = derive.familySeed(secret);
  if (!account.secret.familySeed) {
    return toast.error(`Couldn't create account!`);
  }
  state.accounts.push({
    name: names[state.accounts.length],
    address: account.address || "",
    secret: account.secret.familySeed || "",
    xrp: "0",
    sequence: 1,
    hooks: [],
    isLoading: false,
  });
  return toast.success("Account imported successfully!");
};