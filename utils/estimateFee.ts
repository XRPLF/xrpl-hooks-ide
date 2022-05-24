import { sign, XRPL_Account } from "xrpl-accountlib"
import state from "../state"

// Mutate tx object with network estimated fee value
const estimateFee = async (tx: Record<string, unknown>, keypair: XRPL_Account): Promise<null | { base_fee: string, median_fee: string; minimum_fee: string; open_ledger_fee: string; }> => {
  const copyTx = JSON.parse(JSON.stringify(tx))
  delete copyTx['SigningPubKey']
  const { signedTransaction } = sign(copyTx, keypair);
  try {
    const res = await state.client?.send({ command: 'fee', tx_blob: signedTransaction })
    if (res && res.drops) {
      return tx['Fee'] = res.drops.base_fee;
    }
    return null
  } catch (err) {
    throw Error('Cannot estimate fee')
  }
}

export default estimateFee