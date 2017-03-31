import * as toml_lexer from './lexer';
import * as toml_parser from './parser';
import fs = require('fs');

let example_text = fs.readFileSync("example.toml").toString();
let result = toml_lexer.tomlLexer.tokenize(example_text); 

console.log(result.errors);
console.log(JSON.stringify(result.tokens,null,4));
