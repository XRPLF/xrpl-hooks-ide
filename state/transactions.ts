import { proxy } from 'valtio';
import { deepEqual } from '../utils/object';
import transactionsData from "../content/transactions.json";

export type SelectOption = {
    value: string;
    label: string;
};

export interface TransactionState {
    selectedTransaction: SelectOption | null;
    selectedAccount: SelectOption | null;
    selectedDestAccount: SelectOption | null;
    txIsLoading: boolean;
    txIsDisabled: boolean;
    txFields: TxFields;
}


export type TxFields = Omit<
    typeof transactionsData[0],
    "Account" | "Sequence" | "TransactionType"
>;

export type OtherFields = (keyof Omit<TxFields, "Destination">)[];

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
    activeHeader: "test1.json"
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

    if (deepEqual(partialTx, {})) {
        tx.state = { ...defaultTransaction }
        console.log({ tx: tx.state, is: tx.state === defaultTransaction })
    }

    Object.keys(partialTx).forEach(k => {
        // Typescript mess here, but is definetly safe!
        const s = tx.state as any;
        const p = partialTx as any;
        if (!deepEqual(s[k], p[k])) s[k] = p[k];
    });
};

export const prepareTransaction = (data: any) => {
    let options = { ...data };

    // options.Destination = selectedDestAccount?.value;
    (Object.keys(options)).forEach(field => {
        let _value = options[field];
        // convert currency
        if (typeof _value === "object" && _value.type === "currency") {
            if (+_value.value) {
                options[field] = (+_value.value * 1000000 + "") as any;
            } else {
                options[field] = undefined; // 👇 💀
            }
        }
        // handle type: `json`
        if (typeof _value === "object" && _value.type === "json") {
            if (typeof _value.value === "object") {
                options[field] = _value.value as any;
            } else {
                try {
                    options[field] = JSON.parse(_value.value);
                } catch (error) {
                    const message = `Input error for json field '${field}': ${error instanceof Error ? error.message : ""
                        }`;
                    throw Error(message);
                }
            }
        }

        // delete unneccesary fields
        if (!options[field]) {
            delete options[field];
        }
    });

    return options
}

export { transactionsData }
