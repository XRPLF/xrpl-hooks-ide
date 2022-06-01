import toast from 'react-hot-toast';
import { derive, sign } from "xrpl-accountlib"
import state, { IAccount } from "../state"

const estimateFee = async (tx: Record<string, unknown>, account: IAccount, opts: { silent?: boolean } = {}): Promise<null | { base_fee: string, median_fee: string; minimum_fee: string; open_ledger_fee: string; }> => {
  try {
    const copyTx = JSON.parse(JSON.stringify(tx))
    delete copyTx['SigningPubKey']
    if (!copyTx.Fee) {
      copyTx.Fee = '1000'
    }
    
    const keypair = derive.familySeed(account.secret)
    const { signedTransaction } = sign(copyTx, keypair);

    const res = await state.client?.send({ command: 'fee', tx_blob: signedTransaction })
    if (res && res.drops) {
      return res.drops;
    }
    return null
  } catch (err) {
    if (!opts.silent) {
      console.error(err)
      toast.error("Cannot estimate fee.") // ? Some better msg
    }
    return null
  }
}

export default estimateFee