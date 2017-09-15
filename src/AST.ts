import ct = require('chevrotain');

/**
 * The code in this file follows a general pattern.  First, I introduce a string literal
 * to use as the "tag" in the tagged unions.  I assign that literal to a variable so that
 * we don't actually use string literals in the code.  Forcing the use of the variable 
 * allows us to catch potential errors.
 * 
 * In addition, an interface for each node type is then defined.  Generally speaking, this
 * interface, while exported, isn't actually that useful outside this file.  But there are
 * some cases where they are used (hence the export).  The main reason to include the
 * interface definition is just to explicitly state the contents of the node.
 * 
 * Finally, I include a "constructor" function for each interface.  Since these are interfaces
 * and not classes, we need to define our constructor function separately.  Now, a reasonable
 * question would be "why not uses classes and a constructor defined in the class?".  The
 * reason is because once you have a class, you can use `instanceof` on the instances and
 * this is dangerous because classes are values and if classes and instances are imported
 * from different packages, things will not line up and you'll get very confusing results.
 * Using these tagged unions and interfaces avoids this but still gives a type safe way
 * to "switch" on different node types.
 */

// Table headers. We keep the Token for reporting errors during the loading phase.
export const tableHeader: 'tableHeader' = 'tableHeader';
export interface TomlTableHeader {
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
export interface TomlKeyValue {
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

export const arrayType: 'tomlArray' = 'tomlArray';
export interface TomlArray {
    type: typeof arrayType;
    contents: TomlValue[];
    token: ct.IToken;
}
export function tomlArray(contents: TomlValue[], token: ct.IToken) {
    return { type: arrayType, contents: contents, token: token };
}

// Atomic Values
export enum TomlAtomicValueType {
    OffsetDateTime, LocalDateTime, LocalDate, LocalTime, String, Integer, Float, Boolean
}

export interface TomlAtomicGeneric<T> {
    image: string;
    value: T;
}

// For atomic data, first we list all the node types
export const offsetDateTime: 'offsetDateTime' = 'offsetDateTime';
export const localDateTime: 'localDateTime' = 'localDateTime';
export const localDate: 'localDate' = 'localDate';
export const localTime: 'localTime' = 'localTime';

// then we list a single parameterized interface for all nodes (since they all have
// the same structure and only the type of the data changes).
export interface TomlAtomicDateTime extends TomlAtomicGeneric<Date> {
    type: typeof offsetDateTime | typeof localDateTime | typeof localDate | typeof localTime;
}

// Now, the constructor functions.
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

// Now we define a few convenient union types to represent essentially different
// grammatic productions
export type TomlAtomicValue =
    TomlAtomicDateTime | TomlAtomicString | TomlAtomicInteger | TomlAtomicFloat | TomlAtomicBoolean;

export type TopLevelTomlDocumentEntry = (TomlKeyValue | TomlTableHeader | TomlTableArrayEntryHeader)

export type TomlValue = (
    TomlAtomicValue |
    TomlInlineTable |
    TomlArray);
