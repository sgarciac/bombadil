import ct = require('chevrotain');

// Table headers. We keep the Token for reporting errors during the loading phase.
export class TomlTableHeader {
    type: 'tableHeader';
    constructor(public headers: string[], public token: ct.IToken) { }
}

export class TomlTableArrayEntryHeader {
    type: 'tableArrayEntryHeader';
    constructor(public headers: string[], public token: ct.IToken) { }
}

// Bindings
export class TomlKeyValue {
    type: 'tomlKeyValue';
    constructor(public key: string, public value: any, public token: ct.IToken) { }
}

// Structures
export class TomlInlineTable {
    type: 'tomlInlineTable';
    constructor(public bindings: TomlKeyValue[]) { }
}

export class TomlArray {
    type: 'tomlArray';
    constructor(public contents: TomlValue[], public token: ct.IToken) { }
}

// Atomic Values
export enum TomlAtomicValueType {
    OffsetDateTime, LocalDateTime, LocalDate, LocalTime, String, Integer, Float, Boolean
}

export class TomlAtomicOffsetDateTime {
    type: 'offsetDateTime';
    constructor(public image: string, public value: Date) { }
}

export class TomlAtomicLocalDateTime {
    type: 'localDateTime';
    constructor(public image: string, public value: Date) { }
}

export class TomlAtomicLocalDate {
    type: 'localDate';
    constructor(public image: string, public value: Date) { }
}

export class TomlAtomicLocalTime {
    type: 'localTime';
    constructor(public image: string, public value: Date) { }
}

export class TomlAtomicString {
    type: 'atomicString';
    constructor(public image: string, public value: string) { }
}

export class TomlAtomicInteger {
    type: 'atomicInteger';
    constructor(public image: string, public value: number) { }
}

export class TomlAtomicFloat {
    type: 'atomicFloat';
    constructor(public image: string, public value: number) { }
}

export class TomlAtomicBoolean {
    type: 'atomicBoolean';
    constructor(public image: string, public value: boolean) { }
}

export type TomlAtomicValue =
    TomlAtomicOffsetDateTime | TomlAtomicLocalDateTime | TomlAtomicLocalDate | TomlAtomicLocalTime |
    TomlAtomicString | TomlAtomicInteger | TomlAtomicFloat | TomlAtomicBoolean;

export type TopLevelTomlDocumentEntry = (TomlKeyValue | TomlTableHeader | TomlTableArrayEntryHeader)

export type TomlValue = (
    TomlAtomicValue |
    TomlInlineTable |
    TomlArray);
