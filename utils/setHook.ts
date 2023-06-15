import { getTags } from './comment-parser'
import { tts, TTS } from './hookOnCalculator'

export const transactionOptions = Object.keys(tts).map(key => ({
  label: key,
  value: key as keyof TTS
}))

export type SetHookData = {
  Invoke: {
    value: keyof TTS
    label: string
  }[]
  Fee: string
  HookNamespace: string
  HookParameters: {
    HookParameter: {
      HookParameterName: string
      HookParameterValue: string
    }
    $metaData?: any
  }[]
  // HookGrants: {
  //   HookGrant: {
  //     Authorize: string;
  //     HookHash: string;
  //   };
  // }[];
}

export const getParameters = (content?: string) => {
  const fieldTags = ['field', 'param', 'arg', 'argument']
  const tags = getTags(content)
    .filter(tag => fieldTags.includes(tag.tag))
    .filter(tag => !!tag.name)

  const paramters: SetHookData['HookParameters'] = tags.map(tag => ({
    HookParameter: {
      HookParameterName: tag.name,
      HookParameterValue: tag.default || ''
    },
    $metaData: {
      description: tag.description,
      required: !tag.optional
    }
  }))

  return paramters
}

export const getInvokeOptions = (content?: string) => {
  const invokeTags = ['invoke', 'invoke-on']

  const options = getTags(content)
    .filter(tag => invokeTags.includes(tag.tag))
    .reduce((cumm, curr) => {
      const combined = curr.type || `${curr.name} ${curr.description}`
      const opts = combined.split(' ')

      return cumm.concat(opts as any)
    }, [] as (keyof TTS)[])
    .filter(opt => Object.keys(tts).includes(opt))

  const invokeOptions: SetHookData['Invoke'] = options.map(opt => ({
    label: opt,
    value: opt
  }))
  return invokeOptions
}
