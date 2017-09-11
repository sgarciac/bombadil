import * as l from './lexer';
import * as p from './parser';
import ast = require('./AST');
import ct = require('chevrotain')
import includes = require('lodash.includes')
import last = require('lodash.last')
import every = require('lodash.every')

export interface ITomlException {
    message: string,
    token: ct.IToken
}

export type TomlError = ct.ILexingError | ct.exceptions.IRecognitionException | ITomlException;

export class TomlReader {
    result: any;
    entries: ast.TopLevelTomlDocumentEntry[];
    errors: TomlError[];

    /**
     * Read a TOML document
     * 
     * @param input the TOML document string
     * @param full_value wheter the full typing information will be returned or not
     */
    public readToml(input: string, full_value: boolean = false) {
        this.errors = [];
        let lexer_result = l.tomlLexer.tokenize(input);
        if (lexer_result.errors.length > 0) {
            this.errors = lexer_result.errors;
            this.result = undefined;
            return;
        }
        let parser = new p.TomlParser(lexer_result.tokens, l.allTokens);
        this.entries = parser.documentRule();
        if (parser.errors.length > 0) {
            this.errors = parser.errors;
            this.result = undefined;
            return;
        }
        this.result = load_toml_document(this.entries, this.errors, full_value);
    }
}

/**
 * return an object represeting the TOML document, based on entries returned by the parser 
 * which are of one of three types : TomlKeyValue, TomlTableHeader and TomlTableArrayEntryHader
 * 
 * @param entries the result of a Toml Parser Document Rule
 * @param toml_exceptions an array that will be filled with toml exceptions, if they occur
 * @param full_value whether to return full meta-data for atomic values or not
 * @return an javascript object representing the toml document
 */

function load_toml_document(entries: ast.TopLevelTomlDocumentEntry[], toml_exceptions: TomlError[], full_value: boolean) {
    let root = {};
    // keeps the tables that have been directly defined
    let directly_initialized_tables = [];
    // keep the table arrays defined using [[ ]]
    let headers_initialized_table_arrays = [];
    let current = root;
    for (let entry of entries) {
        if (entry.type == ast.keyValue) {
            if (!processKeyValue(entry, current, directly_initialized_tables, toml_exceptions, entry.token, full_value)) {
                return null;
            }
        } else if (entry.type == ast.tableHeader) {
            current = init_table(root, entry.headers, directly_initialized_tables, headers_initialized_table_arrays, false, toml_exceptions, entry.token);
            if (!current) {
                return null;
            }
        } else if (entry.type == ast.tableArrayEntryHeader) {
            current = init_table(root, entry.headers, directly_initialized_tables, headers_initialized_table_arrays, true, toml_exceptions, entry.token);
            if (!current) {
                return null;
            }
        }
    }
    return root;
}

/**
 * Returns whether the input is a table or not
 */
function isTable(obj): boolean {
    return (obj != null) && (typeof obj === 'object') && !(obj instanceof Array)
}

/**
 * Returns whether the input is an array or tables or not
 */
function isTableArray(obj): boolean {
    return (obj != null) && (obj instanceof Array) && isTable(obj[0]);
}

/**
 * Returns whether the input is a table or an array or tables or not
 */
function isTableOrTableArray(obj): boolean {
    return isTable(obj) || isTableArray(obj);
}

/**
 * Create a hierarchy of tables and returns the last one, given a list of names
 *
 * @param parent the table to which the new table hierarchy will be attached
 * @param names the names of the tables
 */
