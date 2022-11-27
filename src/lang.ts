export { isSpecialKey, isSelectKey };

let cs61aConfig = {
  "specialKey": [
    "define",
    "let",
    "lambda",
    "define-macro",
  ],
  "selectKey": [
    "if",
    "cond"
  ]
}

function isSpecialKey(str: string) {
  return getConfig().specialKey.includes(str)
}

function isSelectKey(str: string) {
  return getConfig().selectKey.includes(str)
}

function getConfig() {
  return cs61aConfig
}