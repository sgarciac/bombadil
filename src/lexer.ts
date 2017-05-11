import ct = require('chevrotain')


export class OneLineComment extends ct.Token {
    static PATTERN = /#.*/;
    static GROUP = ct.Lexer.SKIPPED;
}

// Basic identifiers
export class Identifier extends ct.Token {
    static PATTERN = /[A-Za-z0-9_-]+/;
}

// Atomic values
export class Integer extends ct.Token {
    static PATTERN = /[+-]?(\d_|_\d|\d)+/;
}

export class Float extends ct.Token {
    static PATTERN = /([+-]?(\d_|_\d|\d)+)(((\.(\d_|_\d|\d)+)([Ee]([+-])?(\d_|_\d|\d)+))|((\.(\d_|_\d|\d)+)|([Ee]([+-])?(\d_|_\d|\d)+)))/;
}

export class Booolean extends ct.Token {
    static PATTERN = /true|false/;
}

export class OffsetDateTime extends ct.Token {
    static PATTERN = /-?\d{4}-\d{2}-\d{2}(t|\s)\d{2}:\d{2}:\d{2}(\.\d+)?(z|([-+]\d{2}:\d{2}))/i
}

export class LocalDateTime extends ct.Token {
    static PATTERN = /-?\d{4}-\d{2}-\d{2}(t|\s)\d{2}:\d{2}:\d{2}(\.\d+)?/i
}

export class LocalDate extends ct.Token {
    static PATTERN = /-?\d{4}-\d{2}-\d{2}/i
}

export class LocalTime extends ct.Token {
    static PATTERN = /\d{2}:\d{2}:\d{2}(\.\d+)?/i
}

export class EndOfLine extends ct.Token {
    static PATTERN = /(\r\n|\n)+/;
    static GROUP = ct.Lexer.SKIPPED;
}

export class WhiteSpace extends ct.Token {
    static PATTERN = /[^\S\n\r]+/;
    static GROUP = ct.Lexer.SKIPPED;
}

export class OpenValue extends ct.Token {
    static PATTERN = /=/;
    static PUSH_MODE = 'value'
}

export class CloseValue extends ct.Token {
    static PATTERN = /(\r\n|\n)+/;
    static POP_MODE = true;
}

export class OpenInlineTable extends ct.Token {
    static PATTERN = /\{/;
    static PUSH_MODE = 'inline_table'
}

export class CloseInlineTable extends ct.Token {
    static PATTERN = /\}/;
    static POP_MODE = true;
}

export class OpenInlineValue extends ct.Token {
    static PATTERN = /=/;
    static PUSH_MODE = 'inline_value'
}

export class CloseInlineValue extends ct.Token {
    // hackish way to use } as end of value without consuming it
    static PATTERN = /,|(.{0}(?=}))/;
    static POP_MODE = true;
}

export class Comma extends ct.Token {
    static PATTERN = /,/;
}

export class Dot extends ct.Token {
    static PATTERN = /\./;
}

export class OpenMultiLineBasicString extends ct.Token {
    static PATTERN = /"""/;
    static PUSH_MODE = 'multi_line_basic_string';
}

export class CloseMultiLineBasicString extends ct.Token {
    static PATTERN = /"""/;
    static POP_MODE = true;
}

export class OpenBasicString extends ct.Token {
    static PATTERN = /"/;
    static PUSH_MODE = 'basic_string';
}

export class CloseBasicString extends ct.Token {
    static PATTERN = /"/;
    static POP_MODE = true;
}

export class OpenLiteralString extends ct.Token {
    static PATTERN = /'/;
    static PUSH_MODE = 'literal_string';
}

export class CloseLiteralString extends ct.Token {
    static PATTERN = /'/;
    static POP_MODE = true;
}

export class OpenMultiLineLiteralString extends ct.Token {
    static PATTERN = /'''/;
    static PUSH_MODE = 'multi_line_literal_string';
}

export class CloseMultiLineLiteralString extends ct.Token {
    static PATTERN = /'''/;
    static POP_MODE = true;
}

