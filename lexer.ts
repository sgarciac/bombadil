import ct = require("chevrotain")


export class OneLineComment extends ct.Token {
  static PATTERN = /#.*/;
  static GROUP = ct.Lexer.SKIPPED;
}

export class Identifier extends ct.Token { 
  static PATTERN = /[A-Za-z0-9_-]+/;
}

export class Integer extends ct.Token {
  static PATTERN = /[+-]?(\d_|_\d|\d)+/;
}

export class Float extends ct.Token {
  static PATTERN = /([+-]?(\d_|_\d|\d)+)(((\.(\d_|_\d|\d)+)([Ee]([+-])?(\d_|_\d|\d)+))|((\.(\d_|_\d|\d)+)|([Ee]([+-])?(\d_|_\d|\d)+)))/;
}

export class EndOfLine extends ct.Token {
  static PATTERN = /\n+/;
  static GROUP = ct.Lexer.SKIPPED;
}

export class WhiteSpace extends ct.Token {
  static PATTERN = /[^\S\n]+/;
  static GROUP = ct.Lexer.SKIPPED;
}

// The Value mode
export class OpenValue extends ct.Token {
  static PATTERN = /=/;
  static PUSH_MODE = "value"
}

export class CloseValue extends ct.Token {
  static PATTERN = /\n+/;
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
  static PUSH_MODE = "multi_line_basic_string";
}

export class CloseMultiLineBasicString extends ct.Token {
  static PATTERN = /"""/;
  static POP_MODE = true;
}

export class OpenBasicString extends ct.Token {
  static PATTERN = /"/;
  static PUSH_MODE = "basic_string";
}

export class CloseBasicString extends ct.Token {
  static PATTERN = /"/;
  static POP_MODE = true;
}

export class OpenLiteralString extends ct.Token {
  static PATTERN = /'/;
  static PUSH_MODE = "literal_string";
}

export class CloseLiteralString extends ct.Token {
  static PATTERN = /'/;
  static POP_MODE = true;
}

export class OpenMultiLineLiteralString extends ct.Token {
  static PATTERN = /'''/;
  static PUSH_MODE = "multi_line_literal_string";
}

export class CloseMultiLineLiteralString extends ct.Token {
  static PATTERN = /'''/;
  static POP_MODE = true;
}

export class EscapedChar extends ct.Token {
  static PATTERN = /(\\b)|(\\t)|(\\n)|(\\f)|(\\")|(\\r)|(\\\\)/
  static GROUP = ct.Lexer.SKIPPED;
}

export class EscapedUnicode extends ct.Token {
  static PATTERN = /(\\u\d{4})|(\\U\d{6})/
}

export class SubBasicString extends ct.Token {
  static PATTERN = /[^\\"\r\n]+/
}

export class SubMultiLineBasicString extends ct.Token {
  static PATTERN = /([^\\"]|"(?!""))+/
}

export class MultiLineIgnorableSubstring extends ct.Token {
  static PATTERN = /\\\s*\n\s*/;
}

export class LiteralString extends ct.Token {
  static PATTERN = /[^'\n\r]+/;
}

export class MultiLineLiteralString extends ct.Token {
  static PATTERN = /([^']|'(?!''))+/;
}

export class Booolean extends ct.Token {
  static PATTERN = /((true)(?!(\s*=)))|((false(?!(\s*=))))/;
}

export class OpenArray extends ct.Token {
  static PATTERN = /\[/;
  static PUSH_MODE = "array";
}

export class CloseArray extends ct.Token {
  static PATTERN = /\]/;
  static POP_MODE = true;
}

export class OpenTable extends ct.Token {
  static PATTERN = /\[/;
  static PUSH_MODE = "table";
}

export class CloseTable extends ct.Token {
  static PATTERN = /\]/;
  static POP_MODE = true;
}

var modes = {
  modes: {
    top: [
    OpenTable,
    Identifier,
    OpenBasicString,
    OpenLiteralString, 
    OpenValue,
    WhiteSpace,
    EndOfLine, 
    OneLineComment, 
    ],
    value: [
    Float,
    Integer,
    Booolean,
    WhiteSpace,
    OneLineComment,
    OpenMultiLineBasicString, 
    OpenMultiLineLiteralString,
    OpenBasicString, 
    OpenLiteralString,
    OpenArray,
    CloseValue
    ],
    table: [
      Identifier,
      Dot,
      WhiteSpace,
      OpenBasicString,
      OpenLiteralString,
      CloseTable
    ]
    ,
    array: [
    Float,
    Integer,
    Booolean,
    WhiteSpace,
    EndOfLine,
    Comma,
    OneLineComment,
    OpenMultiLineBasicString, 
    OpenMultiLineLiteralString,
    OpenBasicString, 
    OpenLiteralString,
    OpenArray,
    CloseArray
    ],
    basic_string: [CloseBasicString, 
    EscapedChar, 
    EscapedUnicode, 
    SubBasicString],
    multi_line_basic_string: [CloseMultiLineBasicString, 
    EscapedChar, 
    EscapedUnicode, 
    MultiLineIgnorableSubstring, 
    SubMultiLineBasicString],
    literal_string: [LiteralString, 
    CloseLiteralString],
    multi_line_literal_string: [MultiLineLiteralString, CloseMultiLineLiteralString]
  },
  defaultMode: "top"
}

var myLexer = new ct.Lexer(modes);

export function tokenize(input){
  return myLexer.tokenize(input);
}