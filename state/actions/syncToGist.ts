import type { Session } from "next-auth";
import toast from "react-hot-toast";
import { Octokit } from "@octokit/core";
import Router from "next/router";

import state from '../index';
import { saveAllFiles } from "./saveFile";

const octokit = new Octokit();

// Syncs the current files from the state to GitHub Gists.
export const syncToGist = async (
  session?: Session | null,
  createNewGist?: boolean
) => {
  saveAllFiles();
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
    // You can only remove files from Gist by updating file with empty contents
    // So we need to fetch existing files and compare those to local state
    // and then send empty content if we don't have matching files anymore
    // on local state
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

export default syncToGist;