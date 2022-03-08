# How to generate json file from markdown files

Go to xrpl-hooks-docs folder
`cd xrpl-hooks-docs`

Then run the `makeJson.js` script in that folder:
`node makeJson.js`

If everything goes well this should output `xrpl-hooks-docs-files.json` file which contains array of the error codes and markdown related to that.

Something like this:

```json
{"code":"hooks-account-buf-len","markdown":"hooks-account-buf-len\n---\n\nFunction `hook_account` has fixed-size account ID output.\n\nThis check warns about too-small size of its output buffer (if it's\nspecified by a constant - variable parameter is ignored).\n\n"},{"code":"hooks-account-conv-buf-len","markdown":"hooks-account-conv-buf-len\n---\n\nFunction `util_raddr` has fixed-size account ID input.\n\nThis check warns unless the correct size is passed in the input size\nparameter (if it's specified by a constant - variable parameter is\nignored).\n"}]
```
