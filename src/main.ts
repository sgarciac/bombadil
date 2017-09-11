import toml = require('./bombadil')
import ast = require('./AST');

import fs = require('fs')

var input = fs.readFileSync('/dev/stdin', 'utf8');

var reader = new toml.TomlReader();
reader.readToml(input, true);

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

function bombadilToTomlTest(input: any): any {
    if (input.hasOwnProperty('type')) {
        return bombadilToTomlTestAtomicValue(input);
    } else if (input instanceof Array) {
        return { type: 'array', value: input.map(bombadilToTomlTest) };
    } else {
        let newObj: { [key: string]: any } = {}
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
