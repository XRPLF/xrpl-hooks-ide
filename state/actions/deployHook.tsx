import { derive, sign } from "xrpl-accountlib";
import toast from "react-hot-toast";

import state, { IAccount } from "../index";
import calculateHookOn, { TTS } from "../../utils/hookOnCalculator";
import { SetHookData } from "../../components/SetHookDialog";
import { Link } from "../../components";
import { ref } from "valtio";
import estimateFee from "../../utils/estimateFee";

export const sha256 = async (string: string) => {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

function toHex(str: string) {
  var result = "";
  for (var i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result.toUpperCase();
}

function arrayBufferToHex(arrayBuffer?: ArrayBuffer | null) {
  if (!arrayBuffer) {
    return "";
  }
  if (
    typeof arrayBuffer !== "object" ||
    arrayBuffer === null ||
    typeof arrayBuffer.byteLength !== "number"
  ) {
    throw new TypeError("Expected input to be an ArrayBuffer");
  }

  var view = new Uint8Array(arrayBuffer);
  var result = "";
  var value;

  for (var i = 0; i < view.length; i++) {
    value = view[i].toString(16);
    result += value.length === 1 ? "0" + value : value;
  }

  return result;
}

export const prepareDeployHookTx = async (
  account: IAccount & { name?: string },
  data: SetHookData
) => {
  const activeFile = state.files[state.active]?.compiledContent
    ? state.files[state.active]
    : state.files.filter((file) => file.compiledContent)[0];

  if (!state.files || state.files.length === 0) {
    return;
  }

  if (!activeFile?.compiledContent) {
    return;
  }
  if (!state.client) {
    return;
  }
  const HookNamespace = (await sha256(data.HookNamespace)).toUpperCase();
  const hookOnValues: (keyof TTS)[] = data.Invoke.map((tt) => tt.value);
  const { HookParameters } = data;
  const filteredHookParameters = HookParameters.filter(
    (hp) =>
      hp.HookParameter.HookParameterName && hp.HookParameter.HookParameterValue
  )?.map((aa) => ({
    HookParameter: {
      HookParameterName: toHex(aa.HookParameter.HookParameterName || ""),
      HookParameterValue: aa.HookParameter.HookParameterValue || "",
    },
  }));
  // const filteredHookGrants = HookGrants.filter(hg => hg.HookGrant.Authorize || hg.HookGrant.HookHash).map(hg => {
  //   return {
  //     HookGrant: {
  //       ...(hg.HookGrant.Authorize && { Authorize: hg.HookGrant.Authorize }),
  //       // HookHash: hg.HookGrant.HookHash || undefined
  //       ...(hg.HookGrant.HookHash && { HookHash: hg.HookGrant.HookHash })
  //     }
  //   }
  // });
  if (typeof window !== "undefined") {
    const tx = {
      Account: account.address,
      TransactionType: "SetHook",
      Sequence: account.sequence,
      Fee: data.Fee,
      Hooks: [
        {
          Hook: {
            CreateCode: arrayBufferToHex(
              activeFile?.compiledContent
            ).toUpperCase(),
            HookOn: calculateHookOn(hookOnValues),
            HookNamespace,
            HookApiVersion: 0,
            Flags: 1,
            // ...(filteredHookGrants.length > 0 && { HookGrants: filteredHookGrants }),
            ...(filteredHookParameters.length > 0 && {
              HookParameters: filteredHookParameters,
            }),
          },
        },
      ],
    };
    return tx;
  }
};

/* deployHook function turns the wasm binary into
 * hex string, signs the transaction and deploys it to
 * Hooks testnet.
 */
export const deployHook = async (
  account: IAccount & { name?: string },
  data: SetHookData
) => {
  if (typeof window !== "undefined") {
    const activeFile = state.files[state.active]?.compiledContent
      ? state.files[state.active]
      : state.files.filter((file) => file.compiledContent)[0];
    state.deployValues[activeFile.name] = data;
    const tx = await prepareDeployHookTx(account, data);
    if (!tx) {
      return;
    }
    if (!state.client) {
      return;
    }
    const keypair = derive.familySeed(account.secret);

    const { signedTransaction } = sign(tx, keypair);
    const currentAccount = state.accounts.find(
      (acc) => acc.address === account.address
    );
    if (currentAccount) {
      currentAccount.isLoading = true;
    }
    let submitRes;

    try {
      submitRes = await state.client?.send({
        command: "submit",
        tx_blob: signedTransaction,
      });

      if (submitRes.engine_result === "tesSUCCESS") {
        state.deployLogs.push({
          type: "success",
          message: "Hook deployed successfully ✅",
        });
        state.deployLogs.push({
          type: "success",
          message: ref(
            <>
              [{submitRes.engine_result}] {submitRes.engine_result_message}{" "}
              Transaction hash:{" "}
              <Link
                as="a"
                href={`https://${process.env.NEXT_PUBLIC_EXPLORER_URL}/${submitRes.tx_json?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {submitRes.tx_json?.hash}
              </Link>
            </>
          ),
          // message: `[${submitRes.engine_result}] ${submitRes.engine_result_message} Validated ledger index: ${submitRes.validated_ledger_index}`,
        });
      } else {
        state.deployLogs.push({
          type: "error",
          message: `[${submitRes.engine_result || submitRes.error}] ${
            submitRes.engine_result_message || submitRes.error_exception
          }`,
        });
      }
    } catch (err) {
      console.log(err);
      state.deployLogs.push({
        type: "error",
        message: "Error occurred while deploying",
      });
    }
    if (currentAccount) {
      currentAccount.isLoading = false;
    }
    return submitRes;
  }
};

export const deleteHook = async (account: IAccount & { name?: string }) => {
  if (!state.client) {
    return;
  }
  const currentAccount = state.accounts.find(
    (acc) => acc.address === account.address
  );
  if (currentAccount?.isLoading || !currentAccount?.hooks.length) {
    return;
  }
  if (typeof window !== "undefined") {
    const tx = {
      Account: account.address,
      TransactionType: "SetHook",
      Sequence: account.sequence,
      Fee: "100000",
      Hooks: [
        {
          Hook: {
            CreateCode: "",
            Flags: 1,
          },
        },
      ],
    };

    const keypair = derive.familySeed(account.secret);
    try {
      // Update tx Fee value with network estimation
      const res = await estimateFee(tx, account);
      tx["Fee"] = res?.base_fee ? res?.base_fee : "1000";
    } catch (err) {
      // use default value what you defined earlier
      console.log(err);
    }
    const { signedTransaction } = sign(tx, keypair);

    if (currentAccount) {
      currentAccount.isLoading = true;
    }
    let submitRes;
    const toastId = toast.loading("Deleting hook...");
    try {
      submitRes = await state.client.send({
        command: "submit",
        tx_blob: signedTransaction,
      });

      if (submitRes.engine_result === "tesSUCCESS") {
        toast.success("Hook deleted successfully ✅", { id: toastId });
        state.deployLogs.push({
          type: "success",
          message: "Hook deleted successfully ✅",
        });
        state.deployLogs.push({
          type: "success",
          message: `[${submitRes.engine_result}] ${submitRes.engine_result_message} Validated ledger index: ${submitRes.validated_ledger_index}`,
        });
        currentAccount.hooks = [];
      } else {
        toast.error(
          `${submitRes.engine_result_message || submitRes.error_exception}`,
          { id: toastId }
        );
        state.deployLogs.push({
          type: "error",
          message: `[${submitRes.engine_result || submitRes.error}] ${
            submitRes.engine_result_message || submitRes.error_exception
          }`,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Error occurred while deleting hook", { id: toastId });
      state.deployLogs.push({
        type: "error",
        message: "Error occurred while deleting hook",
      });
    }
    if (currentAccount) {
      currentAccount.isLoading = false;
    }
    return submitRes;
  }
};
