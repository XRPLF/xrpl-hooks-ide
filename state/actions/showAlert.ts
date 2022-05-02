import { ref } from 'valtio';
import { AlertState, alertState } from "../../components/AlertDialog";

export const showAlert = (title: string, opts: Partial<AlertState> = {}) => {
    const { body: _body, confirmNode: _confirmNode, ...rest } = opts
    const body = (_body && typeof _body === 'object') ? ref(_body) : _body
    const confirmNode = (_confirmNode && typeof _confirmNode === 'object') ? ref(_confirmNode) : _confirmNode

    const nwState = {
        isOpen: true,
        title,
        body,
        confirmNode,
        ...rest
    }
    Object.entries(nwState).forEach(([key, value]) => {
        (alertState as any)[key] = value
    })
}