import ct = require('chevrotain');
import * as l from "./lexer";

export class TomlParser extends ct.Parser {
    
    public literalString;
    public identifier;

    constructor(input, constructors) {
        super(input, constructors);
        let $ = this;
        
        this.literalString = $.RULE("literalString", () => {
            $.CONSUME(l.OpenLiteralString);
            $.OPTION(() => {$.CONSUME(l.LiteralString)});
            $.CONSUME(l.CloseLiteralString);
        });

        $.RULE("bareKeyword", () => {$.CONSUME(l.Identifier)});
        
        this.identifier = $.RULE("identifier", () => {
          $.OR([
            {ALT: () => {$.CONSUME(l.Identifier)}},
            {ALT: () => {$.SUBRULE(this.literalString)}}]);})
         
        ct.Parser.performSelfAnalysis(this);
    }
}
