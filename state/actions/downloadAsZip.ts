import { createZip } from '../../utils/zip';
import { guessZipFileName } from '../../utils/helpers';
import state from '..'
import toast from 'react-hot-toast';

export const downloadAsZip = async () => {
    try {
        state.zipLoading = true
        // TODO do something about file/gist loading state
        const files = state.files.map(({ name, content }) => ({ name, content }));
        const wasmFiles = state.files.filter(i => i.compiledContent).map(({ name, compiledContent }) => ({ name: `${name}.wasm`, content: compiledContent }));
        const zipped = await createZip([...files, ...wasmFiles]);
        const zipFileName = guessZipFileName(files);
        zipped.saveFile(zipFileName);
    } catch (error) {
        toast.error('Error occured while creating zip file, try again later')
    } finally {
        state.zipLoading = false
    }
};