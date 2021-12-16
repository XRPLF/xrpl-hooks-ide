import { Octokit } from "@octokit/core";
import Router from "next/router";
import state from '../index';

const octokit = new Octokit();

const HEADER_GIST_ID = '9b448e8a55fab11ef5d1274cb59f9cf3'

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
        // fetch header file(s) and append to res
        return octokit.request("GET /gists/{gist_id}", { gist_id: HEADER_GIST_ID }).then(({ data: { files: headerFiles } }) => {
          const files = { ...res.data.files, ...headerFiles }
          res.data.files = files
          return res
        })
      })
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