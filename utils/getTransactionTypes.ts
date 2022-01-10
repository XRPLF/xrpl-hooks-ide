
// From https://runkit.com/wietsewind/get-gh-xrpl-tx-types
export const getTransactionTypes = async () => {
    const dirList: any[] = await fetch(
        "https://api.github.com/repos/ripple/xrpl-dev-portal/contents/content/references/protocol-reference/transactions/transaction-types"
    ).then(r => r.json());

    const relevantFiles = dirList.filter(r => r.name.match(/^[a-zA-Z]+\.md$/));
    return Promise.all(
        relevantFiles.map(async f => {
            const source = await fetch(f.download_url).then(r => r.text());
            return {
                transactionType: source.match(/^# ([a-zA-Z]+)/gm)?.[0].slice(2),
                docLink: "https://xrpl.org/" + f.name.split(".")[0] + ".html",
                codeSamples: source
                    .split(`\n`)
                    .join(" ")
                    .match(/```.+?```/gm)
                    ?.map(s =>
                        s
                            .split("```")[1]
                            .trim()
                            .replace(/^json[\n]*/gm, "")
                    )
                    .map(s => s.replace(/,[ \t\n\\t\\n]*}$/, "}"))
                    .map(s => {
                        try {
                            return JSON.parse(s);
                        } catch (e) {
                            return s;
                        }
                    }),
            };
        })
    );
};
