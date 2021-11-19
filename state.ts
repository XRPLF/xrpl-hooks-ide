import { proxy, subscribe } from 'valtio';
import { devtools } from 'valtio/utils';
import { Octokit } from '@octokit/core';
import type monaco from 'monaco-editor';
import toast from 'react-hot-toast';

const octokit = new Octokit();

interface File {
  name: string,
  language: string,
  content: string
}

interface IState {
  files: File[],
  active: number;
  loading: boolean;
  compiling: boolean;
  logs: {
    type: 'error' | 'warning' | 'log',
    message: string;
  }[];
  editorCtx?: typeof monaco.editor;
  editorSettings: {
    tabSize: number;
  }
}

let localStorageState: null | string = null;
let initialState = {
  files: [],
  active: 0,
  loading: false,
  compiling: false,
  logs: [],
  editorCtx: undefined,
  editorSettings: {
    tabSize: 2
  }
}

// Check if there's a persited state in localStorage
if (typeof window !== 'undefined') {
  try {
    localStorageState = localStorage.getItem('hooksIdeState');
  } catch (err) {
    console.log(`localStorage state broken`);
    localStorage.removeItem('hooksIdeState');
  }
}
if (localStorageState) {
  initialState = JSON.parse(localStorageState);
}

// Initialize state
export const state = proxy<IState>(initialState);

// Fetch content from Githug Gists
export const fetchFiles = (gistId: string) => {
  if (gistId) {
    state.logs.push({ type: 'log', message: `Fetching Gist with id: ${gistId}` });
    octokit.request("GET /gists/{gist_id}", { gist_id: gistId }).then(res => {
      if (res.data.files && Object.keys(res.data.files).length > 0) {
        const files = Object.keys(res.data.files).map(filename => ({
          name: res.data.files?.[filename]?.filename || 'noname.c',
          language: res.data.files?.[filename]?.language?.toLowerCase() || '',
          content: res.data.files?.[filename]?.content || ''
        }))
        state.loading = false;
        if (files.length > 0) {
          state.logs.push({ type: 'log', message: 'Fetched successfully ✅' })
          state.files = files;
          return
        }
        return
      }

    }).catch(err => {
      state.loading = false;
      state.logs.push({ type: 'error', message: `Couldn't find Gist with id: ${gistId}` })
      return
    })
    return
  }
  state.loading = false;
  // return state.files = initFiles
}

export const updateEditorSettings = (editorSettings: IState['editorSettings']) => {
  state.editorCtx?.getModels().forEach(model => {
    console.log(model.uri)
    model.updateOptions({
      ...editorSettings
    })
  });
  return state.editorSettings = editorSettings;
}

export const saveFile = (value: string) => {
  toast.success('Saved successfully', { position: 'bottom-center' })
}

export const createNewFile = (name: string) => {
  state.files.push({ name, language: 'c', content: "" })
  state.active = state.files.length - 1;
}

export const compileCode = async (activeId: number) => {
  if (!process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT) {
    throw Error('Missing env!')
  };
  if (state.compiling) {
    return;
  }
  state.compiling = true;
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "output": "wasm",
        "compress": true,
        "files": [
          {
            "type": "c",
            "name": state.files[activeId].name,
            "options": "-g -O3",
            "src": state.files[activeId].content
          }
        ]
      })
    });
    const json = await res.json();
    state.compiling = false;
    toast.success('Compiled successfully!');
    console.log(json)
  } catch (err) {
    console.log(err)
    state.logs.push({ type: 'error', message: 'Error occured while compiling!' })
    state.compiling = false;
  }
}

const unsub = devtools(state, 'Files State');

subscribe(state, () => {
  const { editorCtx, ...storedState } = state;
  localStorage.setItem('hooksIdeState', JSON.stringify(storedState))
});