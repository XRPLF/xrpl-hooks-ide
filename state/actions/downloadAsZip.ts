import { createZip } from '../../utils/zip';
import { guessZipFileName } from '../../utils/helpers';
import state from '..'

export const downloadAsZip = async () => {
    // TODO do something about loading state
    const files = state.files.map(({ name, content }) => ({ name, content }));
    const zipped = await createZip(files);
    const zipFileName = guessZipFileName(files);
    zipped.saveFile(zipFileName);
};