import * as l from "./lexer";
import * as p from "./parser";
import ast = require("./AST");
import ct = require("chevrotain");
import includes = require("lodash.includes");
import last = require("lodash.last");
import every = require("lodash.every");

export interface ITomlException {
  message: string;
  token: ct.IToken;
}

export type TomlError =
  | ct.ILexingError
  | ct.IRecognitionException
  | ITomlException;

export type Dictionary = { [key: string]: any };

export class TomlReader {
  public result: any;
  public entries: ast.TopLevelTomlDocumentEntry[];
  public errors: TomlError[];

  /**
   * Read a TOML document
   *
   * @param input the TOML document string
   * @param fullValue wheter the full typing information will be returned or not
   */
  public readToml(input: string, fullValue: boolean = false) {
    this.errors = [];
    const lexerResult = l.tomlLexer.tokenize(input);
    if (lexerResult.errors.length > 0) {
      this.errors = lexerResult.errors;
      this.result = undefined;
      return;
    }
    try {
      const parser = new p.TomlParser(l.tomlLexerModes);
      parser.input = lexerResult.tokens;
      this.entries = parser.documentRule();
      if (parser.errors.length > 0) {
        this.errors = parser.errors;
        this.result = undefined;
        return;
      }
      this.result = load_toml_document(this.entries, this.errors, fullValue);
    } catch (error) {
      this.errors = [error];
      this.result = undefined;
    }
  }
}

/**
 * return an object represeting the TOML document, based on entries returned by the parser
 * which are of one of three types : TomlKeysValue, TomlTableHeader and TomlTableArrayEntryHader
 *
 * @param entries the result of a Toml Parser Document Rule
 * @param tomlExceptions an array that will be filled with toml exceptions, if they occur
 * @param fullValue whether to return full meta-data for atomic values or not
 * @return an javascript object representing the toml document
 */

function load_toml_document(
  entries: ast.TopLevelTomlDocumentEntry[],
  tomlExceptions: TomlError[],
  fullValue: boolean
) {
  const root = createEmptyTable();
  // keeps the tables that have been directly defined
  const directlyInitializedTables: Dictionary[] = [];
  // keep the table arrays defined using [[ ]]
  const headersInitializedTableArrays: Dictionary[] = [];
  let current = root;
  for (const entry of entries) {
    if (entry.type === ast.keysValue) {
      if (
        processKeysValue(
          entry,
          current,
          directlyInitializedTables,
          headersInitializedTableArrays,
          tomlExceptions,
          entry.token,
          fullValue
        ) == null
      ) {
        return null;
      }
    } else if (entry.type === ast.tableHeader) {
      current = init_table(
        root,
        entry.headers,
        directlyInitializedTables,
        headersInitializedTableArrays,
        false,
        tomlExceptions,
        entry.token,
        true
      );
      if (current == null) {
        return null;
      }
    } else if (entry.type === ast.tableArrayEntryHeader) {
      current = init_table(
        root,
        entry.headers,
        directlyInitializedTables,
        headersInitializedTableArrays,
        true,
        tomlExceptions,
        entry.token,
        true
      );
      if (current == null) {
        return null;
      }
    }
  }
  return root;
}

/**
 * Returns whether the input is a table or not
 */
function isTable(obj: {}): boolean {
  return obj != null && typeof obj === "object" && !(obj instanceof Array);
}

/**
 * Returns whether the input is an array or tables or not
 */
function isTableArray(obj: {}): boolean {
  return obj != null && obj instanceof Array && isTable(obj[0]);
}

/**
 * Returns whether the input is a table or an array or tables or not
 */
function isTableOrTableArray(obj: {}): boolean {
  return isTable(obj) || isTableArray(obj);
}

/**
 * Create a hierarchy of tables and returns the last one, given a list of names
 *
 * @param parent the table to which the new table hierarchy will be attached
 * @param names the path of the table from parent
 * @param directly_initialized_tables the list of tables that have already been directly initialized
 * @param headers_initialized_table_arrays list of initialized table arrays ([[..]]) it serves to distinguishdem from arrays of tables ([{...},{...}]) and should not be mixed
 * @param isArray whether the initialized table is part of a table array ([[..]])
 * @param toml_exceptions errors
 * @param parser_token the token of the table
 * @param directly_initialized whether the table we are initializing is being directly initialized (which is not the case for dotted keywords)
 */
