import { ref } from 'valtio';
import { AlertState, alertState } from "../../components/AlertDialog";

export const showAlert = (title: string, opts: Omit<Partial<AlertState>, 'title' | 'isOpen'> = {}) => {
    const { body: _body, confirmPrefix: _confirmPrefix, ...rest } = opts
    const body = (_body && typeof _body === 'object') ? ref(_body) : _body
    const confirmPrefix = (_confirmPrefix && typeof _confirmPrefix === 'object') ? ref(_confirmPrefix) : _confirmPrefix

    const nwState: AlertState = {
        isOpen: true,
        title,
        body,
        confirmPrefix,
        cancelText: undefined,
        confirmText: undefined,
        onCancel: undefined,
        onConfirm: undefined,
        ...rest,
    }
    Object.entries(nwState).forEach(([key, value]) => {
        (alertState as any)[key] = value
    })
}