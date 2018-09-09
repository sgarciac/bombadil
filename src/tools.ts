import moment = require('moment');

function fromCodePoint(codePoint: number) {
    let codeUnits = [];
    let highSurrogate;
    let lowSurrogate;
    if ((codePoint > 0x10FFFF) ||
        (codePoint > 0xD7FF && codePoint < 0xE000)
    ) {
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
    return image.replace(/_/g, '');
}

export function startsWithEOL(str: string): boolean {
    return !!str.match(/^(\n|\r\n)/);
}

export function trimWhiteSpacePrefix(str: string): string {
    if (startsWithEOL(str)) {
        return str.replace(/^[\s\uFEFF\xA0]+/, '');
    } else {
        return str;
    }
}

// Parsing of TOML values
export function parseFloat(image: string): number {
    return Number(cleanNumberImage(image));
}

export function parseDecInteger(image: string): number {
    return parseInt(cleanNumberImage(image));
}

export function parseBinaryInteger(image: string): number {
    return parseInt(cleanNumberImage(image.substr(2)), 2);
}

export function parseOctalInteger(image: string): number {
    return parseInt(cleanNumberImage(image.substr(2)), 8);
}

export function parseHexInteger(image: string): number {
    return parseInt(cleanNumberImage(image.substr(2)), 16);
}

export function parseInfinity(image: string) {
    return image[0] === '-' ? -Infinity : Infinity
}

export function parseNotANumber(image: string) {
    return image[0] === '-' ? -NaN : NaN
}

export function parseBoolean(image: string) {
    return (image[0] === 't') ? true : false;
}

export function parseOffetDateTime(image: string) {
    return moment(image).toDate();
}

export function parseLocalDateTime(image: string) {
    return moment(image + 'Z').toDate();
}

export function parseLocalDate(image: string) {
    return moment(image + 'T00:00:00Z').toDate();
}

export function parseLocalTime(image: string) {
    return moment('0000-00-00T' + image + 'Z').toDate();
}

export function parseEscapedUnicode(unicode: string): string {
    let size = (unicode[1] == 'u') ? 4 : 8;
    let codeString = unicode.substr(2, 1 + size);
    return fromCodePoint(parseInt(codeString, 16));
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
