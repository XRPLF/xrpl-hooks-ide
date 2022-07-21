import toast from "react-hot-toast";
import Router from 'next/router';

import state from "../index";
import { saveFile } from "./saveFile";
import { decodeBinary } from "../../utils/decodeBinary";
import { ref } from "valtio";

/* compileCode sends the code of the active file to compile endpoint
 * If all goes well you will get base64 encoded wasm file back with
 * some extra logging information if we can provide it. This function 
 * also decodes the returned wasm and creates human readable WAT file
 * out of it and store both in global state.
 */
export const compileCode = async (activeId: number) => {
  // Save the file to global state
  saveFile(false, activeId);
  if (!process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT) {
    throw Error("Missing env!");
  }
  // Bail out if we're already compiling
  if (state.compiling) {
    // if compiling is ongoing return // TODO Inform user about it.
    return;
  }
  // Set loading state to true
  state.compiling = true;
  state.logs = []
  const file = state.files[activeId]
  try {
    file.containsErrors = false
    const res = await fetch(process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output: "wasm",
        compress: true,
        strip: state.compileOptions.strip,
        files: [
          {
            type: "c",
            options: state.compileOptions.optimizationLevel || '-O2',
            name: file.name,
            src: file.content,
          },
        ],
      }),
    });
    const json = await res.json();
    state.compiling = false;
    if (!json.success) {
      const errors = [json.message]
      if (json.tasks && json.tasks.length > 0) {
        json.tasks.forEach((task: any) => {
          if (!task.success) {
            errors.push(task?.console)
          }
        });
      }
      throw errors
    }
    // Decode base64 encoded wasm that is coming back from the endpoint
    const bufferData = await decodeBinary(json.output);

    // Import wabt from and create human readable version of wasm file and
    // put it into state
    const ww = (await import('wabt')).default()
    const myModule = ww.readWasm(new Uint8Array(bufferData), {
      readDebugNames: true,
    });
    myModule.applyNames();

    const wast = myModule.toText({ foldExprs: false, inlineExport: false });

    file.compiledContent = ref(bufferData);
    file.lastCompiled = new Date();
    file.compiledValueSnapshot = file.content
    file.compiledWatContent = wast;

    toast.success("Compiled successfully!", { position: "bottom-center" });
    state.logs.push({
      type: "success",
      message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
      link: Router.asPath.replace("develop", "deploy"),
      linkText: "Go to deploy",
    });
  } catch (err) {
    console.log(err);

    if (err instanceof Array && typeof err[0] === 'string') {
      err.forEach(message => {
        state.logs.push({
          type: "error",
          message,
        });
      })
    }
    else {
      state.logs.push({
        type: "error",
        message: "Something went wrong, check your connection try again later!",
      });
    }
    state.compiling = false;
    toast.error(`Error occurred while compiling!`, { position: "bottom-center" });
    file.containsErrors = true
  }
};
