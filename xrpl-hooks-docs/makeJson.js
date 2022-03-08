const fs = require("fs");

// Read all md files from md folders
const files = fs.readdirSync("./md");
const mdFiles = [];
files.forEach((file) => {
  const fileName = file.split(".")[0];

  const md = fs.readFileSync(`./md/${fileName}.md`).toString();

  mdFiles.push({ code: fileName, markdown: md });
});

fs.writeFileSync("xrpl-hooks-docs-files.json", JSON.stringify(mdFiles));
