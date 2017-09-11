import { readFileSync } from 'fs';
import * as path from 'path';
import { TomlReader, TomlError } from '../src/bombadil';
import {
    TomlAtomicValue, TomlAtomicValueType, TomlArray, TopLevelTomlDocumentEntry,
    TomlKeyValue, TomlTableArrayEntryHeader,
} from '../src/parser';
import { safeLoad } from 'js-yaml';

function readSample(name: string): string {
    return readFileSync(path.join(__dirname, 'toml-test-samples', name)).toString();
}

function bombadilToTomlTestAtomicValue(input: TomlAtomicValue) {
    switch (input.type) {
        case TomlAtomicValueType.Integer: {
            return { type: 'integer', value: input.image };
        }
        case TomlAtomicValueType.Float: {
            return { type: 'float', value: input.value.toString() };
        }
        case TomlAtomicValueType.Boolean: {
            return { type: 'bool', value: input.image.toString() };
        }
        case TomlAtomicValueType.String: {
            return { type: 'string', value: input.value };
        }
        case TomlAtomicValueType.LocalDateTime: {
            return { type: 'datetime', value: input.image };
        }
        case TomlAtomicValueType.OffsetDateTime: {
            return { type: 'datetime', value: input.image };
        }
        case TomlAtomicValueType.LocalDate: {
            return { type: 'datetime', value: input.image };
        }
        case TomlAtomicValueType.LocalTime: {
            return { type: 'datetime', value: input.image };
        }

        default: {
            throw 'eh!?';
        }
    }
}

function bombadilToTomlTest(input, property: boolean) {
    if (input instanceof TomlAtomicValue) {
        return bombadilToTomlTestAtomicValue(input);
    } else if (input instanceof TomlArray) {
        let vals = input.contents.map((x) => bombadilToTomlTest(x, false));
        return { type: 'array', value: vals };
    } else if (input instanceof Array) {
        const value = input.map((x) => bombadilToTomlTest(x, false));
        // This is the bit that needed to be tweaked to match toml-test
        if (property) return value;
        return { type: 'array', value: value };
    } else {
        let newObj = {}
        for (let property in input) {
            let pval = input[property];
            let val = bombadilToTomlTest(pval, true);
            newObj[property] = val;
        }
        return newObj;
    }
}


function compare(toml: string) {
    let input = readSample(toml + '.toml');
    let baseline = JSON.parse(readSample(toml + '.json'));
    let reader = new TomlReader();
    reader.readToml(input, true);
    // let reader2 = new TomlReader();
    // reader2.readToml(input, false);
    let val = bombadilToTomlTest(reader.result, false);
    expect(val).toEqual(baseline);
}

const tests = [
    'array-empty',
    'array-nospaces',
    'arrays-hetergeneous',
    'arrays-nested',
    'arrays',
    'bool',
    'comments-everywhere',
    'datetime',
    'empty',
    'example',
    'float',
    'implicit-and-explicit-after',
    'implicit-and-explicit-before',
    'table-empty',
    'implicit-groups',
    'integer',
    'key-equals-nospace',
    'key-space',
    'key-special-chars',
    'long-float',
    'long-integer',
    'multiline-string',
    'raw-multiline-string',
    'raw-string',
    'string-empty',
    'string-escapes',
    'string-simple',
    'string-with-pound',
    'table-array-implicit',
    'table-array-many',
    'table-array-nest',
    'table-array-one',
    'table-sub-empty',
    'table-whitespace',
    'table-with-pound',
    'unicode-escape',
    'unicode-literal',
];

tests.forEach((name) => {
    test('Running toml-test for ' + name, () => {
        compare(name);
    })
})
