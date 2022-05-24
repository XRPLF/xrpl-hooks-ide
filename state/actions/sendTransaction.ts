import { derive, sign } from "xrpl-accountlib";

import state from '..'
import type { IAccount } from "..";

interface TransactionOptions {
    TransactionType: string,
    Account?: string,
    Fee?: string,
    Destination?: string
    [index: string]: any
}
interface OtherOptions {
    logPrefix?: string
}

export const sendTransaction = async (account: IAccount, txOptions: TransactionOptions, options?: OtherOptions) => {
    if (!state.client) throw Error('XRPL client not initalized')

    const { Fee = "1000", ...opts } = txOptions
    const tx: TransactionOptions = {
        Account: account.address,
        Sequence: account.sequence, // TODO auto-fillable
        Fee,  // TODO auto-fillable
        ...opts
    };

    const { logPrefix = '' } = options || {}
    try {
        const signedAccount = derive.familySeed(account.secret);
        const { signedTransaction } = sign(tx, signedAccount);
        const response = await state.client.send({
            command: "submit",
            tx_blob: signedTransaction,
        });
        if (response.engine_result === "tesSUCCESS") {
            state.transactionLogs.push({
                type: 'success',
                message: `${logPrefix}[${response.engine_result}] ${response.engine_result_message}`
            })
            const currAcc = state.accounts.find(acc => acc.address === account.address);
            if (currAcc && response.account_sequence_next) {
                currAcc.sequence = response.account_sequence_next;
            }
        } else {
            state.transactionLogs.push({
                type: "error",
                message: `${logPrefix}[${response.error || response.engine_result}] ${response.error_exception || response.engine_result_message}`,
            });
        }

    } catch (err) {
        console.error(err);
        state.transactionLogs.push({
            type: "error",
            message: err instanceof Error ? `${logPrefix}Error: ${err.message}` : `${logPrefix}Something went wrong, try again later`,
        });
    }
};