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

export const sendTransaction = async (account: IAccount, txOptions: TransactionOptions) => {
    if (!state.client) throw Error('XRPL client not initalized')

    const { Fee = "1000", ...opts } = txOptions
    const tx: TransactionOptions = {
        Account: account.address,
        Sequence: account.sequence, // auto-fillable
        Fee,  // auto-fillable
        ...opts
    };
    const signedAccount = derive.familySeed(account.secret);
    const { signedTransaction } = sign(tx, signedAccount);
    try {
        const response = await state.client.send({
            command: "submit",
            tx_blob: signedTransaction,
        });
        console.log(response)
        if (response.engine_result === "tesSUCCESS") {
            state.transactionLogs.push({
                type: 'success',
                message: `Transaction success [${response.engine_result}]: ${response.engine_result_message}`
            })
        } else {
            state.transactionLogs.push({
                type: "error",
                message: `[${response.error || response.engine_result}] ${response.error_exception || response.engine_result_message}`,
            });
        }
    } catch (err) {
        console.log(err);
        state.transactionLogs.push({
            type: "error",
            message: "Something went wrong!",
        });
    }
};