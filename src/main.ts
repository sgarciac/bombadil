import toml = require('./bombadil')

import fs = require('fs')

var input = fs.readFileSync('/dev/stdin', 'utf8');

var reader = new toml.TomlReader();
reader.readToml(input, true);

function bombadilToTomlTestAtomicValue(input: toml.TomlAtomicValue) {
    switch (input.type) {
        case toml.TomlAtomicValueType.Integer: {
            return { type: 'integer', value: input.value };
        }
        case toml.TomlAtomicValueType.Float: {
            return { type: 'float', value: input.value };
        }
        case toml.TomlAtomicValueType.Boolean: {
            return { type: 'bool', value: input.image };
        }
        case toml.TomlAtomicValueType.String: {
            return { type: 'string', value: input.value };
        }
        case toml.TomlAtomicValueType.LocalDateTime: {
            return { type: 'datetime', value: input.image };
        }
        case toml.TomlAtomicValueType.OffsetDateTime: {
            return { type: 'datetime', value: input.image };
        }
        case toml.TomlAtomicValueType.LocalDate: {
            return { type: 'datetime', value: input.image };
        }
        case toml.TomlAtomicValueType.LocalTime: {
            return { type: 'datetime', value: input.image };
        }

        default: {
            throw "eh!?";
        }
    }
}

function bombadilToTomlTest(input) {
    if (input instanceof toml.TomlAtomicValue) {
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
