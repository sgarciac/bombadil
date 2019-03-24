import ct = require("chevrotain");

ct.createToken;

export const OneLineComment = ct.createToken({
  name: "OneLineComment",
  pattern: /#.*/,
  group: ct.Lexer.SKIPPED
});

// Basic identifiers
export const Identifier = ct.createToken({
  name: "Identifier",
  pattern: /[A-Za-z0-9_-]+/
});

// Atomic values
export const Integer = ct.createToken({
  name: "Integer",
  pattern: /[+-]?(([1-9](_\d|\d)*)|0)/
});

export const BinaryInteger = ct.createToken({
  name: "BinaryInteger",
  pattern: /0b[10](_[01]|[01])*/
});

export const OctalInteger = ct.createToken({
  name: "OctalInteger",
  pattern: /0o[0-7](_[0-7]|[0-7])*/
});

export const HexInteger = ct.createToken({
  name: "HexInteger",
  pattern: /0x[0-9A-Fa-f](_[0-9A-Fa-f]|[0-9A-Fa-f])*/
});

export const Float = ct.createToken({
  name: "Float",
  pattern: /([+-]?(([1-9](_\d|\d)*)|0+))(((\.([0-9](_\d|\d)*))([Ee]([+-])?(([1-9](_\d|\d)*)|0)))|((\.([0-9](_\d|\d)*))|([Ee]([+-])?(([1-9](_\d|\d)*)|0))))/
});

export const TomlInfinity = ct.createToken({
  name: "TomlInfinity",
  pattern: /[+-]?inf/
});

export const TomlNotANumber = ct.createToken({
  name: "TomlNotANumber",
  pattern: /[+-]?nan/
});

export const Booolean = ct.createToken({
  name: "Booolean",
  pattern: /true|false/
});

export const OffsetDateTime = ct.createToken({
  name: "OffsetDateTime",
  pattern: /-?\d{4}-\d{2}-\d{2}(t|\s)\d{2}:\d{2}:\d{2}(\.\d+)?(z|([-+]\d{2}:\d{2}))/i
});

export const LocalDateTime = ct.createToken({
  name: "LocalDateTime",
  pattern: /-?\d{4}-\d{2}-\d{2}(t|\s)\d{2}:\d{2}:\d{2}(\.\d+)?/i,
  longer_alt: OffsetDateTime
});

export const LocalDate = ct.createToken({
  name: "LocalDate",
  pattern: /-?\d{4}-\d{2}-\d{2}/i,
  longer_alt: LocalDateTime
});

export const LocalTime = ct.createToken({
  name: "LocalTime",
  pattern: /\d{2}:\d{2}:\d{2}(\.\d+)?/i
});

export const EndOfLine = ct.createToken({
  name: "EndOfLine",
  pattern: /(\r\n|\n)+/
});

export const SkippedEndOfLine = ct.createToken({
  name: "SkippedEndOfLine",
  pattern: /(\r\n|\n)+/,
  group: ct.Lexer.SKIPPED
});

export const WhiteSpace = ct.createToken({
  name: "WhiteSpace",
  pattern: /[^\S\n\r]+/,
  group: ct.Lexer.SKIPPED
});

export const OpenValue = ct.createToken({
  name: "OpenValue",
  pattern: /=/,
  push_mode: "value"
});

export const CloseValue = ct.createToken({
  name: "CloseValue",
  pattern: /(\r\n|\n)+/,
  pop_mode: true
});

export const OpenInlineTable = ct.createToken({
  name: "OpenInlineTable",
  pattern: /\{/,
  push_mode: "inline_table"
});

export const CloseInlineTable = ct.createToken({
  name: "CloseInlineTable",
  pattern: /\}/,
  pop_mode: true
});

export const OpenInlineValue = ct.createToken({
  name: "OpenInlineValue",
  pattern: /=/,
  push_mode: "inline_value"
});

export const CloseInlineValue = ct.createToken({
  name: "CloseInlineValue",
  // hackish way to use } as end of value without consuming it
  pattern: /,|(.{0}(?=}))/,
  pop_mode: true
});

export const Comma = ct.createToken({
  name: "Comma",
  pattern: /,/
});

export const Dot = ct.createToken({
  name: "Dot",
  pattern: /\./
});

export const OpenMultiLineBasicString = ct.createToken({
  name: "OpenMultiLineBasicString",
  pattern: /"""/,
  push_mode: "multi_line_basic_string"
});

export const CloseMultiLineBasicString = ct.createToken({
  name: "CloseMultiLineBasicString",
  pattern: /"""/,
  pop_mode: true
});

export const OpenBasicString = ct.createToken({
  name: "OpenBasicString",
  pattern: /"/,
  push_mode: "basic_string"
});

