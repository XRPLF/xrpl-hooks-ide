import { proxy, ref, subscribe } from "valtio";
import { devtools } from "valtio/utils";
import { Octokit } from "@octokit/core";
import type monaco from "monaco-editor";
import toast from "react-hot-toast";
import Router from "next/router";
import type { Session } from "next-auth";
import { decodeBinary } from "./utils/decodeBinary";

import { derive, sign } from "xrpl-accountlib";
import { XrplClient } from "xrpl-client";

const octokit = new Octokit();

interface File {
  name: string;
  language: string;
  content: string;
  compiledContent?: ArrayBuffer | null;
  compiledWatContent?: string | null;
}

export interface FaucetAccountRes {
  address: string;
  secret: string;
  xrp: number;
  hash: string;
  code: string;
}

export interface IAccount {
  name: string;
  address: string;
  secret: string;
  xrp: string;
  sequence: number;
  hooks: string[];
  isLoading: boolean;
}

export interface ILog {
  type: "error" | "warning" | "log" | "success";
  message: string;
  link?: string;
  linkText?: string;
}

interface IState {
  files: File[];
  gistId?: string | null;
  gistOwner?: string | null;
  gistName?: string | null;
  active: number;
  activeWat: number;
  loading: boolean;
  gistLoading: boolean;
  compiling: boolean;
  logs: ILog[];
  deployLogs: ILog[];
  editorCtx?: typeof monaco.editor;
  editorSettings: {
    tabSize: number;
  };
  client: XrplClient | null;
  clientStatus: "offline" | "online";
  mainModalOpen: boolean;
  accounts: IAccount[];
}

