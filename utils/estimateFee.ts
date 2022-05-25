import { derive, sign } from "xrpl-accountlib"
import state, { IAccount } from "../state"

const estimateFee = async (tx: Record<string, unknown>, account: IAccount): Promise<null | { base_fee: string, median_fee: string; minimum_fee: string; open_ledger_fee: string; }> => {
  const copyTx = JSON.parse(JSON.stringify(tx))
  console.log(tx)
  delete copyTx['SigningPubKey']
  if (!copyTx.Fee) {
    copyTx.Fee = '1000'
  }
  const keypair = derive.familySeed(account.secret)
  const { signedTransaction } = sign(copyTx, keypair);
  try {
    const res = await state.client?.send({ command: 'fee', tx_blob: signedTransaction })
    if (res && res.drops) {
      return res.drops;
    }
    return null
  } catch (err) {
    throw Error('Cannot estimate fee');
    return null
  }
}

export default estimateFee