import ct = require('chevrotain');
import * as l from "./lexer";
import * as tools from "./tools";

// Table headers
export class TomlTableHeader { constructor(public headers: string[]) { } }
export class TomlTableArrayEntryHeader { constructor(public headers: string[]) { } }

// Bindings
export class TomlKeyValue { constructor(public key: string, public value: any) { } }

// VALUES:

// Structures
export class TomlInlineTable { constructor(public bindings: TomlKeyValue[]) { } }
export class TomlArray { constructor(public contents: any[]) { } }
// dates
export class TomlOffsetDateTime { constructor(public offsetDateTime : string) {}}
export class TomlLocalDateTime { constructor(public localDateTime : string) {}}
export class TomlLocalDate { constructor(public localDate : string) {}}
export class TomlLocalTime { constructor(public localTime : string) {}}

export type TopLevelTomlDocumentEntry = (TomlKeyValue | TomlTableHeader | TomlTableArrayEntryHeader) 


export class TomlParser extends ct.Parser {

    public documentRule : () => TopLevelTomlDocumentEntry[] = this.RULE('documentRule', () => {
        let documentEntries : TopLevelTomlDocumentEntry[] = [];
        this.MANY(() => {
            this.OR(
                [
                    { ALT: () => { documentEntries.push(this.SUBRULE(this.tableHeaderRule)) } },
                    { ALT: () => { documentEntries.push(this.SUBRULE(this.tableArrayEntryHeaderRule)) } },
                    { ALT: () => { documentEntries.push(this.SUBRULE(this.keyValueRule)) } }
                ]
            );
        });
        return documentEntries;
    });

    keyValueRule = this.RULE('keyValueRule', () => {
        let keyword = this.SUBRULE(this.identifierRule);
        this.CONSUME(l.OpenValue);
        let value = this.SUBRULE(this.valueRule);
        this.CONSUME(l.CloseValue);
        return new TomlKeyValue(keyword, value);
    })

    valueRule = this.RULE('valueRule', () => {
        let value: any;
        this.OR([
            // Atomic values
            { ALT: () => { value = Number(tools.cleanNumberImage(this.CONSUME(l.Float).image)) } },
            { ALT: () => { value = Number(tools.cleanNumberImage(this.CONSUME(l.Integer).image)) } },
            { ALT: () => { value = new TomlOffsetDateTime(this.CONSUME(l.OffsetDateTime).image) } },
            { ALT: () => { value = new TomlLocalDateTime(this.CONSUME(l.LocalDateTime).image) } },
            { ALT: () => { value = new TomlLocalDate(this.CONSUME(l.LocalDate).image) } },
            { ALT: () => { value = new TomlLocalTime(this.CONSUME(l.LocalTime).image) } },
            
            { ALT: () => { value = this.CONSUME(l.Booolean).image } },
            // structures
            { ALT: () => { value = this.SUBRULE(this.arrayRule) } },
            { ALT: () => { value = this.SUBRULE(this.inlineTableRule) } },
            //Strings
            { ALT: () => { value = this.SUBRULE(this.literalStringRule) } },
            { ALT: () => { value = this.SUBRULE(this.multiLineBasicStringRule) } },
            { ALT: () => { value = this.SUBRULE(this.multiLineLiteralStringRule) } },
            { ALT: () => { value = this.SUBRULE(this.basicStringRule) } }
        ]);
        return value;
    })

    // not using MANY_SEP because of trailing commas.
    arrayRule = this.RULE('arrayRule', () => {
        let values : any[] = [];
        this.CONSUME(l.OpenArray);
        this.OPTION(() => {
            values.push(this.SUBRULE(this.valueRule));
            this.MANY(() => {
                this.CONSUME(l.Comma);
                values.push(this.SUBRULE2(this.valueRule));
            })
            this.MANY2(() => { this.CONSUME2(l.Comma) });
        })
        this.CONSUME(l.CloseArray);
        return new TomlArray(values);
    })