function init_table(parent, names, directly_initialized_tables, headers_initialized_table_arrays, isArray, toml_exceptions: TomlError[], parser_token: ct.IToken): object {
    let context = parent[names[0]];
    if ((context != undefined) && !isTableOrTableArray(context)) {
        toml_exceptions.push({ message: 'Path already contains a value', token: parser_token });
        return null;
    } else {
        if (names.length === 1) { // we are at the table being directly initialized
            if (includes(directly_initialized_tables, context)) {
                toml_exceptions.push({ message: 'Path has already been initialized to a table', token: parser_token });
                return null;
            } else {
                if (isTable(context)) { // value is a table, indirectly initialized
                    if (isArray) {
                        toml_exceptions.push({ message: 'Path has already been initialized to a table, not an array table', token: parser_token });
                        return null;
                    }
                    directly_initialized_tables.push(context);
                    return context;
                } else if (isTableArray(context)) { // value is a table array
                    if (!isArray) {
                        toml_exceptions.push({ message: 'Path has already been initialized to a table array, not a table', token: parser_token });
                        return null;
                    }
                    if (!includes(headers_initialized_table_arrays, context)) {
                        toml_exceptions.push({ message: 'An static inline table has already been initialized for path.', token: parser_token });
                        return null;
                    } else {
                        let table = {};
                        context.push(table);
                        directly_initialized_tables.push(table);
                        return table;
                    }
                }
                else if (context === undefined) {
                    context = {};
                    if (isArray) {
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
            if (isTable(context)) { // value is an existing table
                return init_table(context, names.slice(1), directly_initialized_tables, headers_initialized_table_arrays, isArray, toml_exceptions, parser_token);
            } else if (isTableArray(context)) {
                return init_table(last(context), names.slice(1), directly_initialized_tables, headers_initialized_table_arrays, isArray, toml_exceptions, parser_token);
            }
            else if (context === undefined) { // init a table indirectly
                context = {};
                parent[names[0]] = context;
                return init_table(context, names.slice(1), directly_initialized_tables, headers_initialized_table_arrays, isArray, toml_exceptions, parser_token);
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
function processKeyValue(kv: ast.TomlKeyValue, current: object, directly_initialized_tables: any[], toml_exceptions, parser_token: ct.IToken, full_value) {
    let value = tomlValueToObject(kv.value, full_value, toml_exceptions);
    if (current[kv.key] != undefined) {
        // can we statically define a table that has been implicitely defined?
        toml_exceptions.push({ message: 'Path has already been initialized to some value', token: parser_token });
        return null;
    } else {
        current[kv.key] = value;
        if (isTable(value)) {
            directly_initialized_tables.push(value);
        }
        return value;
    }
}

function everySameType(array: ast.TomlArray) {
    if (array.contents.length === 0) {
        return true
    } else {
        let first = array.contents[0]
        return every(array.contents, item => item.type == first.type)
    }
}


/**
 * Returns a toml value transformed to a simple JSON object (a string, a number, an array or an object)
 * @param value the toml value
 */
function tomlValueToObject(value: ast.TomlValue, full_value: boolean, toml_exceptions) {
    switch (value.type) {
        case ast.offsetDateTime:
            return full_value ? value : value.value;
        case ast.localDateTime:
            return full_value ? value : value.value;
        case ast.localDate:
            return full_value ? value : value.value;
        case ast.localTime:
            return full_value ? value : value.value;
        case ast.atomicString:
            return full_value ? value : value.value;
        case ast.atomicInteger:
            return full_value ? value : value.value;
        case ast.atomicFloat:
            return full_value ? value : value.value;
        case ast.atomicBoolean:
            return full_value ? value : value.value;
        case ast.arrayType:
            if (!everySameType(value)) {
                toml_exceptions.push({ message: 'Elements in array are not of the same type', token: value.token });
                return null;
            }
            let v = value.contents.map(item => tomlValueToObject(item, full_value, toml_exceptions));
            return full_value ? value : v;
        case ast.inlineTable:
            let newObject = {};
            for (let kv of value.bindings) {
                let v = tomlValueToObject(kv.value, full_value, toml_exceptions);
                newObject[kv.key] = v;
            }
            return newObject;
        default:
            let foo: never = value; // Checks for exhaustion in above cases
            console.error('Unhandled value: ', JSON.stringify(value));
            return null;
    }
}
