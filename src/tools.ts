import moment = require('moment');

function fromCodePoint(codePoint) {
    let codeUnits = [];
    let highSurrogate;
    let lowSurrogate;
    if (codePoint > 0x10FFFF) {
        throw RangeError('Invalid code point: ' + codePoint);
    }
    if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
    } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
    }
    return String.fromCharCode.apply(null, codeUnits);
}


function cleanNumberImage(image: string): string {
    return image.replace('_', '');
}

export function startsWithEOL(string): boolean {
    return string.match(/^(\n|\r\n)/);
}

export function trimWhiteSpacePrefix(string) {
    if (startsWithEOL(string)) {
        return string.replace(/^[\s\uFEFF\xA0]+/, '');
    } else {
        return string;
    }
}

// Parsing of TOML values
export function parseNumber(image : string){
    return Number(cleanNumberImage(image));
}

export function parseBoolean(image : string){
    return (image[0] === 't') ? true : false;
}

export function parseDateTime(image: string){
    return moment(image).toDate();
}

export function parseTime(image: string){
    return moment('0000-00-00T'+image).toDate();
}

export function parseEscapedUnicode(unicode): string {
    let size = (unicode[1] == 'u') ? 4 : 6;
    let codeString = unicode.substr(2, 1 + size);
    return fromCodePoint([parseInt(codeString, 16)]);
}

export function parseEscapedCharacter(escaped: string): string {
    switch (escaped) {
        case '\\n':
            return '\n';
        case '\\r':
            return '\r';
        case '\\\\':
            return '\\'
        case '\\\"':
            return '\"';
        case '\\b':
            return '\b';
        case '\\t':
            return '\t';
        case '\\f':
            return '\f';
        default:
            throw 'unrecognised escaped char';
    }
}