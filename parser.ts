import ct = require('chevrotain');
import * as l from "./lexer";
import * as tools from "./tools";

export class TomlTableHeader {constructor(public headers: string[]){}}

export class TomlTableArrayEntryHeader {constructor(public headers: string[]){}}

export class TomlKeyValue {constructor(public key: string, public value: any){}}

export class TomlParser extends ct.Parser {

    public documentRule = this.RULE('documentRule',() => {
        let documentEntries = [];
        this.MANY(()=>{
            this.OR(
            [
            {ALT: () =>{documentEntries.push(this.SUBRULE(this.tableHeaderRule))}},
            {ALT: () =>{documentEntries.push(this.SUBRULE(this.tableArrayEntryHeaderRule))}},
            {ALT: () =>{documentEntries.push(this.SUBRULE(this.keyValueRule))}}                    
            ]
            );
        });
        return documentEntries;        
    });
    
    keyValueRule = this.RULE('keyValueRule',()=>{
        let keyword = this.SUBRULE(this.identifierRule);
        this.CONSUME(l.OpenValue);
        let value = this.SUBRULE(this.valueRule);
        this.CONSUME(l.CloseValue);
        return new TomlKeyValue(keyword, value);
    })

    valueRule = this.RULE('valueRule',()=>{
        let value : any;
        this.OR([
                // atomic values
                {ALT: () => {value = Number(tools.cleanNumberImage(this.CONSUME(l.Float).image))}},
                {ALT: () => {value = Number(tools.cleanNumberImage(this.CONSUME(l.Integer).image))}},
                {ALT: () => {value = this.CONSUME(l.DateTime).image}},
                {ALT: () => {value = this.CONSUME(l.Booolean).image}},
                // structures
                {ALT: () => {this.SUBRULE(this.arrayRule)}},
                {ALT: () => {this.SUBRULE(this.inlineTableRule)}},

                //Strings
                {ALT: () => {value = this.SUBRULE(this.literalStringRule)}},
                {ALT: () => {value = this.SUBRULE(this.multiLineBasicStringRule)}},
                {ALT: () => {value = this.SUBRULE(this.multiLineLiteralStringRule)}},
                {ALT: () => {value = this.SUBRULE(this.basicStringRule)}}
            ]);
        return value;
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
        return new TomlTableHeader(headers);
    });

    tableArrayEntryHeaderRule = this.RULE('tableArrayEntryHeaderRule',() => {
        let headers = [];
        this.CONSUME(l.OpenTableArrayItem);
        this.AT_LEAST_ONE_SEP({SEP: l.Dot, DEF: () => {
            headers.push(this.SUBRULE(this.identifierRule));
        }});
        this.CONSUME(l.CloseTableArrayItem);
        return new TomlTableArrayEntryHeader(headers);
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
        let literalString : string;
        this.CONSUME(l.OpenLiteralString);
        this.OPTION(() => {literalString = this.CONSUME(l.LiteralString).image});
        this.CONSUME(l.CloseLiteralString);
        return literalString;        
    });

    multiLineBasicStringRule = this.RULE('multiLineBasicStringRule',() => {
        let multiLineString : string = "";
        this.CONSUME(l.OpenMultiLineBasicString);
        this.MANY(()=>{
            this.OR([
                {ALT: () => {multiLineString += tools.escapedToString(this.CONSUME(l.EscapedChar).image)}},
                {ALT: () => {multiLineString += tools.unicodeToString(this.CONSUME(l.EscapedUnicode).image)}},
                {ALT: () => {multiLineString += this.CONSUME(l.SubMultiLineBasicString).image}}
            ])
        });
        this.CONSUME(l.CloseMultiLineBasicString);
        return multiLineString;
    });

    multiLineLiteralStringRule = this.RULE('multiLineLiteralStringRule',() => {
        let value : string;
        this.CONSUME(l.OpenMultiLineLiteralString);
        this.OPTION(()=>{
            value = this.CONSUME(l.MultiLineLiteralString).image;
        });
        this.CONSUME(l.CloseMultiLineLiteralString);
        return value;
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
    