function init_table(
  parent: Dictionary,
  names: string[],
  directly_initialized_tables: Array<Dictionary>,
  headers_initialized_table_arrays: Array<Dictionary>,
  isArray: boolean,
  toml_exceptions: TomlError[],
  parser_token: ct.IToken,
  directly_initialized: boolean
): object {
  let context = parent[names[0]];
  if (context != undefined && !isTableOrTableArray(context)) {
    toml_exceptions.push({
      message: "Path already contains a value",
      token: parser_token
    });
    return null;
  } else {
    if (names.length === 1) {
      // we are at the table being directly initialized
      if (includes(directly_initialized_tables, context)) {
        toml_exceptions.push({
          message: "Path has already been initialized to a table",
          token: parser_token
        });
        return null;
      } else {
        if (isTable(context)) {
          // value is a table, indirectly initialized
          if (isArray) {
            toml_exceptions.push({
              message:
                "Path has already been initialized to a table, not an array table",
              token: parser_token
            });
            return null;
          }
          if (directly_initialized) {
            directly_initialized_tables.push(context);
          }
          return context;
        } else if (isTableArray(context)) {
          // value is a table array
          if (!isArray) {
            toml_exceptions.push({
              message:
                "Path has already been initialized to a table array, not a table",
              token: parser_token
            });
            return null;
          }
          if (!includes(headers_initialized_table_arrays, context)) {
            toml_exceptions.push({
              message:
                "An static table array has already been initialized for path.",
              token: parser_token
            });
            return null;
          } else {
            let table = createEmptyTable();
            context.push(table);
            // table arrays are always directly initialized
            directly_initialized_tables.push(table);
            return table;
          }
        } else if (context === undefined) {
          context = createEmptyTable();
          if (isArray) {
            let table_array = [context];
            headers_initialized_table_arrays.push(table_array);
            parent[names[0]] = table_array;
          } else {
            parent[names[0]] = context;
          }
          if (directly_initialized) {
            directly_initialized_tables.push(context);
          }
          return context;
        } else {
          throw "unknown type!";
        }
      }
    } else {
      if (isTable(context)) {
        // value is an existing table
        return init_table(
          context,
          names.slice(1),
          directly_initialized_tables,
          headers_initialized_table_arrays,
          isArray,
          toml_exceptions,
          parser_token,
          directly_initialized
        );
      } else if (isTableArray(context)) {
        return init_table(
          last(context),
          names.slice(1),
          directly_initialized_tables,
          headers_initialized_table_arrays,
          isArray,
          toml_exceptions,
          parser_token,
          directly_initialized
        );
      } else if (context === undefined) {
        // init a table indirectly
        context = createEmptyTable();
        parent[names[0]] = context;
        return init_table(
          context,
          names.slice(1),
          directly_initialized_tables,
          headers_initialized_table_arrays,
          isArray,
          toml_exceptions,
          parser_token,
          directly_initialized
        );
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
function processKeysValue(
  kv: ast.TomlKeysValue,
  current: { [key: string]: any },
  directly_initialized_tables: any[],
  headers_initialized_table_arrays: Array<Dictionary>,
  toml_exceptions: TomlError[],
  parser_token: ct.IToken,
  full_value: boolean
) {
  let value = tomlValueToObject(
    kv.value,
    full_value,
    directly_initialized_tables,
    headers_initialized_table_arrays,
    toml_exceptions,
    parser_token
  );
  let lastKey = kv.keys[kv.keys.length - 1];

  // create implicit tables, in dotted keys
  if (kv.keys.length > 1) {
    current = init_table(
      current,
      kv.keys.slice(0, -1),
      directly_initialized_tables,
      headers_initialized_table_arrays,
      false,
      toml_exceptions,
      parser_token,
      false
    );
  }

  if (current[lastKey] != undefined) {
    // can we statically define a table that has been implicitely defined?
    toml_exceptions.push({
      message: "Path has already been initialized to some value",
      token: parser_token
    });
    return null;
  } else {
    current[lastKey] = value;
    if (isTable(value)) {
      directly_initialized_tables.push(value);
    }
    return value;
  }
}

function everySameType(array: ast.TomlArray) {
  if (array.contents.length === 0) {
    return true;
  } else {
    let first = array.contents[0];
    return every(array.contents, item => item.type == first.type);
  }
}

/**
 * Returns a toml value transformed to a simple JSON object (a string, a number, an array or an object)
 * @param value the toml value
 *
 * NB - If there were distinct versions of this function (one for full value, one not), we'd get a much
 * more precise picture of the types for the case of full_value==true.
 */
function tomlValueToObject(
  value: ast.TomlValue,
  fullValue: boolean,
  directlyInitializedTable: any[],
  headersInitializedTableArrays: Dictionary[],
  tomlExceptions: TomlError[],
  parserToken: ct.IToken
): any {
  switch (value.type) {
    case ast.offsetDateTime:
      return fullValue ? value : value.value;
    case ast.localDateTime:
      return fullValue ? value : value.value;
    case ast.localDate:
      return fullValue ? value : value.value;
    case ast.localTime:
      return fullValue ? value : value.value;
    case ast.atomicString:
      return fullValue ? value : value.value;
    case ast.atomicInteger:
      return fullValue ? value : value.value;
    case ast.atomicFloat:
      return fullValue ? value : value.value;
    case ast.atomicNotANumber:
      return fullValue ? value : value.value;
    case ast.atomicInfinity:
      return fullValue ? value : value.value;
    case ast.atomicBoolean:
      return fullValue ? value : value.value;
    case ast.arrayType:
      if (!everySameType(value)) {
        tomlExceptions.push({
          message: "Elements in array are not of the same type",
          token: value.token
        });
        return null;
      }
      const v = value.contents.map(item =>
        tomlValueToObject(
          item,
          fullValue,
          directlyInitializedTable,
          headersInitializedTableArrays,
          tomlExceptions,
          parserToken
        )
      );
      return v;
    case ast.inlineTable:
      const newObject: { [key: string]: any } = createEmptyTable();
      for (let kv of value.bindings) {
        processKeysValue(
          kv,
          newObject,
          directlyInitializedTable,
          headersInitializedTableArrays,
          tomlExceptions,
          parserToken,
          fullValue
        );
      }
      return newObject;
    default:
      const foo: never = value; // Checks for exhaustion in above cases
      console.error("Unhandled value: ", JSON.stringify(value));
      return null;
  }
}

function createEmptyTable(): any {
  return Object.create(null);
}
