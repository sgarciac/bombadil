import ct = require('chevrotain');
import * as l from "./lexer";

class TomlParser extends ct.Parser {
    
    constructor(input:ct.Token[], constructors) {
        super(input, constructors);
        let $ = this;
        $.RULE("selectStatement", () => {
          $.SUBRULE($.selectClause)
          $.SUBRULE($.fromClause)
          $.OPTION(() => {
             $.SUBRULE($.whereClause)        
         })
         
         ct.Parser.performSelfAnalysis(this)
       })
    }   
}