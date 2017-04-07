import ct = require('chevrotain');
import * as l from "./lexer";

export class TomlParser extends ct.Parser {
    
    public documentRule = this.RULE('documentRule',() => {
        this.MANY(()=>{
            this.OR(
            [
            {ALT: () =>{this.SUBRULE(this.tableHeaderRule)}},
            {ALT: () =>{this.SUBRULE(this.tableArrayEntryHeaderRule)}},
            {ALT: () =>{this.SUBRULE(this.keyValueRule)}}                    
            ]
            );
        })        
    });
    
    keyValueRule = this.RULE('keyValueRule',()=>{
        this.SUBRULE(this.identifierRule);
        this.CONSUME(l.OpenValue);
        this.SUBRULE(this.valueRule);
        this.CONSUME(l.CloseValue);
    })

    valueRule = this.RULE('valueRule',()=>{
        this.OR([
                // atomic values
                {ALT: () => {this.CONSUME(l.Float)}},
                {ALT: () => {this.CONSUME(l.Integer)}},
                {ALT: () => {this.CONSUME(l.DateTime)}},
                {ALT: () => {this.CONSUME(l.Booolean)}},
                // structures
                {ALT: () => {this.SUBRULE(this.arrayRule)}},
                {ALT: () => {this.SUBRULE(this.inlineTableRule)}},

                //Strings
                {ALT: () => {this.SUBRULE(this.literalStringRule)}},
                {ALT: () => {this.SUBRULE(this.multiLineBasicStringRule)}},
                {ALT: () => {this.SUBRULE(this.multiLineLiteralStringRule)}},
                {ALT: () => {this.SUBRULE(this.basicStringRule)}}
            ]);
    })

    // not using MANY_SEP because of trailing commas.
    arrayRule = this.RULE('arrayRule',()=>{
        this.CONSUME(l.OpenArray);
        this.OPTION(()=>{
            this.SUBRULE(this.valueRule);
            this.MANY(()=>{
                this.CONSUME(l.Comma);
                this.SUBRULE2(this.valueRule);
            })
            this.MANY2(() => {this.CONSUME2(l.Comma)});
        })
        this.CONSUME(l.CloseArray);
    })

    inlineTableRule = this.RULE('inlineTableRule',()=>{
        this.CONSUME(l.OpenInlineTable);
        this.MANY(()=>{
            this.SUBRULE(this.identifierRule);
            this.CONSUME(l.OpenInlineValue);
            this.SUBRULE(this.valueRule);
            this.CONSUME(l.CloseInlineValue);
        });
        this.CONSUME(l.CloseInlineTable);
    })


    tableHeaderRule = this.RULE('tableHeaderRule',() => {
        this.CONSUME(l.OpenTable);
        this.AT_LEAST_ONE_SEP({SEP: l.Dot, DEF: () => {
            this.SUBRULE(this.identifierRule);
        }});
        this.CONSUME(l.CloseTable);
    });

    tableArrayEntryHeaderRule = this.RULE('tableArrayEntryHeaderRule',() => {
        this.CONSUME(l.OpenTableArrayItem);
        this.AT_LEAST_ONE_SEP({SEP: l.Dot, DEF: () => {
            this.SUBRULE(this.identifierRule);
        }});
        this.CONSUME(l.CloseTableArrayItem);
    });
    
    basicStringRule = this.RULE('basicStringRule',() => {
        this.CONSUME(l.OpenBasicString);
        this.MANY(()=>{
            this.OR([
                {ALT: () => {this.CONSUME(l.EscapedChar)}},
                {ALT: () => {this.CONSUME(l.EscapedUnicode)}},
                {ALT: () => {this.CONSUME(l.SubBasicString)}}
            ])
        });
        this.CONSUME(l.CloseBasicString);
    });

    literalStringRule =  this.RULE('literalStringRule', () => {
        this.CONSUME(l.OpenLiteralString);
        this.OPTION(() => {this.CONSUME(l.LiteralString)});
        this.CONSUME(l.CloseLiteralString);
    });

    multiLineBasicStringRule = this.RULE('multiLineBasicStringRule',() => {
        this.CONSUME(l.OpenMultiLineBasicString);
        this.MANY(()=>{
            this.OR([
                {ALT: () => {this.CONSUME(l.EscapedChar)}},
                {ALT: () => {this.CONSUME(l.EscapedUnicode)}},
                {ALT: () => {this.CONSUME(l.SubMultiLineBasicString)}}
            ])
        });
        this.CONSUME(l.CloseMultiLineBasicString);
    });

    multiLineLiteralStringRule = this.RULE('multiLineLiteralStringRule',() => {
        this.CONSUME(l.OpenMultiLineLiteralString);
        this.OPTION(()=>{
            this.CONSUME(l.MultiLineLiteralString);
        });
        this.CONSUME(l.CloseMultiLineLiteralString);
    });

    //bareKeyworkRule = this.RULE('bareKeyword', () => {this.CONSUME(l.Identifier)});
    identifierRule = this.RULE('identifierRule', () => {
        this.OR([
        {ALT: () => {this.CONSUME(l.Identifier)}},
        {ALT: () => {this.SUBRULE(this.literalStringRule)}},
        {ALT: () => {this.SUBRULE(this.basicStringRule)}}
    ])});
        
    constructor(input, constructors) {
            super(input, constructors);
            var $ = this;
            ct.Parser.performSelfAnalysis(this);
        }
    }
    