import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';
import { Octokit } from '@octokit/core';

const octokit = new Octokit();

interface Files {
  name: string,
  language: string,
  content: string
}

interface IState {
  files: {
    name: string;
    language: string;
    content: string;
  }[] | [],
  active: number;
  loading: boolean;
  logs: string[];
}

const initFiles = [
  {
    name: 'hello.c',
    language: 'c',
    content: `
#include <stdio.h>
int main() {
// printf() displays the string inside quotation
printf("Hello, World!");
return 0;
}
    `,
  },
  {
    name: 'another.c',
    language: 'c',
    content: `
#include <stdio.h>
int main()
{
/* printf function displays the content that is
  * passed between the double quotes.
  */
printf("Hello World");
return 0;
}
    `,
  }
];

const state = proxy<IState>({
  files: [],
  active: 0,
  loading: false,
  logs: []
});

// state.files = initFiles;

// const initState = ({ gistId }: { gistId?: string }) => {
//   if (!gistId) {
//     return initialState;
//   }
// }

// const state = initialState;

export const fetchFiles = (gistId: string) => {
  if (gistId) {
    console.log('callling')
    octokit.request("GET /gists/{gist_id}", { gist_id: gistId }).then(res => {
      state.logs.push('Fetching files from Github Gists...');

      if (res.data.files && Object.keys(res.data.files).length > 0) {
        const files = Object.keys(res.data.files).map(filename => ({
          name: res.data.files?.[filename]?.filename || 'noname.c',
          language: res.data.files?.[filename]?.language?.toLowerCase() || '',
          content: res.data.files?.[filename]?.content || ''
        }))
        state.files = initFiles
        state.loading = false;
        if (files.length > 0) {
          state.logs.push('Fetched successfully ✅')
          state.files = files;
          return
        }
        return state.files = initFiles
      }

    }).catch(err => {
      state.loading = false;
      return state.files = initFiles
    })
    return
  }
  state.loading = false;
  return state.files = initFiles
}

const unsub = devtools(state, 'Files State')

export { state };