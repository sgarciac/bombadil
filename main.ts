import {TokenConstructor, Token} from 'chevrotain';
import * as toml from './dist/bombadil';

import * as fss  from 'fs';

let example_text = fss.readFileSync('example2.toml').toString();
//console.log(result.errors);
//console.log(JSON.stringify(result.tokens,null,4));

function parseInput(text) {
   let result = toml.tomlLexer.tokenize(text); 
   //console.log(result.tokens);
   console.log("lexer errors: " + result.errors.map(x => x.message));
   
   let parser = new toml.TomlParser(result.tokens, toml.allTokens);
   let entries = parser.documentRule();
   console.log(JSON.stringify(toml.load_toml(entries)));

   //console.log(entries);
   if (parser.errors.length > 0) {
      console.log('sad sad panda, Parsing errors detected '+JSON.stringify(parser.errors));
   }
}

parseInput(example_text);