const names = [
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

// let localStorageState: null | string = null;
let initialState = {
  files: [],
  active: 0,
  activeWat: 0,
  loading: false,
  compiling: false,
  logs: [],
  deployLogs: [],
  editorCtx: undefined,
  gistId: undefined,
  gistOwner: undefined,
  gistName: undefined,
  gistLoading: false,
  editorSettings: {
    tabSize: 2,
  },
  client: null,
  clientStatus: "offline" as "offline",
  mainModalOpen: false,
  accounts: [],
};

let localStorageAccounts: string | null = null;
let initialAccounts: IAccount[] = [];
// Check if there's a persited accounts in localStorage
if (typeof window !== "undefined") {
  try {
    localStorageAccounts = localStorage.getItem("hooksIdeAccounts");
  } catch (err) {
    console.log(`localStorage state broken`);
    localStorage.removeItem("hooksIdeAccounts");
  }
  if (localStorageAccounts) {
    initialAccounts = JSON.parse(localStorageAccounts);
  }
}

// Initialize state
export const state = proxy<IState>({
  ...initialState,
  accounts: initialAccounts.length > 0 ? initialAccounts : [],
  logs: [],
});

// Initialize socket connection
const client = new XrplClient("wss://hooks-testnet.xrpl-labs.com");

client.on("online", () => {
  state.client = ref(client);
  state.clientStatus = "online";
});

client.on("offline", () => {
  state.clientStatus = "offline";
});

// Fetch content from Githug Gists
export const fetchFiles = (gistId: string) => {
  state.loading = true;
  if (gistId && !state.files.length) {
    state.logs.push({
      type: "log",
      message: `Fetching Gist with id: ${gistId}`,
    });

    octokit
      .request("GET /gists/{gist_id}", { gist_id: gistId })
      .then((res) => {
        if (res.data.files && Object.keys(res.data.files).length > 0) {
          const files = Object.keys(res.data.files).map((filename) => ({
            name: res.data.files?.[filename]?.filename || "noname.c",
            language: res.data.files?.[filename]?.language?.toLowerCase() || "",
            content: res.data.files?.[filename]?.content || "",
          }));
          state.loading = false;
          if (files.length > 0) {
            state.logs.push({
              type: "success",
              message: "Fetched successfully ✅",
            });
            state.files = files;
            state.gistId = gistId;
            state.gistName = Object.keys(res.data.files)?.[0] || "untitled";
            state.gistOwner = res.data.owner?.login;
            return;
          } else {
            // Open main modal if now files
            state.mainModalOpen = true;
          }
          return Router.push({ pathname: "/develop" });
        }
        state.loading = false;
      })
      .catch((err) => {
        state.loading = false;
        state.logs.push({
          type: "error",
          message: `Couldn't find Gist with id: ${gistId}`,
        });
        return;
      });
    return;
  }
  state.loading = false;
  // return state.files = initFiles
};

export const syncToGist = async (
  session?: Session | null,
  createNewGist?: boolean
) => {
  let files: Record<string, { filename: string; content: string }> = {};
  state.gistLoading = true;

  if (!session || !session.user) {
    state.gistLoading = false;
    return toast.error("You need to be logged in!");
  }
  const toastId = toast.loading("Pushing to Gist");
  if (!state.files || !state.files.length) {
    state.gistLoading = false;
    return toast.error(`You need to create some files we can push to gist`, {
      id: toastId,
    });
  }
  if (
    state.gistId &&
    session?.user.username === state.gistOwner &&
    !createNewGist
  ) {
    const currentFilesRes = await octokit.request("GET /gists/{gist_id}", {
      gist_id: state.gistId,
    });
    if (currentFilesRes.data.files) {
      Object.keys(currentFilesRes?.data?.files).forEach((filename) => {
        files[`${filename}`] = { filename, content: "" };
      });
    }
    state.files.forEach((file) => {
      files[`${file.name}`] = { filename: file.name, content: file.content };
    });
    // Update existing Gist
    octokit
      .request("PATCH /gists/{gist_id}", {
        gist_id: state.gistId,
        files,
        headers: {
          authorization: `token ${session?.accessToken || ""}`,
        },
      })
      .then((res) => {
        state.gistLoading = false;
        return toast.success("Updated to gist successfully!", { id: toastId });
      })
      .catch((err) => {
        console.log(err);
        state.gistLoading = false;
        return toast.error(`Could not update Gist, try again later!`, {
          id: toastId,
        });
      });
  } else {
    // Not Gist of the current user or it isn't Gist yet
    state.files.forEach((file) => {
      files[`${file.name}`] = { filename: file.name, content: file.content };
    });
    octokit
      .request("POST /gists", {
        files,
        public: true,
        headers: {
          authorization: `token ${session?.accessToken || ""}`,
        },
      })
      .then((res) => {
        state.gistLoading = false;
        state.gistOwner = res.data.owner?.login;
        state.gistId = res.data.id;
        state.gistName = Array.isArray(res.data.files)
          ? Object.keys(res.data?.files)?.[0]
          : "Untitled";
        Router.push({ pathname: `/develop/${res.data.id}` });
        return toast.success("Created new gist successfully!", { id: toastId });
      })
      .catch((err) => {
        console.log(err);
        state.gistLoading = false;
        return toast.error(`Could not create Gist, try again later!`, {
          id: toastId,
        });
      });
  }
};

export const updateEditorSettings = (
  editorSettings: IState["editorSettings"]
) => {
  state.editorCtx?.getModels().forEach((model) => {
    model.updateOptions({
      ...editorSettings,
    });
  });
  return (state.editorSettings = editorSettings);
};

export const saveFile = (showToast: boolean = true) => {
  const editorModels = state.editorCtx?.getModels();
  const currentModel = editorModels?.find((editorModel) => {
    return editorModel.uri.path === `/c/${state.files[state.active].name}`;
  });
  if (state.files.length > 0) {
    state.files[state.active].content = currentModel?.getValue() || "";
  }
  if (showToast) {
    toast.success("Saved successfully", { position: "bottom-center" });
  }
};

export const createNewFile = (name: string) => {
  const emptyFile: File = { name, language: "c", content: "" };
  state.files.push(emptyFile);
  state.active = state.files.length - 1;
};

export const compileCode = async (activeId: number) => {
  saveFile(false);
  if (!process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT) {
    throw Error("Missing env!");
  }
  if (state.compiling) {
    // if compiling is ongoing return
    return;
  }
  state.compiling = true;
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output: "wasm",
        compress: true,
        files: [
          {
            type: "c",
            name: state.files[activeId].name,
            options: "-O0",
            src: state.files[activeId].content,
          },
        ],
      }),
    });
    const json = await res.json();
    state.compiling = false;
    if (!json.success) {
      state.logs.push({ type: "error", message: json.message });
      if (json.tasks && json.tasks.length > 0) {
        json.tasks.forEach((task: any) => {
          if (!task.success) {
            state.logs.push({ type: "error", message: task?.console });
          }
        });
      }
      return toast.error(`Couldn't compile!`, { position: "bottom-center" });
    }
    state.logs.push({
      type: "success",
      message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
      link: Router.asPath.replace("develop", "deploy"),
      linkText: "Go to deploy",
    });
    const bufferData = await decodeBinary(json.output);
    state.files[state.active].compiledContent = ref(bufferData);

    import("wabt").then((wabt) => {
      const ww = wabt.default();
      const myModule = ww.readWasm(new Uint8Array(bufferData), {
        readDebugNames: true,
      });
      myModule.applyNames();

      const wast = myModule.toText({ foldExprs: false, inlineExport: false });
      state.files[state.active].compiledWatContent = wast;
      toast.success("Compiled successfully!", { position: "bottom-center" });
    });
  } catch (err) {
    console.log(err);
    state.logs.push({
      type: "error",
      message: "Error occured while compiling!",
    });
    state.compiling = false;
  }
};

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
export const deployHook = async (account: IAccount & { name?: string }) => {
  if (
    !state.files ||
    state.files.length === 0 ||
    !state.files?.[state.active]?.compiledContent
  ) {
    return;
  }

  if (!state.files?.[state.active]?.compiledContent) {
    return;
  }
  if (typeof window !== "undefined") {
    const tx = {
      Account: account.address,
      TransactionType: "SetHook",
      CreateCode: arrayBufferToHex(
        state.files?.[state.active]?.compiledContent
      ).toUpperCase(),
      HookOn: "0000000000000000",
      Sequence: account.sequence,
      Fee: "1000",
    };
    const keypair = derive.familySeed(account.secret);
    const { signedTransaction } = sign(tx, keypair);
    const currentAccount = state.accounts.find(
      (acc) => acc.address === account.address
    );
    if (currentAccount) {
      currentAccount.isLoading = true;
    }
    try {
      const submitRes = await client.send({
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
          message: `[${submitRes.engine_result}] ${submitRes.engine_result_message} Validated ledger index: ${submitRes.validated_ledger_index}`,
        });
      } else {
        state.deployLogs.push({
          type: "error",
          message: `[${submitRes.engine_result}] ${submitRes.engine_result_message}`,
        });
      }
    } catch (err) {
      console.log(err);
      state.deployLogs.push({
        type: "error",
        message: "Error occured while deploying",
      });
    }
    if (currentAccount) {
      currentAccount.isLoading = false;
    }
  }
};

