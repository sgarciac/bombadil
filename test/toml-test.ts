import { readFileSync } from 'fs';
import * as path from 'path';
import { TomlReader } from '../src/bombadil';
import { TomlAtomicValue, TomlAtomicValueType } from '../src/parser';
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

function bombadilToTomlTest(input) {
    if (input instanceof TomlAtomicValue) {
        return bombadilToTomlTestAtomicValue(input);
    } else if (input instanceof Array) {
        return { type: 'array', value: input.map(bombadilToTomlTest) };
    } else {
        let newObj = {}
        for (let property in input) {
            newObj[property] = bombadilToTomlTest(input[property]);
        }
        return newObj;
    }
}


function compare(toml: string) {
    let input = readSample(toml + '.toml');
    let baseline = JSON.parse(readSample(toml + '.json'));
    let reader = new TomlReader();
    reader.readToml(input, true);
    let val = bombadilToTomlTest(reader.result);
    expect(val).toEqual(baseline);
}

const tests = [
    'array-empty', 'long-integer',
    'array-nospaces', 'multiline-string',
    'arrays-hetergeneous', 'raw-multiline-string',
    'arrays-nested', 'raw-string',
    'arrays', 'string-empty',
    'bool', 'string-escapes',
    'comments-everywhere', 'string-simple',
    'datetime', 'string-with-pound',
    'empty', 'table-array-implicit',
    'example', 'table-array-many',
    'float', 'table-array-nest',
    'implicit-and-explicit-after', 'table-array-one',
    'implicit-and-explicit-before', 'table-empty',
    'implicit-groups', 'table-sub-empty',
    'integer', 'table-whitespace',
    'key-equals-nospace', 'table-with-pound',
    'key-space', 'unicode-escape',
    'key-special-chars', 'unicode-literal',
    'long-float',
];

tests.forEach((name) => {
    test('Running toml-test for ' + name, () => {
        compare(name);
    })
})
