import { Spec, parse } from "comment-parser"

export const getTags = (source?: string): Spec[] => {
    if (!source) return []
    const blocks = parse(source)
    const tags = blocks.reduce(
        (acc, block) => acc.concat(block.tags),
        [] as Spec[]
    );
    return tags
}