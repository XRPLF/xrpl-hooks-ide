import { Octokit } from "@octokit/core";
import Router from "next/router";
import state from '../index';
import { templateFileIds } from '../constants';

const octokit = new Octokit();

/* Fetches Gist files from Githug Gists based on
 * gistId and stores the content in global state
 */
export const fetchFiles = (gistId: string) => {
  state.loading = true;
  if (gistId && !state.files.length) {
    state.logs.push({
      type: "log",
      message: `Fetching Gist with id: ${gistId}`,
    });

    octokit
      .request("GET /gists/{gist_id}", { gist_id: gistId })
      .then(async res => {
        if (!Object.values(templateFileIds).includes(gistId)) {
          return res
        }
        // in case of templates, fetch header file(s) and append to res
        try {
          const resHeader = await fetch(`${process.env.NEXT_PUBLIC_COMPILE_API_BASE_URL}/api/header-files`);
          if (resHeader.ok) {
            const resHeaderJson = await resHeader.json()
            const headerFiles: Record<string, { filename: string; content: string; language: string }> = {};
            Object.entries(resHeaderJson).forEach(([key, value]) => {
              const fname = `${key}.h`;
              headerFiles[fname] = { filename: fname, content: value as string, language: 'C' }
            })
            const files = {
              ...res.data.files,
              ...headerFiles
            };
            res.data.files = files;
          }
        } catch (err) {
          console.log(err)
        }



        return res;
        // If you want to load templates from GIST instad, uncomment the code below and comment the code above.
        // return octokit.request("GET /gists/{gist_id}", { gist_id: templateFileIds.headers }).then(({ data: { files: headerFiles } }) => {
        //   const files = { ...res.data.files, ...headerFiles }
        //   console.log(headerFiles)
        //   res.data.files = files
        //   return res
        // })
      })
      .then((res) => {
        if (res.data.files && Object.keys(res.data.files).length > 0) {
          const files = Object.keys(res.data.files).map((filename) => ({
            name: res.data.files?.[filename]?.filename || "untitled.c",
            language: res.data.files?.[filename]?.language?.toLowerCase() || "",
            content: res.data.files?.[filename]?.content || "",
          }));
          // Sort files so that the source files are first
          // In case of other files leave the order as it its
          files.sort((a, b) => {
            const aBasename = a.name.split('.')?.[0];
            const aCext = a.name?.toLowerCase().endsWith('.c');
            const bBasename = b.name.split('.')?.[0];
            const bCext = b.name?.toLowerCase().endsWith('.c');
            // If a has c extension and b doesn't move a up
            if (aCext && !bCext) {
              return -1;
            }
            if (!aCext && bCext) {
              return 1
            }
            // Otherwise fallback to default sorting based on basename
            if (aBasename > bBasename) {
              return 1;
            }
            if (bBasename > aBasename) {
              return -1;
            }
            return 0;
          })
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
        // console.error(err)
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
};
