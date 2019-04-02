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

export const table: "table" = "table";
export interface TomlTable {
  type: typeof table;
  content: { [key: string]: any };
}
export function tomlTable(content: object): TomlTable {
  return { type: table, content };
}

export type TomlError =
  | ct.ILexingError
  | ct.IRecognitionException
  | ITomlException;

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
      const fullResult = load_toml_document(this.entries, this.errors);
      this.result = fullValue ? fullResult : fullResultToObject(fullResult);
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
  tomlExceptions: TomlError[]
): TomlTable {
  const root = createEmptyTable();
  // keeps the tables that have been directly defined
  const directlyInitializedTables: TomlTable[] = [];
  // keep the table arrays defined using [[ ]]
  const headersInitializedTableArrays: TomlTable[][] = [];
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
          entry.token
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
function isTable(obj: any): obj is TomlTable {
  return obj != null && obj.type === table;
}

/**
 * Returns whether the input is an array or tables or not
 */
function isTableArray(obj: any): obj is TomlTable[] {
  return obj != null && obj instanceof Array && isTable(obj[0]);
}

/**
 * Returns whether the input is a table or an array or tables or not
 */
function isTableOrTableArray(obj: {}): obj is TomlTable[] | TomlTable {
  return isTable(obj) || isTableArray(obj);
}

/**
 * Create a hierarchy of tables and returns the last one, given a list of names
 *
 * @param parent the table to which the new table hierarchy will be attached
 * @param names the path of the table from parent
 * @param directlyInitializedTables the list of tables that have already been directly initialized
 * @param headersInitializedTableArrays list of initialized table arrays ([[..]]) it serves to distinguishdem from arrays of tables ([{...},{...}]) and should not be mixed
 * @param isArray whether the initialized table is part of a table array ([[..]])
 * @param tomlExceptions errors
 * @param parserToken the token of the table
 * @param directlyInitialized whether the table we are initializing is being directly initialized (which is not the case for dotted keywords)
 */
function init_table(
  parent: TomlTable,
  names: string[],
  directlyInitializedTables: TomlTable[],
  headersInitializedTableArrays: TomlTable[][],
  isArray: boolean,
  tomlExceptions: TomlError[],
  parserToken: ct.IToken,
  directlyInitialized: boolean
): TomlTable {
  let context = parent.content[names[0]];
  if (context !== undefined && !isTableOrTableArray(context)) {
    tomlExceptions.push({
      message: "Path already contains a value",
      token: parserToken
    });
    return null;
  } else {
    if (names.length === 1) {
      // we are at the table being directly initialized
      if (includes(directlyInitializedTables, context)) {
        tomlExceptions.push({
          message: "Path has already been initialized to a table",
          token: parserToken
        });
        return null;
      } else {
        if (isTable(context)) {
          // value is a table, indirectly initialized
          if (isArray) {
            tomlExceptions.push({
              message:
                "Path has already been initialized to a table, not an array table",
              token: parserToken
            });
            return null;
          }
          if (directlyInitialized) {
            directlyInitializedTables.push(context);
          }
          return context;
        } else if (isTableArray(context)) {
          // value is a table array
          if (!isArray) {
            tomlExceptions.push({
              message:
                "Path has already been initialized to a table array, not a table",
              token: parserToken
            });
            return null;
          }
          if (!includes(headersInitializedTableArrays, context)) {
            tomlExceptions.push({
              message:
                "An static table array has already been initialized for path.",
              token: parserToken
            });
            return null;
          } else {
            const newTable = createEmptyTable();
            context.push(newTable);
            // table arrays are always directly initialized
            directlyInitializedTables.push(newTable);
            return newTable;
          }
        } else if (context === undefined) {
          context = createEmptyTable();
          if (isArray) {
            const tableArray = [context];
            headersInitializedTableArrays.push(tableArray);
            parent.content[names[0]] = tableArray;
          } else {
            parent.content[names[0]] = context;
          }
          if (directlyInitialized) {
            directlyInitializedTables.push(context);
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
          directlyInitializedTables,
          headersInitializedTableArrays,
          isArray,
          tomlExceptions,
          parserToken,
          directlyInitialized
        );
      } else if (isTableArray(context)) {
        return init_table(
          last(context),
          names.slice(1),
          directlyInitializedTables,
          headersInitializedTableArrays,
          isArray,
          tomlExceptions,
          parserToken,
          directlyInitialized
        );
      } else if (context === undefined) {
        // init a table indirectly
        context = createEmptyTable();
        parent.content[names[0]] = context;
        return init_table(
          context,
          names.slice(1),
          directlyInitializedTables,
          headersInitializedTableArrays,
          isArray,
          tomlExceptions,
          parserToken,
          directlyInitialized
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
  current: TomlTable,
  directlyInitializedTables: any[],
  headersInitializedTableArrays: TomlTable[][],
  tomlExceptions: TomlError[],
  parserToken: ct.IToken
) {
  const value = tomlValueToObject(
    kv.value,
    directlyInitializedTables,
    headersInitializedTableArrays,
    tomlExceptions,
    parserToken
  );
  const lastKey = kv.keys[kv.keys.length - 1];

  // create implicit tables, in dotted keys
  if (kv.keys.length > 1) {
    current = init_table(
      current,
      kv.keys.slice(0, -1),
      directlyInitializedTables,
      headersInitializedTableArrays,
      false,
      tomlExceptions,
      parserToken,
      false
    );
  }

  if (current.content[lastKey] !== undefined) {
    // can we statically define a table that has been implicitely defined?
    tomlExceptions.push({
      message: "Path has already been initialized to some value",
      token: parserToken
    });
    return null;
  } else {
    current.content[lastKey] = value;
    if (isTable(value)) {
      directlyInitializedTables.push(value);
    }
    return value;
  }
}

function everySameType(array: ast.TomlArray) {
  if (array.contents.length === 0) {
    return true;
  } else {
    const first = array.contents[0];
    return every(array.contents, item => item.type === first.type);
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
  directlyInitializedTable: any[],
  headersInitializedTableArrays: TomlTable[][],
  tomlExceptions: TomlError[],
  parserToken: ct.IToken
): any {
  switch (value.type) {
    case ast.offsetDateTime:
    case ast.localDateTime:
    case ast.localDate:
    case ast.localTime:
    case ast.atomicString:
    case ast.atomicInteger:
    case ast.atomicFloat:
    case ast.atomicNotANumber:
    case ast.atomicInfinity:
    case ast.atomicBoolean:
      return value;
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
          directlyInitializedTable,
          headersInitializedTableArrays,
          tomlExceptions,
          parserToken
        )
      );
      return v;
    case ast.inlineTable:
      const newObject: TomlTable = createEmptyTable();
      for (const kv of value.bindings) {
        processKeysValue(
          kv,
          newObject,
          directlyInitializedTable,
          headersInitializedTableArrays,
          tomlExceptions,
          parserToken
        );
      }
      return newObject;
    default:
      const foo: never = value; // Checks for exhaustion in above cases
      console.error("Unhandled value: ", JSON.stringify(value));
      return null;
  }
}

function createEmptyTable(): TomlTable {
  return tomlTable(Object.create(null));
}

function fullResultToObject(input: any): any {
  if (input instanceof Array) {
    return input.map(fullResultToObject);
  } else {
    if (input.type === table) {
      const obj = Object.create(null);
      for (const property in input.content) {
        // tables are created with no prototyped content
        obj[property] = fullResultToObject(input.content[property]);
      }
      return obj;
    } else {
      return input.value;
    }
  }
}
