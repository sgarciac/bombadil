import * as p from './parser';
import * as _ from 'lodash';

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
* 
* @param entries the result of a Toml Parser Document Rule
* @return an javascript object representing the toml document
*/
export function load_toml(entries: p.TopLevelTomlDocumentEntry[]) {
    let root = {};
    let directly_initialized_tables = [];
    let current = root;
    for (let entry of entries) {
        if (entry instanceof p.TomlKeyValue) {
            processKeyValue(entry, current);
        } else if (entry instanceof p.TomlTableHeader){
            current = init_table(root, entry.headers, directly_initialized_tables, false);
        } else if (entry instanceof p.TomlTableArrayEntryHeader){
            current = init_table(root, entry.headers, directly_initialized_tables, true);
        }
    }
    return root;
}

export function isTable(obj) : boolean {
    return (obj != null) && (typeof obj === 'object') && !(obj instanceof Array)
}

export function isTableArray(obj) : boolean {
    return (obj != null) && (obj instanceof Array) && isTable(obj[0]);
}

export function isTableOrTableArray(obj) : boolean {
    return isTable(obj) || isTableArray(obj);
}

/**
* Create a hierarchy of tables and returns the last one, given a list of names
* @param parent the table to which the new table hierarchy will be attached
* @param names the names of the tables
*/
function init_table(parent, names, directly_initialized, isArray) : object{
    let context = parent[names[0]];
    if ((context != undefined) && !isTableOrTableArray(context)) {
        throw "Path is already initialized to a non table/table array.";
    } else{
        if(names.length === 1){ // we are at the table being directly initialized
            if (_.includes(directly_initialized, context)) {
                throw "path is already initialized to a table :"+JSON.stringify(names);
            } else {
                if(isTable(context)){ // value is a table, indirectly initialized
                    directly_initialized.push(context);
                    return context;
                } else if (isTableArray(context)){ // value is a table array
                    let table = {};
                    context.push(table);
                    directly_initialized.push(table);
                    return table;
                } 
                else if (context === undefined) {
                    context = {};
                    if (isArray){
                        let table_array = [context];
                        parent[names[0]] = table_array;
                    } else {
                        parent[names[0]] = context;
                    }
                    directly_initialized.push(context);
                    return context;
                } else {
                    throw "unknown type!";
                }
            }
        } else {
            if(isTable(context)){ // value is an existing table
                return init_table(context, names.slice(1), directly_initialized, isArray);
            } else if (isTableArray(context)) {
                return init_table(_.last(context), names.slice(1), directly_initialized, isArray);
            }
            else if (context === undefined) { // init a table indirectly
                context = {};
                parent[names[0]] = context;
                return init_table(context, names.slice(1),directly_initialized, isArray);
            } else {
                throw "unknown type!";
            }
        }
    }
}

/**
* @param kv the key-value pair
* @param current the current context
*/
function processKeyValue(kv: p.TomlKeyValue, current: object) {
    current[kv.key] = tomlValueToObject(kv.value);
}

/**
* Returns a toml value transformed to a simple JSON object (a string, a number, an array or an object)
* @param value the toml value
*/
function tomlValueToObject(value: TomlValue){
    if(typeof value === 'string') {
        return value;
    }
    if(typeof value === 'number') {
        return value;
    }
    if(value instanceof p.TomlOffsetDateTime){
        return value;
    }
    if(value instanceof p.TomlArray){
        return value.contents.map(tomlValueToObject);
    }
    if(value instanceof p.TomlInlineTable){
        let newObject = {};
        for(let kv of value.bindings){
            newObject[kv.key] = tomlValueToObject(kv.value);
        }
        return newObject;
    }
}