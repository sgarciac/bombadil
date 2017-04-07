import ct = require('chevrotain');
import * as l from "./lexer";

export class TomlParser extends ct.Parser {
    
    documentRule = this.RULE('documentRule',() => {
        this.MANY(()=>{
            this.OR(
            [
            {ALT: () =>{this.SUBRULE(this.tableHeaderRule)}}
            ]
            );
        })        
    });
    
    tableHeaderRule = this.RULE('tableHeaderRule',() => {
        this.CONSUME(l.OpenTable);
        this.AT_LEAST_ONE_SEP({SEP: l.Dot, DEF: () => {
            this.SUBRULE(this.identifierRule);
        }});
        this.CONSUME(l.CloseTable);
    });
    
    public literalStringRule =  this.RULE('literalStringRule', () => {
        this.CONSUME(l.OpenLiteralString);
        this.OPTION(() => {this.CONSUME(l.LiteralString)});
        this.CONSUME(l.CloseLiteralString);
    });
    
    //bareKeyworkRule = this.RULE('bareKeyword', () => {this.CONSUME(l.Identifier)});
    
    public identifierRule = this.RULE('identifierRule', () => {
        this.OR([
        {ALT: () => {this.CONSUME(l.Identifier)}},
        {ALT: () => {this.SUBRULE(this.literalStringRule)}}]);});
        
        constructor(input, constructors) {
            super(input, constructors);
            var $ = this;
            ct.Parser.performSelfAnalysis(this);
        }
    }
    