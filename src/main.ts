import toml = require('./bombadil')
import ast = require('./AST');

import fs = require('fs')

var input = fs.readFileSync('/dev/stdin', 'utf8');

var reader = new toml.TomlReader();
reader.readToml(input, true);

function bombadilToTomlTestAtomicValue(input: ast.TomlAtomicValue) {
    switch (input.type) {
        case 'atomicInteger': {
            return { type: 'integer', value: input.image };
        }
        case 'atomicFloat': {
            return { type: 'float', value: input.value.toString() };
        }
        case 'atomicBoolean': {
            return { type: 'bool', value: input.image.toString() };
        }
        case 'atomicString': {
            return { type: 'string', value: input.value };
        }
        case 'localDateTime': {
            return { type: 'datetime', value: input.image };
        }
        case 'offsetDateTime': {
            return { type: 'datetime', value: input.image };
        }
        case 'localDate': {
            return { type: 'datetime', value: input.image };
        }
        case 'localTime': {
            return { type: 'datetime', value: input.image };
        }

        default: {
            throw 'eh!?';
        }
    }
}

function bombadilToTomlTest(input) {
    if (input.hasOwnProperty('type')) {
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

if (reader.errors.length > 0) {
    process.exit(1);
}
console.log(JSON.stringify(bombadilToTomlTest(reader.result), null, 2));
process.exit(0);
