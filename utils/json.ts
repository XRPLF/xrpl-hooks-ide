export const extractJSON = (str?: string) => {
    if (!str) return
    let firstOpen = 0, firstClose = 0, candidate = '';
    firstOpen = str.indexOf('{', firstOpen + 1);
    do {
        firstClose = str.lastIndexOf('}');
        if (firstClose <= firstOpen) {
            return;
        }
        do {
            candidate = str.substring(firstOpen, firstClose + 1);
            try {
                let result = JSON.parse(candidate);
                return { result, start: firstOpen < 0 ? 0 : firstOpen, end: firstClose }
            }
            catch (e) { }
            firstClose = str.substring(0, firstClose).lastIndexOf('}');
        } while (firstClose > firstOpen);
        firstOpen = str.indexOf('{', firstOpen + 1);
    } while (firstOpen != -1);
}

export const parseJSON = (str?: string | null): any | undefined => {
    if (!str) return undefined
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === "object" ? parsed : undefined;
    } catch (error) {
        return undefined;
    }
}