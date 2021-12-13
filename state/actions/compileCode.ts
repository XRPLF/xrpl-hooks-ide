import toast from "react-hot-toast";
import Router from 'next/router';

import state from "../index";
import { saveFile } from "./saveFile";
import { decodeBinary } from "../../utils/decodeBinary";
import { ref } from "valtio";

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