export class EscapedChar extends ct.Token {
    static PATTERN = /(\\b)|(\\t)|(\\n)|(\\f)|(\\")|(\\r)|(\\\\)/
}

export class EscapedUnicode extends ct.Token {
    static PATTERN = /(\\u([0-9A-Fa-f]{4}))|(\\U([0-9A-Fa-f]{8}))/
}

export class SubBasicString extends ct.Token {
    static PATTERN = /[^\\"\r\n]+/
}

export class SubMultiLineBasicString extends ct.Token {
    static PATTERN = /([^\\"]|"(?!""))+/
}

export class MultiLineIgnorableSubstring extends ct.Token {
    static PATTERN = /\\\s*(\r\n|\n)\s*/;
    static GROUP = ct.Lexer.SKIPPED;
}

export class LiteralString extends ct.Token {
    static PATTERN = /[^'\n\r]+/;
}

export class MultiLineLiteralString extends ct.Token {
    static PATTERN = /([^']|'(?!''))+/;
}

export class OpenArray extends ct.Token {
    static PATTERN = /\[/;
    static PUSH_MODE = 'array';
}

export class CloseArray extends ct.Token {
    static PATTERN = /\]/;
    static POP_MODE = true;
}

export class OpenTable extends ct.Token {
    static PATTERN = /\[/;
    static PUSH_MODE = 'table';
}

export class CloseTable extends ct.Token {
    static PATTERN = /\]((([^\S\n\r]*#.*)|[^\S\n\r]*)(\r\n|\n))/;
    static POP_MODE = true;
}

export class OpenTableArrayItem extends ct.Token {
    static PATTERN = /\[\[/;
    static PUSH_MODE = 'table_array_item';
}

export class CloseTableArrayItem extends ct.Token {
    static PATTERN = /\]\][^\S\n\r]*/;
    static POP_MODE = true;
}


var open_all_strings: ct.TokenConstructor[] = [
    OpenMultiLineBasicString,
    OpenMultiLineLiteralString,
    OpenBasicString,
    OpenLiteralString];

var atomic_literals: ct.TokenConstructor[] = [
    OffsetDateTime,
    LocalDateTime,
    LocalDate,
    LocalTime,
    Float,
    Integer,
    Booolean,
]

var open_identifier_strings: ct.TokenConstructor[] = [
    OpenBasicString,
    OpenLiteralString
]

var single_line_skipped: ct.TokenConstructor[] = [
    WhiteSpace,
    OneLineComment,
]

var all_skipped: ct.TokenConstructor[] = [
    WhiteSpace,
    EndOfLine,
    OneLineComment,
]

var modes: ct.IMultiModeLexerDefinition = {
    modes: {
        top: [
            OpenTableArrayItem,
            OpenTable,
            Identifier,
            ...open_identifier_strings,
            ...all_skipped,
            OpenValue,
        ],
        value: [
            ...open_all_strings,
            ...atomic_literals,
            ...single_line_skipped,
            OpenArray,
            OpenInlineTable,
            CloseValue
        ],
        table: [
            Identifier,
            ...open_identifier_strings,
            Dot,
            WhiteSpace,
            CloseTable
        ]
        ,
        table_array_item: [
            Identifier,
            ...open_identifier_strings,
            Dot,
            WhiteSpace,
            CloseTableArrayItem
        ]
        ,
        array: [
            ...atomic_literals,
            ...all_skipped,
            ...open_all_strings,
            Comma,
            OpenArray,
            OpenInlineTable,
            CloseArray
        ],
        inline_table: [
            Identifier,
            ...open_identifier_strings,
            ...single_line_skipped,
            OpenInlineValue,
            CloseInlineTable
        ],
        inline_value: [
            ...open_all_strings,
            ...atomic_literals,
            ...single_line_skipped,
            OpenArray,
            OpenInlineTable,
            CloseInlineValue
        ],
        basic_string: [
            CloseBasicString,
            EscapedChar,
            EscapedUnicode,
            SubBasicString],
        multi_line_basic_string: [
            CloseMultiLineBasicString,
            EscapedChar,
            EscapedUnicode,
            MultiLineIgnorableSubstring,
            SubMultiLineBasicString],
        literal_string: [LiteralString,
            CloseLiteralString],
        multi_line_literal_string: [
            MultiLineLiteralString,
            CloseMultiLineLiteralString]
    },
    defaultMode: 'top'
}

export var tomlLexer = new ct.Lexer(modes);

export var allTokens = [];
for (let symbol in this) {
    if (this[symbol].tokenType) {
        allTokens.push(this[symbol]);
    }
}



