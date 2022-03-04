const rst2mdown = require("rst2mdown");
const fs = require("fs");

// Read all rst files from rst folders
const files = fs.readdirSync("./rst");

const mdFiles = [];

// Loop through the rst files
files.forEach((file) => {
  // Read rst file
  const rstFile = fs.readFileSync(`./rst/${file}`);
  // Turn rst file into markdown
  const md = rst2mdown(rstFile.toString());
  // If you want to create actual markdown files uncomment next line
  // fs.writeFileSync(`./md/${file.split(".")[0]}.md`, md);
  // Push the filename as a code property and the contents of markdown to mdFiles array
  mdFiles.push({ code: file.split(".")[0], markdown: md });
});

// Write json file which contains the code and markdown related to that,
// this json file will be used to enrich the language server messages
fs.writeFileSync("xrpl-hooks-docs-files.json", JSON.stringify(mdFiles));
