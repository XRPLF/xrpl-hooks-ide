import toast from 'react-hot-toast'
import Router from 'next/router'

import state, { IFile } from '../index'
import { saveFile } from './saveFile'
import { decodeBinary } from '../../utils/decodeBinary'
import { ref } from 'valtio'
import asc from "@muzamilsofi/assemblyscript/dist/asc"
import { getFileExtention } from '../../utils/helpers'

type CompilationResult = Pick<IFile, "compiledContent" | "compiledWatContent">

export const compileCode = async (activeId: number) => {
  // Save the file to global state
  saveFile(false, activeId)
  const file = state.files[activeId]

  // Bail out if we're already compiling the file.
  if (!file || state.compiling.includes(activeId)) {
    return
  }

  try {
    state.compiling.push(activeId)
    state.logs = []
    file.containsErrors = false

    let result: CompilationResult;
    if (file.name.endsWith('.wat')) {
      result = await compileWat(file);
    }
    else if (file.language === "ts") {
      result = await compileTs(file);
    }
    else if (navigator?.onLine === false) {
      throw Error('You seem offline, check you internet connection and try again!')
    }
    else if (file.language === 'c') {
      result = await compileC(file)
    }
    else throw Error("Unknown file type.")

    file.lastCompiled = new Date();
    file.compiledValueSnapshot = file.content;
    file.compiledContent = result.compiledContent;
    file.compiledWatContent = result.compiledWatContent;
    toast.success('Compiled successfully!', { position: 'bottom-center' })
    state.logs.push({
      type: 'success',
      message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
      link: Router.asPath.replace('develop', 'deploy'),
      linkText: 'Go to deploy'
    })
  } catch (err) {
    console.error(err)
    let message: string;

    if (err instanceof Array && typeof err[0] === 'string') {
      err.forEach(message => {
        state.logs.push({
          type: 'error',
          message
        })
      })
      message = "Compilation errors occurred, see logs for more info."
    } else if (err instanceof Error) {
      message = err.message
    } else {
      message = 'Something went wrong, try again later!'
    }

    toast.error(message, { position: 'bottom-center' })
    file.containsErrors = true
  }
  state.compiling = state.compiling.filter(id => id !== activeId);
}

/* compileC sends the code of the active file to compile endpoint
 * If all goes well you will get base64 encoded wasm file back with
 * some extra logging information if we can provide it. This function
 * also decodes the returned wasm and creates human readable WAT file
 * out of it and store both in global state.
 */
export const compileC = async (file: IFile): Promise<CompilationResult> => {
  if (!process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT) {
    throw Error('Missing C compile endpoint!')
  }
  let res: Response
  res = await fetch(process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      output: 'wasm',
      compress: true,
      strip: state.compileOptions.strip,
      files: [
        {
          type: 'c',
          options: state.compileOptions.optimizationLevel || '-O2',
          name: file.name,
          src: file.content
        }
      ]
    })
  })
  const json = await res.json()

  if (!json.success) {
    const errors = [json.message]
    if (json.tasks && json.tasks.length > 0) {
      json.tasks.forEach((task: any) => {
        if (!task.success) {
          errors.push(task?.console)
        }
      })
    }
    throw errors
  }
  try {
    // Decode base64 encoded wasm that is coming back from the endpoint
    const bufferData = await decodeBinary(json.output)

    // Import wabt from and create human readable version of wasm file and
    // put it into state
    const ww = await (await import('wabt')).default()
    const myModule = ww.readWasm(new Uint8Array(bufferData), {
      readDebugNames: true
    })
    myModule.applyNames()

    const wast = myModule.toText({ foldExprs: false, inlineExport: false })

    return {
      compiledContent: ref(bufferData),
      compiledWatContent: wast
    }
  } catch (error) {
    throw Error('Invalid compilation result produced, check your code for errors and try again!')
  }

}

export const compileWat = async (file: IFile): Promise<CompilationResult> => {
  const wabt = await (await import('wabt')).default()
  const mod = wabt.parseWat(file.name, file.content);
  mod.resolveNames();
  mod.validate();
  const { buffer } = mod.toBinary({
    log: false,
    write_debug_names: true,
  });

  return {
    compiledContent: ref(buffer),
    compiledWatContent: file.content,
  }
}

export const compileTs = async (file: IFile): Promise<CompilationResult> => {
  return new Promise(async (resolve, reject) => {
    let result: Partial<CompilationResult> = {}
    const { error, stdout, stderr } = await asc.main([
      // Command line options
      file.name,
      "--outFile", `${file.name}.wasm`,
      "--textFile", `${file.name}.wat`,
      "--runtime", "stub",
      "--initialMemory", "1",
      "--maximumMemory", "1",
      "--noExportMemory",
      "--optimize",
      "--topLevelToHook"
    ], {
      readFile: (name, baseDir) => {
        const file = state.files.find(file => file.name === name)
        if (file) {
          return file.content
        }
        return null
      },
      writeFile: async (name, data: ArrayBuffer | string, baseDir) => {
        console.log("writeFile", { name, data, baseDir })
        const ext = getFileExtention(name);
        if (ext === 'wasm') {
          result.compiledContent = data as ArrayBuffer;
        }
        else if (ext === 'wat') {
          result.compiledWatContent = data as string;
        }
        if (result.compiledContent && result.compiledWatContent) {
          resolve({ ...result });
        }
      },
      listFiles: (dirname, baseDir) => {
        return state.files.map(file => file.name)
      },
      // reportDiagnostic?: ...,
    });

    let logMsg = stdout.toString()
    let errMsg = stderr.toString()
    if (logMsg) {
      state.logs.push({
        type: "log",
        message: logMsg
      })
    }
    if (errMsg) {
      state.logs.push({
        type: "error",
        message: errMsg
      })
    }

    if (error) return reject(error)
  })
}
