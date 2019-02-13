import { readFileSync } from 'fs';
import * as path from 'path';
import { TomlReader, TomlError } from '../src/bombadil';
import * as ast from '../src/AST';
import { safeLoad } from 'js-yaml';

function readSample(name: string): string {
    return readFileSync(path.join(__dirname, 'toml-test-samples', name)).toString();
}

function bombadilToTomlTestAtomicValue(input: ast.TomlAtomicValue) {
    switch (input.type) {
        case ast.atomicInteger: {
            return { type: 'integer', value: input.image };
        }
        case ast.atomicFloat: {
            return { type: 'float', value: input.value.toString() };
        }
        case ast.atomicBoolean: {
            return { type: 'bool', value: input.image.toString() };
        }
        case ast.atomicString: {
            return { type: 'string', value: input.value };
        }
        case ast.localDateTime: {
            return { type: 'datetime', value: input.image };
        }
        case ast.offsetDateTime: {
            return { type: 'datetime', value: input.image };
        }
        case ast.localDate: {
            return { type: 'datetime', value: input.image };
        }
        case ast.localTime: {
            return { type: 'datetime', value: input.image };
        }

        default: {
            throw 'eh!?';
        }
    }
}

function bombadilToTomlTest(input, property: boolean) {
    if (input['type']) {
        if (input['type'] == ast.arrayType) {
            let vals = input.contents.map((x) => bombadilToTomlTest(x, false));
            return { type: 'array', value: vals };
        }
        return bombadilToTomlTestAtomicValue(input);
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
