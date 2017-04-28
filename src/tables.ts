import * as l from './lexer';
import * as p from './parser';
import ct = require('chevrotain')
import includes = require('lodash.includes')
import last = require('lodash.last')

type TomlValue = (
p.TomlOffsetDateTime |
p.TomlLocalDateTime |
p.TomlLocalDate |
p.TomlLocalTime |
string |
number |
p.TomlInlineTable |
p.TomlArray);

export interface ITomlException {
    message:string,
    token:ct.ISimpleTokenOrIToken
}

export type TomlError = ct.ILexingError | ct.exceptions.IRecognitionException | ITomlException;

export class TomlReader {
    result: any;
    errors: TomlError[];

    public readToml(input:string){
        input = input + "\n";
        this.errors = [];
        let lexer_result = l.tomlLexer.tokenize(input);
        if (lexer_result.errors.length > 0){
            this.errors = lexer_result.errors;
            this.result = undefined;
            return;
        }
        let parser = new p.TomlParser(lexer_result.tokens, l.allTokens);
        let entries = parser.documentRule();
        if (parser.errors.length > 0){
            this.errors = parser.errors;
            this.result = undefined;
            return;
        }
        this.result = load_toml_document(entries, this.errors);
    }
}


/** return an object represeting the TOML document, based on entries returned by the parser 
* which are of one of three types : TomlKeyValue, TomlTableHeader and TomlTableArrayEntryHader
* 
* @param entries the result of a Toml Parser Document Rule
* @param toml_exceptions an array that will be filled with toml exceptions, if they occur
* @return an javascript object representing the toml document
*/

function load_toml_document(entries: p.TopLevelTomlDocumentEntry[], toml_exceptions: TomlError[]) {
    let root = {};
    // keeps the tables that have been directly defined
    let directly_initialized_tables = [];
    // keep the table arrays defined using [[ ]]
    let headers_initialized_table_arrays = [];
    let current = root;
    for (let entry of entries) {
        if (entry instanceof p.TomlKeyValue) {
            processKeyValue(entry, current, directly_initialized_tables, toml_exceptions, entry.token);
        } else if (entry instanceof p.TomlTableHeader){
            current = init_table(root, entry.headers, directly_initialized_tables, headers_initialized_table_arrays, false, toml_exceptions, entry.token);
        } else if (entry instanceof p.TomlTableArrayEntryHeader){
            current = init_table(root, entry.headers, directly_initialized_tables, headers_initialized_table_arrays, true, toml_exceptions, entry.token);
        }
    }
    return root;
}

function isTable(obj) : boolean {
    return (obj != null) && (typeof obj === 'object') && !(obj instanceof Array)
}

function isTableArray(obj) : boolean {
    return (obj != null) && (obj instanceof Array) && isTable(obj[0]);
}

function isTableOrTableArray(obj) : boolean {
    return isTable(obj) || isTableArray(obj);
}

/**
* Create a hierarchy of tables and returns the last one, given a list of names
* @param parent the table to which the new table hierarchy will be attached
* @param names the names of the tables
*/
function init_table(parent, names, directly_initialized_tables, headers_initialized_table_arrays, isArray, toml_exceptions: TomlError[], parser_token: ct.ISimpleTokenOrIToken) : object{
    let context = parent[names[0]];
    if ((context != undefined) && !isTableOrTableArray(context)) {
        toml_exceptions.push({message: "Path already contains a value", token: parser_token});
    } else{
        if(names.length === 1){ // we are at the table being directly initialized
            if (includes(directly_initialized_tables, context)) {
                toml_exceptions.push({message: "Path has already been initialized to a table", token: parser_token});
            } else {
                if(isTable(context)){ // value is a table, indirectly initialized
                    directly_initialized_tables.push(context);
                    return context;
                } else if (isTableArray(context)){ // value is a table array
                    if (!includes(headers_initialized_table_arrays, context)) {
                        toml_exceptions.push({message: 'An static inline table has already been initialized for path.', token: parser_token});
                    } else {
                        let table = {};
                        context.push(table);
                        directly_initialized_tables.push(table);
                        return table;
                    }
                } 
                else if (context === undefined) {
                    context = {};
                    if (isArray){
                        let table_array = [context];
                        headers_initialized_table_arrays.push(table_array);
                        parent[names[0]] = table_array;
                    } else {
                        parent[names[0]] = context;
                    }
                    directly_initialized_tables.push(context);
                    return context;
                } else {
                    throw 'unknown type!';
                }
            }
        } else {
            if(isTable(context)){ // value is an existing table
                return init_table(context, names.slice(1), directly_initialized_tables,headers_initialized_table_arrays, isArray, toml_exceptions, parser_token);
            } else if (isTableArray(context)) {
                return init_table(last(context), names.slice(1), directly_initialized_tables, headers_initialized_table_arrays, isArray, toml_exceptions, parser_token);
            }
            else if (context === undefined) { // init a table indirectly
                context = {};
                parent[names[0]] = context;
                return init_table(context, names.slice(1),directly_initialized_tables, headers_initialized_table_arrays,isArray, toml_exceptions, parser_token);
            } else {
                throw 'unknown type!';
            }
        }
    }
}

/**
* @param kv the key-value pair
* @param current the current context
*/
function processKeyValue(kv: p.TomlKeyValue, current: object, directly_initialized_tables: any[], toml_exceptions, parser_token: ct.ISimpleTokenOrIToken) {
    let value = tomlValueToObject(kv.value);
    if (current[kv.key] != undefined) {
        // can we statically define a table that has been implicitely defined?
        toml_exceptions.push({message: "Path has already been initialized to some value", token: parser_token});
    } else {
    current[kv.key] = value;
    if(isTable(value)){
        directly_initialized_tables.push(value);
    }    
    }
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