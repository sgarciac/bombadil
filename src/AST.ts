import ct = require('chevrotain');

// Table headers. We keep the Token for reporting errors during the loading phase.
export const tableHeader: 'tableHeader' = 'tableHeader';
export class TomlTableHeader {
    type: typeof tableHeader;
    headers: string[];
    token: ct.IToken;
}
export function tomlTableHeader(headers: string[], token: ct.IToken): TomlTableHeader {
    return { type: tableHeader, headers: headers, token: token }
};

export const tableArrayEntryHeader: 'tableArrayEntryHeader' = 'tableArrayEntryHeader';
export interface TomlTableArrayEntryHeader {
    type: typeof tableArrayEntryHeader;
    headers: string[];
    token: ct.IToken;
}
export function tomlTableArrayEntryHeader(headers: string[], token: ct.IToken): TomlTableArrayEntryHeader {
    return { type: tableArrayEntryHeader, headers: headers, token: token }
}

// Bindings
export const keyValue: 'keyValue' = 'keyValue';
export class TomlKeyValue {
    type: typeof keyValue;
    key: string;
    value: any;
    token: ct.IToken;
}
export function tomlKeyValue(key: string, value: any, token: ct.IToken): TomlKeyValue {
    return { type: keyValue, key: key, value: value, token: token }
};

// Structures
export const inlineTable: 'inlineTable' = 'inlineTable';
export interface TomlInlineTable {
    type: typeof inlineTable;
    bindings: TomlKeyValue[];
}
export function tomlInlineTable(bindings: TomlKeyValue[]): TomlInlineTable {
    return { type: inlineTable, bindings: bindings };
}

export const array: 'array' = 'array';
export interface TomlArray {
    type: typeof array;
    contents: TomlValue[];
    token: ct.IToken;
}
export function tomlArray(contents: TomlValue[], token: ct.IToken) {
    return { type: array, contents: contents, token: token };
}

// Atomic Values
export enum TomlAtomicValueType {
    OffsetDateTime, LocalDateTime, LocalDate, LocalTime, String, Integer, Float, Boolean
}

export interface TomlAtomicGeneric<T> {
    image: string;
    value: T;
}

export const offsetDateTime: 'offsetDateTime' = 'offsetDateTime';
export const localDateTime: 'localDateTime' = 'localDateTime';
export const localDate: 'localDate' = 'localDate';
export const localTime: 'localTime' = 'localTime';
export interface TomlAtomicDateTime extends TomlAtomicGeneric<Date> {
    type: typeof offsetDateTime | typeof localDateTime | typeof localDate | typeof localTime;
}
export function tomlAtomicOffsetDateTime(image: string, value: Date): TomlAtomicDateTime {
    return { type: offsetDateTime, image: image, value: value };
}
export function tomlAtomicLocalDateTime(image: string, value: Date): TomlAtomicDateTime {
    return { type: localDateTime, image: image, value: value };
}
export function tomlAtomicLocalDate(image: string, value: Date): TomlAtomicDateTime {
    return { type: localDate, image: image, value: value };
}
export function tomlAtomicLocalTime(image: string, value: Date): TomlAtomicDateTime {
    return { type: localTime, image: image, value: value };
}

export const atomicString: 'atomicString' = 'atomicString';
export interface TomlAtomicString extends TomlAtomicGeneric<string> {
    type: typeof atomicString;
}
export function tomlAtomicString(image: string, value: string): TomlAtomicString {
    return { type: atomicString, image: image, value: value };
}

export const atomicInteger: 'atomicInteger' = 'atomicInteger';
export interface TomlAtomicInteger extends TomlAtomicGeneric<number> {
    type: typeof atomicInteger;
}
export function tomlAtomicInteger(image: string, value: number): TomlAtomicInteger {
    return { type: atomicInteger, image: image, value: value };
}

export const atomicFloat: 'atomicFloat' = 'atomicFloat';
export interface TomlAtomicFloat extends TomlAtomicGeneric<number> {
    type: typeof atomicFloat;
}
export function tomlAtomicFloat(image: string, value: number): TomlAtomicFloat {
    return { type: atomicFloat, image: image, value: value };
}

export const atomicBoolean: 'atomicBoolean' = 'atomicBoolean';
export interface TomlAtomicBoolean extends TomlAtomicGeneric<boolean> {
    type: typeof atomicBoolean;
}
export function tomlAtomicBoolean(image: string, value: boolean): TomlAtomicBoolean {
    return { type: atomicBoolean, image: image, value: value };
}

export type TomlAtomicValue =
    TomlAtomicDateTime | TomlAtomicString | TomlAtomicInteger | TomlAtomicFloat | TomlAtomicBoolean;

export type TopLevelTomlDocumentEntry = (TomlKeyValue | TomlTableHeader | TomlTableArrayEntryHeader)

export type TomlValue = (
    TomlAtomicValue |
    TomlInlineTable |
    TomlArray);