export const sendXrp = async (account: IAccount & { name?: string }) => {
  const tx = {
    TransactionType: "Payment",
    Account: state.accounts[2].address,
    Fee: "1000",
    Destination: state.accounts[1].address,
    Amount: "133701337",
    Sequence: state.accounts[2].sequence,
  };
  const keypair = derive.familySeed(state.accounts[2].secret);
  const { signedTransaction } = sign(tx, keypair);
  await client.send({
    command: "submit",
    tx_blob: signedTransaction,
  });
};

//@ts-expect-errors
window.sendXrp = sendXrp;

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

// @ts-expect-error
window.importAccount = importAccount;

// fetch initial faucets
(async function fetchFaucets() {
  if (state.accounts.length < 2) {
    await addFaucetAccount();
    setTimeout(() => {
      addFaucetAccount();
    }, 10000);
  }
})();

if (process.env.NODE_ENV !== "production") {
  devtools(state, "Files State");
}

if (typeof window !== "undefined") {
  subscribe(state, () => {
    const { accounts, active } = state;
    const accountsNoLoading = accounts.map(acc => ({ ...acc, isLoading: false }))
    localStorage.setItem("hooksIdeAccounts", JSON.stringify(accountsNoLoading));
    if (!state.files[active]?.compiledWatContent) {
      state.activeWat = 0;
    } else {
      state.activeWat = active;
    }
  });
}
