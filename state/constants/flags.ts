import { SelectOption } from '../transactions';

interface Flags {
    [key: string]: string;
}

export const transactionFlags: { [key: /* TransactionType */ string]: Flags } = {
    Payment: {
        tfNoDirectRipple: "0x00010000",
        tfPartialPayment: "0x00020000",
        tfLimitQuality: "0x00040000",
    },
    // TODO Add more here
}


export function combineFlags(flags?: string[]): string | undefined {
    if (!flags) return

    const num = flags.reduce((cumm, curr) =>  cumm | BigInt(curr), BigInt(0))
    return num.toString()
}

export function extractFlags(transactionType: string, flags?: string | number,): SelectOption[] {
    const flagsObj = transactionFlags[transactionType]
    if (!flags || !flagsObj) return []

    const extracted = Object.entries(flagsObj).reduce((cumm, [label, value]) => {
        return (BigInt(flags) & BigInt(value)) ? cumm.concat({ label, value }) : cumm
    }, [] as SelectOption[])

    return extracted
}