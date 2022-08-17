import state, { transactionsState } from '..'

export const deleteAccount = (addr?: string) => {
  if (!addr) return
  const index = state.accounts.findIndex(acc => acc.address === addr)
  if (index === -1) return
  state.accounts.splice(index, 1)

  // update selected accounts
  transactionsState.transactions
    .filter(t => t.state.selectedAccount?.value === addr)
    .forEach(t => {
      const acc = t.state.selectedAccount
      if (!acc) return
      acc.label = acc.value
    })
  transactionsState.transactions
    .filter(t => t.state.selectedDestAccount?.value === addr)
    .forEach(t => {
      const acc = t.state.selectedDestAccount
      if (!acc) return
      acc.label = acc.value
    })
}
