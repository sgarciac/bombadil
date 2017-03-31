import * as toml_lexer from './lexer';
import ct = require('chevrotain');

import fs = require('fs');
let example_text = fs.readFileSync("example.toml").toString();
let result = toml_lexer.tokenize(example_text); 
console.log(result.errors);
console.log(JSON.stringify(result.tokens,null,4));