export const CloseBasicString = ct.createToken({
  name: "CloseBasicString",
  pattern: /"/,
  pop_mode: true
});

export const OpenLiteralString = ct.createToken({
  name: "OpenLiteralString",
  pattern: /'/,
  push_mode: "literal_string"
});

export const CloseLiteralString = ct.createToken({
  name: "CloseLiteralString",
  pattern: /'/,
  pop_mode: true
});

export const OpenMultiLineLiteralString = ct.createToken({
  name: "OpenMultiLineLiteralString",
  pattern: /'''/,
  push_mode: "multi_line_literal_string"
});

export const CloseMultiLineLiteralString = ct.createToken({
  name: "CloseMultiLineLiteralString",
  pattern: /'''/,
  pop_mode: true
});

export const EscapedChar = ct.createToken({
  name: "EscapedChar",
  pattern: /(\\b)|(\\t)|(\\n)|(\\f)|(\\")|(\\r)|(\\\\)/
});

export const EscapedUnicode = ct.createToken({
  name: "EscapedUnicode",
  pattern: /(\\u([0-9A-Fa-f]{4}))|(\\U([0-9A-Fa-f]{8}))/
});

export const SubBasicString = ct.createToken({
  name: "SubBasicString",
  pattern: /[^\\"\r\n\u007f\u0000-\u001f]+/
});

export const SubMultiLineBasicString = ct.createToken({
  name: "SubMultiLineBasicString",
  pattern: /(\n|\r|[^\\"\u007f\u0000-\u001f]|"(?!""))+/
});

export const MultiLineIgnorableSubstring = ct.createToken({
  name: "MultiLineIgnorableSubstring",
  pattern: /\\\s*(\r\n|\n)\s*/,
  group: ct.Lexer.SKIPPED
});

export const LiteralString = ct.createToken({
  name: "LiteralString",
  pattern: /[^'\n\r\u007f\u0000-\u001f]+/
});

export const MultiLineLiteralString = ct.createToken({
  name: "MultiLineLiteralString",
  pattern: /(\n|\r|[^'\u007f\u0000-\u001f]|'(?!''))+/
});

export const OpenArray = ct.createToken({
  name: "OpenArray",
  pattern: /\[/,
  push_mode: "array"
});

export const CloseArray = ct.createToken({
  name: "CloseArray",
  pattern: /\]/,
  pop_mode: true
});

export const OpenTable = ct.createToken({
  name: "OpenTable",
  pattern: /\[/,
  push_mode: "table"
});

export const CloseTable = ct.createToken({
  name: "CloseTable",
  pattern: /\]/,
  pop_mode: true
});

export const OpenTableArrayItem = ct.createToken({
  name: "OpenTableArrayItem",
  pattern: /\[\[/,
  push_mode: "table_array_item"
});

export const CloseTableArrayItem = ct.createToken({
  name: "CloseTableArrayItem",
  pattern: /\]\]/,
  pop_mode: true
});

var open_all_strings: ct.TokenType[] = [
  OpenMultiLineBasicString,
  OpenMultiLineLiteralString,
  OpenBasicString,
  OpenLiteralString
];

var atomic_literals: ct.TokenType[] = [
  OffsetDateTime,
  LocalDateTime,
  LocalDate,
  LocalTime,
  Float,
  TomlInfinity,
  TomlNotANumber,
  BinaryInteger,
  OctalInteger,
  HexInteger,
  Integer,
  Booolean
];

var open_identifier_strings: ct.TokenType[] = [
  OpenBasicString,
  OpenLiteralString
];

var single_line_skipped: ct.TokenType[] = [WhiteSpace, OneLineComment];

var all_skipped: ct.TokenType[] = [
  WhiteSpace,
  SkippedEndOfLine,
  OneLineComment
];

export const tomlLexerModes: ct.IMultiModeLexerDefinition = {
  modes: {
    top: [
      OpenTableArrayItem,
      OpenTable,
      Identifier,
      ...open_identifier_strings,
      Dot,
      EndOfLine,
      ...single_line_skipped,
      OpenValue
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
    ],
    table_array_item: [
      Identifier,
      ...open_identifier_strings,
      Dot,
      WhiteSpace,
      CloseTableArrayItem
    ],
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
      Dot,
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
      SubBasicString
    ],
    multi_line_basic_string: [
      CloseMultiLineBasicString,
      EscapedChar,
      EscapedUnicode,
      MultiLineIgnorableSubstring,
      SubMultiLineBasicString
    ],
    literal_string: [LiteralString, CloseLiteralString],
    multi_line_literal_string: [
      MultiLineLiteralString,
      CloseMultiLineLiteralString
    ]
  },
  defaultMode: "top"
};

export var tomlLexer = new ct.Lexer(tomlLexerModes);
