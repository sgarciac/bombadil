import * as toml_lexer from './lexer';
import ct = require('chevrotain');

import fs = require('fs');
let example_text = fs.readFileSync("example.toml").toString();
console.log(example_text);
console.log(toml_lexer.tokenize(example_text));


