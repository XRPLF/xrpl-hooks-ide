import toast from 'react-hot-toast'
import Router from 'next/router'

import state from '../index'
import { saveFile } from './saveFile'
import { decodeBinary } from '../../utils/decodeBinary'
import { ref } from 'valtio'

import Cleaner from '../../utils/cleaner/cleaner'

/* compileCode sends the code of the active file to compile endpoint
 * If all goes well you will get base64 encoded wasm file back with
 * some extra logging information if we can provide it. This function
 * also decodes the returned wasm and creates human readable WAT file
 * out of it and store both in global state.
 */
export const compileCode = async (activeId: number) => {
  let asc: typeof import('assemblyscript/dist/asc') | undefined
  // Save the file to global state
  saveFile(false, activeId)
  if (!process.env.NEXT_PUBLIC_COMPILE_API_ENDPOINT) {
    throw Error('Missing env!')
  }
  // Bail out if we're   already compiling
  if (state.compiling) {
    // if compiling is ongoing return // TODO Inform user about it.
    return
  }
  // Set loading state to true
  state.compiling = true
  if (typeof window !== 'undefined') {
    // IF AssemblyScript
    if (
      state.files[activeId].language.toLowerCase() === 'ts' ||
      state.files[activeId].language.toLowerCase() === 'typescript'
    ) {
      if (!asc) {
        asc = await import('assemblyscript/dist/asc')
      }
      const files: { [key: string]: string } = {}
      state.files.forEach(file => {
        files[file.name] = file.content
      })
      const res = await asc.main(
        [
          state.files[activeId].name,
          '--textFile',
          '-o',
          `${state.files[activeId].name}.wasm`,
          '--runtime',
          'stub',
          '-O3',
          '--disable',
          'bulk-memory'
        ],
        {
          readFile: (name, baseDir) => {
            const currentFile = state.files.find(file => file.name === name)
            if (currentFile) {
              return currentFile.content
            }
            return null
          },
          writeFile: async (name, data, baseDir) => {
            const curr = state.files.find(file => file.name === name.replace('.wasm', ''))
            if (curr) {
              const cleaner = await Cleaner({
                locateFile: (file: string) => {
                  return `/${file}`
                }
              })

              cleaner.FS.mkdir('compiled')
              cleaner.FS.createDataFile('/compiled', `${curr?.name}.wasm`, data, true, true)
              await cleaner.callMain([`/compiled/${curr?.name}.wasm`])
              const newFileUArr = cleaner.FS.readFile(`/compiled/${curr?.name}.wasm`) as Uint8Array
              // lets remove the file from the file system
              cleaner.FS.unlink(`/compiled/${curr.name}.wasm`)
              // lets remove the directory
              cleaner.FS.rmdir('compiled')

              curr.compiledContent = ref(newFileUArr)
            }

            const ww = (await import('wabt')).default()
            if (curr?.compiledContent) {
              if (curr.compiledContent instanceof Uint8Array) {
                const myModule = ww.readWasm(curr.compiledContent, {
                  readDebugNames: true
                })
                myModule.applyNames()
                const compiledWat = myModule.toText({ foldExprs: false, inlineExport: false })
                curr.compiledWatContent = compiledWat
              }
            }
            toast.success('Compiled successfully!', { position: 'bottom-center' })
          },
          listFiles: (dirname, baseDir) => {
            console.log('listFiles: ' + dirname + ', baseDir=' + baseDir)
            return []
          }
        }
      )
      // In case you want to compile just single file
      // const res = await asc.compileString(state.files[activeId].content, {
      //   optimizeLevel: 3,
      //   runtime: 'stub',
      // })

      if (res.error?.message) {
        state.compiling = false
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
        state.files[activeId].lastCompiled = new Date()
        console.log(res.stdout.toString())
        state.files[activeId].compiledValueSnapshot = state.files[activeId].content
        state.logs.push({
          type: 'success',
          message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
          link: Router.asPath.replace('develop', 'deploy'),
          linkText: 'Go to deploy'
        })
      }
      // if (res.stdout) {
      //   const wat = res.stdout.toString()
      //   state.files[activeId].lastCompiled = new Date()
      //   state.files[activeId].compiledWatContent = wat
      //   state.files[activeId].compiledValueSnapshot = state.files[activeId].content
      //   state.logs.push({
      //     type: 'success',
      //     message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
      //     link: Router.asPath.replace('develop', 'deploy'),
      //     linkText: 'Go to deploy'
      //   })
      // }
      console.log('nääää')
      state.compiling = false
      return
    }
  }
  state.logs = []
  const file = state.files[activeId]
  try {
    file.containsErrors = false
    let res: Response
    try {
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
    } catch (error) {
      throw Error('Something went wrong, check your network connection and try again!')
    }
    const json = await res.json()
    state.compiling = false
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
      const ww = (await import('wabt')).default()
      const myModule = ww.readWasm(new Uint8Array(bufferData), {
        readDebugNames: true
      })
      myModule.applyNames()

      const wast = myModule.toText({ foldExprs: false, inlineExport: false })

      file.compiledContent = ref(bufferData)
      file.lastCompiled = new Date()
      file.compiledValueSnapshot = file.content
      file.compiledWatContent = wast
    } catch (error) {
      throw Error('Invalid compilation result produced, check your code for errors and try again!')
    }

    toast.success('Compiled successfully!', { position: 'bottom-center' })
    state.logs.push({
      type: 'success',
      message: `File ${state.files?.[activeId]?.name} compiled successfully. Ready to deploy.`,
      link: Router.asPath.replace('develop', 'deploy'),
      linkText: 'Go to deploy'
    })
  } catch (err) {
    console.log(err)

    if (err instanceof Array && typeof err[0] === 'string') {
      err.forEach(message => {
        state.logs.push({
          type: 'error',
          message
        })
      })
    } else if (err instanceof Error) {
      state.logs.push({
        type: 'error',
        message: err.message
      })
    } else {
      state.logs.push({
        type: 'error',
        message: 'Something went wrong, come back later!'
      })
    }

    state.compiling = false
    toast.error(`Error occurred while compiling!`, { position: 'bottom-center' })
    file.containsErrors = true
  }
}
