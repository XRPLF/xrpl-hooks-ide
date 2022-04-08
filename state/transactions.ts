import { proxy } from 'valtio';
import { TransactionState } from '../components/Transaction';
import { deepEqual } from '../utils/object';

export const defaultTransaction: TransactionState = {
    selectedTransaction: null,
    selectedAccount: null,
    selectedDestAccount: null,
    txIsLoading: false,
    txIsDisabled: false,
    txFields: {},
};

export const transactionsState = proxy({
    transactions: [
        {
            header: "test1.json",
            state: defaultTransaction,
        },
    ],
});

/**
 * Simple transaction state changer
 * @param header Unique key and tab name for the transaction tab
 * @param partialTx partial transaction state, `{}` resets the state and `undefined` deletes the transaction
 */
export const modifyTransaction = (
    header: string,
    partialTx?: Partial<TransactionState>
) => {
    const tx = transactionsState.transactions.find(tx => tx.header === header);

    if (partialTx === undefined) {
        transactionsState.transactions = transactionsState.transactions.filter(
            tx => tx.header !== header
        );
        return;
    }

    if (!tx) {
        transactionsState.transactions.push({
            header,
            state: {
                ...defaultTransaction,
                ...partialTx,
            },
        });
        return;
    }

    Object.keys(partialTx).forEach(k => {
        // Typescript mess here, but is definetly safe!
        const s = tx.state as any;
        const p = partialTx as any;
        if (!deepEqual(s[k], p[k])) s[k] = p[k];
    });
};