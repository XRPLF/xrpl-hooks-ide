interface File {
    name: string
}

export const guessZipFileName = (files: File[]) => {
    let parts = (files.filter(f => f.name.endsWith('.c'))[0]?.name || 'hook').split('.')
    parts = parts.length > 1 ? parts.slice(0, -1) : parts
    return parts.join('')
}