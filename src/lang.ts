export { isSpecialKey, isSelectKey };

let cs61aConfig = {
  "specialKey": [
    "define",
    "let",
    "lambda",
    "define-macro",
    // for Racket
    "trace-define",
    "define/contract",
    "let*",
    "let-values",
    "let*-values",
    "for",
    "for/list",
    "for/vector",
    "for/hash",
    "for/hasheq",
    "for/hashalw",
    "for/and",
    "for/or",
    "for/sum",
    "for/product",
    "for*",
    "for*/list",
    "for*/vector",
    "for*/hash",
    "for*/hasheq",
    "for*/hashalw",
    "for*/and",
    "for*/or",
    "for*/sum",
    "for*/product",
  ],
  "selectKey": [
    "if",
    "cond",
    // for Racket
    "when",
    "unless",
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