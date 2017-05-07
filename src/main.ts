import toml = require('./bombadil')

import fs = require('fs')

var input = fs.readFileSync('example.toml','utf8');

var reader = new toml.TomlReader();
reader.readToml(input, true);

function bombadilToTomlTest(input){
    if (input instanceof toml.TomlAtomicValue){
        return input.value;
    } else if (input instanceof Array){
        return input.map(bombadilToTomlTest);
    } else {
        let newObj = {}
        for(let property in input){
            newObj[property] = bombadilToTomlTest(input[property]);
        }
        return newObj;
    }
}

console.log(JSON.stringify(bombadilToTomlTest(reader.result), null, 2));
//console.log(JSON.stringify(reader.result, null, 2))