    inlineTableRule = this.RULE('inlineTableRule', () => {
        let bindings : TomlKeyValue[] = [];
        this.CONSUME(l.OpenInlineTable);
        this.MANY(() => {
            let identifier = this.SUBRULE(this.identifierRule);
            this.CONSUME(l.OpenInlineValue);
            let value = this.SUBRULE(this.valueRule);
            this.CONSUME(l.CloseInlineValue);
            bindings.push(new TomlKeyValue(identifier, value));
        });
        this.CONSUME(l.CloseInlineTable);
        return new TomlInlineTable(bindings);
    })


    tableHeaderRule = this.RULE('tableHeaderRule', () => {
        let headers = [];
        this.CONSUME(l.OpenTable);
        this.AT_LEAST_ONE_SEP({
            SEP: l.Dot, DEF: () => {
                headers.push(this.SUBRULE(this.identifierRule));
            }
        });
        this.CONSUME(l.CloseTable);
        return new TomlTableHeader(headers);
    });

    tableArrayEntryHeaderRule = this.RULE('tableArrayEntryHeaderRule', () => {
        let headers = [];
        this.CONSUME(l.OpenTableArrayItem);
        this.AT_LEAST_ONE_SEP({
            SEP: l.Dot, DEF: () => {
                headers.push(this.SUBRULE(this.identifierRule));
            }
        });
        this.CONSUME(l.CloseTableArrayItem);
        return new TomlTableArrayEntryHeader(headers);
    });

    basicStringRule = this.RULE('basicStringRule', () => {
        let basicString: string = "";
        this.CONSUME(l.OpenBasicString);
        this.MANY(() => {
            this.OR([
                { ALT: () => { basicString += tools.escapedToString(this.CONSUME(l.EscapedChar).image) } },
                { ALT: () => { basicString += tools.unicodeToString(this.CONSUME(l.EscapedUnicode).image) } },
                { ALT: () => { basicString += this.CONSUME(l.SubBasicString).image } }
            ])
        });
        this.CONSUME(l.CloseBasicString);
        return basicString;
    });

    literalStringRule = this.RULE('literalStringRule', () => {
        let literalString: string;
        this.CONSUME(l.OpenLiteralString);
        this.OPTION(() => { literalString = this.CONSUME(l.LiteralString).image });
        this.CONSUME(l.CloseLiteralString);
        return literalString;
    });

    multiLineBasicStringRule = this.RULE('multiLineBasicStringRule', () => {
        let multiLineString: string = "";
        this.CONSUME(l.OpenMultiLineBasicString);
        this.MANY(() => {
            this.OR([
                { ALT: () => { multiLineString += tools.escapedToString(this.CONSUME(l.EscapedChar).image) } },
                { ALT: () => { multiLineString += tools.unicodeToString(this.CONSUME(l.EscapedUnicode).image) } },
                { ALT: () => { multiLineString += this.CONSUME(l.SubMultiLineBasicString).image } }
            ])
        });
        this.CONSUME(l.CloseMultiLineBasicString);
        return tools.trimWhiteSpacePrefix(multiLineString);
    });

    multiLineLiteralStringRule = this.RULE('multiLineLiteralStringRule', () => {
        let value: string;
        this.CONSUME(l.OpenMultiLineLiteralString);
        this.OPTION(() => {
            value = this.CONSUME(l.MultiLineLiteralString).image;
        });
        this.CONSUME(l.CloseMultiLineLiteralString);
        return tools.trimWhiteSpacePrefix(value);
    });

    //bareKeyworkRule = this.RULE('bareKeyword', () => {this.CONSUME(l.Identifier)});
    identifierRule = this.RULE('identifierRule', () => {
        let id: string;
        this.OR([
            { ALT: () => { id = this.CONSUME(l.Identifier).image } },
            { ALT: () => { id = this.SUBRULE(this.literalStringRule) } },
            { ALT: () => { id = this.SUBRULE(this.basicStringRule) } }
        ]);
        return id
    });

    constructor(input, constructors) {
        super(input, constructors);
        var $ = this;
        ct.Parser.performSelfAnalysis(this);
    }
}
