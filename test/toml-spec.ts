import { readFileSync } from 'fs';
import * as path from 'path';
import { TomlReader } from '../src/bombadil';
import { safeLoad } from 'js-yaml';

function readSample(name: string): string {
    return readFileSync(path.join(__dirname, 'toml-spec-samples', name)).toString();
}

function compare(toml: string) {
    let input = readSample(toml + '.toml');
    let baseline = safeLoad(readSample(toml + '.yaml'));
    let reader = new TomlReader();
    reader.readToml(input);
    expect(reader.result).toEqual(baseline);
}

test('Example TOML', () => {
    compare('example');
});

test('Fruit TOML', () => {
    compare('fruit');
});

test('Hard Example TOML', () => {
    compare('hard_example');
});

test('Hard Example TOML', () => {
    let input = readSample('hard_example_unicode.toml');
    let reader = new TomlReader();
    reader.readToml(input);
    expect(reader.result).toMatchSnapshot();
});