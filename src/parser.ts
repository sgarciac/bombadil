import ct = require('chevrotain');
import * as l from './lexer';
import * as tools from './tools';
import * as ast from './AST';

export class TomlParser extends ct.Parser {

    public documentRule: () => ast.TopLevelTomlDocumentEntry[] = this.RULE('documentRule', () => {
        let documentEntries: ast.TopLevelTomlDocumentEntry[] = [];
        this.MANY(() => {
            this.OR(
                [
                    { ALT: () => { documentEntries.push(this.SUBRULE(this.tableHeaderRule)) } },
                    { ALT: () => { documentEntries.push(this.SUBRULE(this.tableArrayEntryHeaderRule)) } },
                    { ALT: () => { documentEntries.push(this.SUBRULE(this.keyValueRule)) } },
                    { ALT: () => { this.CONSUME(l.EndOfLine) } }
                ]
            );
        });
        return documentEntries;
    });

    keyValueRule = this.RULE('keyValueRule', () => {
        let keyword = this.SUBRULE(this.identifierRule);
        let equals = this.CONSUME(l.OpenValue);
        let value = this.SUBRULE(this.valueRule);
        this.OR([
            { ALT: () => this.CONSUME(l.CloseValue) },
            { ALT: () => this.CONSUME(ct.EOF) }
        ]);
        //this.CONSUME(l.CloseValue);
        return ast.tomlKeyValue(keyword, value, equals);
    })

