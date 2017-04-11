import ct = require('chevrotain');
import * as l from "./lexer";
import * as tools from "./fcp";

export class TomlTableHeader {
    constructor(public headers: string[]){
    }
}

export class TomlParser extends ct.Parser {

    public documentRule = this.RULE('documentRule',() => {
        let documentEntries = [];
        this.MANY(()=>{
            this.OR(
            [
            {ALT: () =>{documentEntries.push(this.SUBRULE(this.tableHeaderRule))}},
            {ALT: () =>{documentEntries.push(this.SUBRULE(this.tableArrayEntryHeaderRule))}},
            {ALT: () =>{this.SUBRULE(this.keyValueRule)}}                    
            ]
            );
        });
        return documentEntries;        
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
        let headers = [];
        this.CONSUME(l.OpenTable);
        this.AT_LEAST_ONE_SEP({SEP: l.Dot, DEF: () => {
            headers.push(this.SUBRULE(this.identifierRule));
        }});
        this.CONSUME(l.CloseTable);
        return headers;
    });

    tableArrayEntryHeaderRule = this.RULE('tableArrayEntryHeaderRule',() => {
        let headers = [];
        this.CONSUME(l.OpenTableArrayItem);
        this.AT_LEAST_ONE_SEP({SEP: l.Dot, DEF: () => {
            headers.push(this.SUBRULE(this.identifierRule));
        }});
        this.CONSUME(l.CloseTableArrayItem);
        return headers;
    });
    
    basicStringRule = this.RULE('basicStringRule',() => {
        let basicString : string = "";
        this.CONSUME(l.OpenBasicString);
        this.MANY(()=>{
            this.OR([
                {ALT: () => {basicString += tools.escapedToString(this.CONSUME(l.EscapedChar).image)}},
                {ALT: () => {basicString += tools.unicodeToString(this.CONSUME(l.EscapedUnicode).image)}},
                {ALT: () => {basicString += this.CONSUME(l.SubBasicString).image}}
            ])
        });
        this.CONSUME(l.CloseBasicString);
        return basicString;
    });

    literalStringRule =  this.RULE('literalStringRule', () => {
        let literalString : string ;
        this.CONSUME(l.OpenLiteralString);
        this.OPTION(() => {literalString = this.CONSUME(l.LiteralString).image});
        this.CONSUME(l.CloseLiteralString);
        return literalString;        
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
        let id : string;
        this.OR([
        {ALT: () => {id =  this.CONSUME(l.Identifier).image}},
        {ALT: () => {id = this.SUBRULE(this.literalStringRule)}},
        {ALT: () => {id = this.SUBRULE(this.basicStringRule)}}
        ]);
        return id
    });
        
    constructor(input, constructors) {
            super(input, constructors);
            var $ = this;
            ct.Parser.performSelfAnalysis(this);
    }
}
    