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
  let asc: typeof import("assemblyscript/dist/asc") | undefined
  saveFile(false);
  if (!process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT) {
    throw Error("Missing env!");
  }
  // Bail out if we're already compiling
  if (state.compiling) {
    // if compiling is ongoing return
    return;
  }
  state.compiling = true;
  if (typeof window !== 'undefined') {
    // IF AssemblyScript
    if (state.files[activeId].language.toLowerCase() === 'ts' || state.files[activeId].language.toLowerCase() === 'typescript') {
      if (!asc) {
        asc = await import('assemblyscript/dist/asc')
      }
      const files: { [key: string]: string } = {

      };
      state.files.forEach(file => {
        files[file.name] = file.content;
      });
      const res = await asc.main([state.files[activeId].name, "--textFile", "-o", state.files[activeId].name, "--runtime", "minimal", "-O3"], {
        readFile: (name, baseDir) => {
          console.log('--> ', name)
          const currentFile = state.files.find(file => file.name === name);
          if (currentFile) {
            return currentFile.content;
          }
          return null
        },
        writeFile: (name, data, baseDir) => {
          console.log(name)
          const curr = state.files.find(file => file.name === name);
          if (curr) {
            curr.compiledContent = ref(data);
          }

        },
        listFiles: (dirname, baseDir) => {
          console.log("listFiles: " + dirname + ", baseDir=" + baseDir);
          return [];
        }
      });
      // In case you want to compile just single file
      // const res = await asc.compileString(state.files[activeId].content, {
      //   optimizeLevel: 3,
      //   runtime: 'stub',
      // })
      console.log(state.files)
      if (res.error?.message) {
        state.compiling = false;
        state.logs.push({
          type: 'error',
          message: res.error.message
        })
        state.logs.push({
          type: 'error',
          message: res.stderr.toString()
        })
        return
      }
      if (res.stdout) {
        const wat = res.stdout.toString()
        state.files[activeId].lastCompiled = new Date();
        state.files[activeId].compiledWatContent = wat;

        state.logs.push({
          type: "success",
          message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
          link: Router.asPath.replace("develop", "deploy"),
          linkText: "Go to deploy",
        });
      }
      state.compiling = false;
      return
    }
  }

  // Set loading state to true
  state.logs = []
  try {
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
            options: state.compileOptions.optimizationLevel || '-O0',
            name: state.files[activeId].name,
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
    // Decode base64 encoded wasm that is coming back from the endpoint
    const bufferData = await decodeBinary(json.output);
    state.files[state.active].compiledContent = ref(bufferData);
    state.files[state.active].lastCompiled = new Date();
    // Import wabt from and create human readable version of wasm file and
    // put it into state
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
