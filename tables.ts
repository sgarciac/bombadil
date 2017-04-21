import * as toml_parser from './parser';

/** return an object represeting the TOML document, based on entries returned by the parser 
 * which are of one of three types : TomlKeyValue, TomlTableHeader and TomlTableArrayEntryHader
 */
export function load_toml(tokens) {
    let root = {};
    let current = root;
    
}