import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';
import { Octokit } from '@octokit/core';
import type monaco from 'monaco-editor';
import toast from 'react-hot-toast';
import Router from 'next/router';
import type { Session } from 'next-auth';
import { createZip } from './utils/zip';
import { guessZipFileName } from './utils/helpers';

const octokit = new Octokit();

interface File {
  name: string;
  language: string;
  content: string;
}

interface IState {
  files: File[],
  gistId?: string | null,
  gistOwner?: string | null,
  gistName?: string | null,
  active: number;
  loading: boolean;
  gistLoading: boolean;
  compiling: boolean;
  logs: {
    type: 'error' | 'warning' | 'log',
    message: string;
  }[];
  editorCtx?: typeof monaco.editor;
  editorSettings: {
    tabSize: number;
  },
  mainModalOpen: boolean;
}

// let localStorageState: null | string = null;
let initialState = {
  files: [],
  active: 0,
  loading: false,
  compiling: false,
  logs: [],
  editorCtx: undefined,
  gistId: undefined,
  gistOwner: undefined,
  gistName: undefined,
  gistLoading: false,
  editorSettings: {
    tabSize: 2
  },
  mainModalOpen: false
}

// Check if there's a persited state in localStorage
// if (typeof window !== 'undefined') {
//   try {
//     localStorageState = localStorage.getItem('hooksIdeState');
//   } catch (err) {
//     console.log(`localStorage state broken`);
//     localStorage.removeItem('hooksIdeState');
//   }
// }
// if (localStorageState) {
//   initialState = JSON.parse(localStorageState);
// }

// Initialize state
export const state = proxy<IState>({ ...initialState, logs: [] });

// Fetch content from Githug Gists
export const fetchFiles = (gistId: string) => {
  state.loading = true;
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
          state.gistId = gistId;
          state.gistName = Object.keys(res.data.files)?.[0] || 'untitled';
          state.gistOwner = res.data.owner?.login;
          return
        } else {
          // Open main modal if now files
          state.mainModalOpen = true;
        }
        return Router.push({ pathname: '/develop' })
      }
      state.loading = false;
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

export const syncToGist = async (session?: Session | null, createNewGist?: boolean) => {
  let files: Record<string, { filename: string, content: string }> = {};
  state.gistLoading = true;

  if (!session || !session.user) {
    state.gistLoading = false;
    return toast.error('You need to be logged in!')
  }
  const toastId = toast.loading('Pushing to Gist');
  if (!state.files || !state.files.length) {
    state.gistLoading = false;
    return toast.error(`You need to create some files we can push to gist`, { id: toastId })
  }
  if (state.gistId && session?.user.username === state.gistOwner && !createNewGist) {
    const currentFilesRes = await octokit.request("GET /gists/{gist_id}", { gist_id: state.gistId });
    if (currentFilesRes.data.files) {
      Object.keys(currentFilesRes?.data?.files).forEach(filename => {
        files[`${filename}`] = { filename, content: "" }
      })
    }
    state.files.forEach(file => {
      files[`${file.name}`] = { filename: file.name, content: file.content }
    })
    // Update existing Gist
    octokit.request("PATCH /gists/{gist_id}", {
      gist_id: state.gistId, files, headers: {
        authorization: `token ${session?.accessToken || ''}`
      }
    }).then(res => {
      state.gistLoading = false;
      return toast.success('Updated to gist successfully!', { id: toastId })
    }).catch(err => {
      console.log(err);
      state.gistLoading = false;
      return toast.error(`Could not update Gist, try again later!`, { id: toastId })
    })
  } else {
    // Not Gist of the current user or it isn't Gist yet
    state.files.forEach(file => {
      files[`${file.name}`] = { filename: file.name, content: file.content }
    })
    octokit.request("POST /gists", {
      files,
      public: true,
      headers: {
        authorization: `token ${session?.accessToken || ''}`
      }
    }).then(res => {
      state.gistLoading = false;
      state.gistOwner = res.data.owner?.login;
      state.gistId = res.data.id;
      state.gistName = Array.isArray(res.data.files) ? Object.keys(res.data?.files)?.[0] : 'Untitled';
      Router.push({ pathname: `/develop/${res.data.id}` })
      return toast.success('Created new gist successfully!', { id: toastId })
    }).catch(err => {
      console.log(err);
      state.gistLoading = false;
      return toast.error(`Could not create Gist, try again later!`, { id: toastId })
    })

  }

}

export const updateEditorSettings = (editorSettings: IState['editorSettings']) => {
  state.editorCtx?.getModels().forEach(model => {
    model.updateOptions({
      ...editorSettings
    })
  });
  return state.editorSettings = editorSettings;
}

export const saveFile = (value: string) => {
  const editorModels = state.editorCtx?.getModels();
  const currentModel = editorModels?.find(
    editorModel => editorModel.uri.path === `/${state.files[state.active].name}`
  );
  if (state.files.length > 0) {
    state.files[state.active].content = currentModel?.getValue() || '';
  }
  toast.success('Saved successfully', { position: 'bottom-center' })
}

export const createNewFile = (name: string) => {
  const emptyFile: File = { name, language: 'c', content: "" };
  state.files.push(emptyFile)
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
    if (!json.success) {
      state.logs.push({ type: 'error', message: json.message })
      if (json.tasks && json.tasks.length > 0) {
        json.tasks.forEach((task: any) => {
          if (!task.success) {
            state.logs.push({ type: 'error', message: task?.console })
          }
        })
      }
      return toast.error(`Couldn't compile!`, { position: 'bottom-center' });
    }
    state.logs.push({ type: 'log', message: 'Compiled successfully ✅' })
    toast.success('Compiled successfully!', { position: 'bottom-center' });
  } catch (err) {
    console.log(err)
    state.logs.push({ type: 'error', message: 'Error occured while compiling!' })
    state.compiling = false;
  }
}


export const downloadAsZip = async () => {
  // TODO do something about loading state
  const files = state.files.map(({ name, content }) => ({ name, content }));
  const zipped = await createZip(files);
  const zipFileName = guessZipFileName(files);
  zipped.saveFile(zipFileName);
};


if (process.env.NODE_ENV !== 'production') {
  devtools(state, 'Files State');
}

// subscribe(state, () => {
//   const { editorCtx, ...storedState } = state;
//   localStorage.setItem('hooksIdeState', JSON.stringify(storedState))
// });