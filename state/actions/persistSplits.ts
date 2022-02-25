import { snapshot } from "valtio"
import state from ".."

export type SplitSize = number[]

export const saveSplit = (splitId: string, event: SplitSize) => {
  console.log(splitId, event)
  state.splits[splitId] = event
}

export const getSplit = (splitId: string): SplitSize | null => {
  const { splits } = snapshot(state)
  const split = splits[splitId]
  return split ? split : null
}

