import * as p from './parser';

type TomlValue = (
    p.TomlOffsetDateTime |
    p.TomlLocalDateTime |
    p.TomlLocalDate |
    p.TomlLocalTime |
    string |
    number |
    p.TomlInlineTable |
    p.TomlArray);

/** return an object represeting the TOML document, based on entries returned by the parser 
 * which are of one of three types : TomlKeyValue, TomlTableHeader and TomlTableArrayEntryHader
 */
export function load_toml(entries: p.TopLevelTomlDocumentEntry[]) {
    let root = {};
    let current = root;
    for (let entry of entries) {
        if (entry instanceof p.TomlKeyValue) {
            processKeyValue(entry, current);
            root[entry.key] = entry.value;
        }
    }
    return root;
}


function processKeyValue(kv: p.TomlKeyValue, current: object) {
    current[kv.key] = tomlValueToObject(kv.value);
}

function tomlValueToObject(value: TomlValue){
    
}