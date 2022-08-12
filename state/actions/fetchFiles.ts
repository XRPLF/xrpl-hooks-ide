import { Octokit } from "@octokit/core";
import state, { IFile } from '../index';
import { templateFileIds } from '../constants';
import { file } from 'jszip';

const octokit = new Octokit();

/** 
 * Fetches files from Github Gists based on gistId and stores them in global state
 */
export const fetchFiles = async (gistId: string) => {
  if (!gistId || state.files.length) return

  state.loading = true;
  state.logs.push({
    type: "log",
    message: `Fetching Gist with id: ${gistId}`,
  });
  try {
    const res = await octokit
      .request("GET /gists/{gist_id}", { gist_id: gistId })

    const isTemplate = (id: string) => Object.values(templateFileIds).map(v => v.id).includes(id)

    if (isTemplate(gistId)) {
      // fetch headers
      const headerRes = await fetch(`${process.env.NEXT_PUBLIC_COMPILE_API_BASE_URL}/api/header-files`);
      if (!headerRes.ok) throw Error("Failed to fetch headers");;

      const headerJson = await headerRes.json()
      const headerFiles: Record<string, { filename: string; content: string; language: string }> = {};
      Object.entries(headerJson).forEach(([key, value]) => {
        const fname = `${key}.h`;
        headerFiles[fname] = { filename: fname, content: value as string, language: 'C' }
      })
      const files = {
        ...res.data.files,
        ...headerFiles
      };
      res.data.files = files;
    }

    if (!res.data.files) throw Error("No files could be fetched from given gist id!")

    const files: IFile[] = Object.keys(res.data.files).map((filename) => ({
      name: res.data.files?.[filename]?.filename || "untitled.c",
      language: res.data.files?.[filename]?.language?.toLowerCase() || "",
      content: res.data.files?.[filename]?.content || "",
    }));

    // Sort files so that the source files are first
    // In case of other files leave the order as it its
    files.sort((a, b) => {
      const aBasename = a.name.split('.')?.[0];
      const aExt = a.name.split('.').pop() || '';
      const bBasename = b.name.split('.')?.[0];
      const bExt = b.name.split('.').pop() || '';

      // default priority is undefined == 0
      const extPriority: Record<string, number> = {
        c: 1,
        md: 2,
        h: -1
      }

      if (extPriority[aExt] || extPriority[bExt])
        return (extPriority[bExt] || 0) - (extPriority[aExt] || 0)
      // Otherwise fallback to alphabetical sorting
      return aBasename.localeCompare(bBasename)
    })

    state.logs.push({
      type: "success",
      message: "Fetched successfully ✅",
    });
    state.files = files;
    state.gistId = gistId;
    state.gistOwner = res.data.owner?.login;
    
    const gistName = files.find(file => file.language === 'c' || file.language === 'javascript')?.name || "untitled";
    state.gistName = gistName
  } catch (err) {
    let message: string
    if (err instanceof Error) message = err.message
    else message = `Something went wrong, try again later!`
    state.logs.push({
      type: "error",
      message: `Error: ${message}`,
    });
  }
  state.loading = false;
};
