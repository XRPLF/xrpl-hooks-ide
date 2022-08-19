import { Spec, parse, Problem } from 'comment-parser'

export const getTags = (source?: string): Spec[] => {
  if (!source) return []
  const blocks = parse(source)
  const tags = blocks.reduce((acc, block) => acc.concat(block.tags), [] as Spec[])
  return tags
}

export const getErrors = (source?: string): Error | undefined => {
  if (!source) return undefined
  const blocks = parse(source)
  const probs = blocks.reduce((acc, block) => acc.concat(block.problems), [] as Problem[])
  if (!probs.length) return undefined
  const errors = probs.map(prob => `[${prob.code}] on line ${prob.line}: ${prob.message}`)
  const error = new Error(
    `The following error(s) occurred while parsing JSDOC: \n${errors.join('\n')}`
  )
  return error
}
