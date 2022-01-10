import { proxy, ref, subscribe } from "valtio";
import { devtools } from 'valtio/utils'
import type monaco from "monaco-editor";
import { XrplClient } from "xrpl-client";

export interface IFile {
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

export interface IState {
  files: IFile[];
  gistId?: string | null;
  gistOwner?: string | null;
  gistName?: string | null;
  active: number;
  activeWat: number;
  loading: boolean;
  gistLoading: boolean;
  zipLoading: boolean;
  compiling: boolean;
  logs: ILog[];
  deployLogs: ILog[];
  transactionLogs: ILog[];
  editorCtx?: typeof monaco.editor;
  editorSettings: {
    tabSize: number;
  };
  client: XrplClient | null;
  clientStatus: "offline" | "online";
  mainModalOpen: boolean;
  accounts: IAccount[];
}

// let localStorageState: null | string = null;
let initialState: IState = {
  files: [],
  // active file index on the Develop page editor
  active: 0,
  // Active file index on the Deploy page editor
  activeWat: 0,
  loading: false,
  compiling: false,
  logs: [],
  deployLogs: [],
  transactionLogs: [],
  editorCtx: undefined,
  gistId: undefined,
  gistOwner: undefined,
  gistName: undefined,
  gistLoading: false,
  zipLoading: false,
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
const state = proxy<IState>({
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
export default state