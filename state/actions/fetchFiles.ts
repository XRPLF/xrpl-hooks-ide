import { Octokit } from "@octokit/core";
import Router from "next/router";
import state from '../index';
import { templateFileIds } from '../constants';
import { hookapiH, hookmacroH, sfcodesH } from '../constants/headerTemplates';


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
      .then(res => {
        if (!Object.values(templateFileIds).includes(gistId)) {
          return res
        }
        // in case of templates, fetch header file(s) and append to res
        const files = {
          ...res.data.files,
          'hookapi.h': res.data.files?.['hookapi.h'] || { filename: 'hookapi.h', content: hookapiH, language: 'C' },
          'hookmacro.h': res.data.files?.['hookmacro.h'] || { filename: 'hookmacro.h', content: hookmacroH, language: 'C' },
          'sfcodes.h': res.data.files?.['sfcodes.h'] || { filename: 'sfcodes.h', content: sfcodesH, language: 'C' },
        };
        res.data.files = files;
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