    valueRule = this.RULE('valueRule', () => {
        let value: any;
        this.OR([
            // Atomic values
            { ALT: () => { let image = this.CONSUME(l.Float).image; value = ast.tomlAtomicFloat(image, tools.parseNumber(image)) } },
            { ALT: () => { let image = this.CONSUME(l.Integer).image; value = ast.tomlAtomicInteger(image, tools.parseNumber(image)) } },
            { ALT: () => { let image = this.CONSUME(l.Booolean).image; value = ast.tomlAtomicBoolean(image, tools.parseBoolean(image)) } },
            { ALT: () => { let image = this.CONSUME(l.OffsetDateTime).image; value = ast.tomlAtomicOffsetDateTime(image, tools.parseOffetDateTime(image)) } },
            { ALT: () => { let image = this.CONSUME(l.LocalDateTime).image; value = ast.tomlAtomicLocalDateTime(image, tools.parseLocalDateTime(image)) } },
            { ALT: () => { let image = this.CONSUME(l.LocalDate).image; value = ast.tomlAtomicLocalDate(image, tools.parseLocalDate(image)) } },
            { ALT: () => { let image = this.CONSUME(l.LocalTime).image; value = ast.tomlAtomicLocalTime(image, tools.parseLocalTime(image)) } },

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
        let values: any[] = [];
        let token = this.CONSUME(l.OpenArray);
        this.OPTION(() => {
            values.push(this.SUBRULE(this.valueRule));
            this.MANY(() => {
                this.CONSUME(l.Comma);
                values.push(this.SUBRULE2(this.valueRule));
            })
            this.MANY2(() => { this.CONSUME2(l.Comma) });
        })
        this.CONSUME(l.CloseArray);
        return ast.tomlArray(values, token);
    })

    inlineTableRule = this.RULE('inlineTableRule', () => {
        let bindings: ast.TomlKeyValue[] = [];
        this.CONSUME(l.OpenInlineTable);
        this.MANY(() => {
            let identifier = this.SUBRULE(this.identifierRule);
            let equals = this.CONSUME(l.OpenInlineValue);
            let value = this.SUBRULE(this.valueRule);
            this.CONSUME(l.CloseInlineValue);
            bindings.push(ast.tomlKeyValue(identifier, value, equals));
        });
        this.CONSUME(l.CloseInlineTable);
        return ast.tomlInlineTable(bindings);
    })


    tableHeaderRule = this.RULE('tableHeaderRule', (): ast.TomlTableHeader => {
        let headers: string[] = [];
        let open_table = this.CONSUME(l.OpenTable);
        this.AT_LEAST_ONE_SEP({
            SEP: l.Dot, DEF: () => {
                headers.push(this.SUBRULE(this.identifierRule));
            }
        });
        this.OR([
            { ALT: () => this.CONSUME(l.CloseTable) },
            { ALT: () => this.CONSUME(ct.EOF) }
        ]);
        return ast.tomlTableHeader(headers, open_table);
    });

    tableArrayEntryHeaderRule = this.RULE('tableArrayEntryHeaderRule', (): ast.TomlTableArrayEntryHeader => {
        let headers: string[] = [];
        let open_table = this.CONSUME(l.OpenTableArrayItem);
        this.AT_LEAST_ONE_SEP({
            SEP: l.Dot, DEF: () => {
                headers.push(this.SUBRULE(this.identifierRule));
            }
        });
        this.OR([
            { ALT: () => this.CONSUME(l.CloseTableArrayItem) },
            { ALT: () => this.CONSUME(ct.EOF) }
        ]);
        return ast.tomlTableArrayEntryHeader(headers, open_table);
    });

    basicStringRule = this.RULE('basicStringRule', () => {
        let basicString: string = '';
        let fullImage: string = '';
        this.CONSUME(l.OpenBasicString);
        this.MANY(() => {
            this.OR([
                { ALT: () => { let image = this.CONSUME(l.EscapedChar).image; basicString += tools.parseEscapedCharacter(image); fullImage += image } },
                { ALT: () => { let image = this.CONSUME(l.EscapedUnicode).image; basicString += tools.parseEscapedUnicode(image); fullImage += image } },
                { ALT: () => { let image = this.CONSUME(l.SubBasicString).image; basicString += image; fullImage += image } }
            ])
        });
        this.CONSUME(l.CloseBasicString);
        return ast.tomlAtomicString(fullImage, basicString);

    });

    literalStringRule = this.RULE('literalStringRule', (): ast.TomlAtomicString => {
        let literalString: string;
        this.CONSUME(l.OpenLiteralString);
        this.OPTION(() => { literalString = this.CONSUME(l.LiteralString).image });
        this.CONSUME(l.CloseLiteralString);
        return ast.tomlAtomicString(literalString, literalString);
    });

    multiLineBasicStringRule = this.RULE('multiLineBasicStringRule', () => {
        let multiLineString: string = '';
        let fullImage: string = '';
        this.CONSUME(l.OpenMultiLineBasicString);
        this.MANY(() => {
            this.OR([
                { ALT: () => { let image = this.CONSUME(l.EscapedChar).image; multiLineString += tools.parseEscapedCharacter(image); fullImage += image } },
                { ALT: () => { let image = this.CONSUME(l.EscapedUnicode).image; multiLineString += tools.parseEscapedUnicode(image); fullImage += image } },
                { ALT: () => { let image = this.CONSUME(l.SubMultiLineBasicString).image; multiLineString += image; fullImage += image } }
            ])
        });
        this.CONSUME(l.CloseMultiLineBasicString);
        return ast.tomlAtomicString(fullImage, tools.trimWhiteSpacePrefix(multiLineString));
    });

    multiLineLiteralStringRule = this.RULE('multiLineLiteralStringRule', () => {
        let value: string;
        this.CONSUME(l.OpenMultiLineLiteralString);
        this.OPTION(() => {
            value = this.CONSUME(l.MultiLineLiteralString).image;
        });
        this.CONSUME(l.CloseMultiLineLiteralString);
        return ast.tomlAtomicString(value, tools.trimWhiteSpacePrefix(value));
    });

    //bareKeyworkRule = this.RULE('bareKeyword', () => {this.CONSUME(l.Identifier)});
    identifierRule = this.RULE('identifierRule', (): string => {
        let id: string;
        this.OR([
            { ALT: () => { id = this.CONSUME(l.Identifier).image } },
            { ALT: () => { id = this.SUBRULE(this.literalStringRule).value } },
            { ALT: () => { id = this.SUBRULE(this.basicStringRule).value } }
        ]);
        return id;
    });

    constructor(input: ct.IToken[], constructors: ct.TokenConstructor[]) {
        super(input, constructors);
        var $ = this;
        ct.Parser.performSelfAnalysis(this);
    }
}
