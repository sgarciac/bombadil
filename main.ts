import {TokenConstructor, Token} from 'chevrotain';

import * as toml_lexer from './lexer';
import * as toml_parser from './parser';
import * as toml_loader from './tables';

import fs = require('fs');

let example_text = fs.readFileSync('example.toml').toString();
//console.log(result.errors);
//console.log(JSON.stringify(result.tokens,null,4));

function parseInput(text) {
   let result = toml_lexer.tomlLexer.tokenize(text); 
   //console.log(result.tokens);
   console.log("lexer errors: " + result.errors.map(x => x.message));
   
   let parser = new toml_parser.TomlParser(result.tokens, toml_lexer.allTokens);
   let entries = parser.documentRule();
   console.log(toml_loader.load_toml(entries));

   //console.log(entries);
   if (parser.errors.length > 0) {
      console.log('sad sad panda, Parsing errors detected '+parser.errors);
   }
}

parseInput(example_text);
