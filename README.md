# bombadil
Copyright Sergio Garcia

A [chevrotain](https://github.com/SAP/chevrotain) based [TOML v0.5.0](https://github.com/toml-lang/toml) parser, written in typescript.

## Releases

  * TOML 0.5: [Bombadil 2.0.0](https://www.npmjs.com/package/@sgarciac/bombadil/v/2.0.0)
  * TOML 0.5: [Bombadil 2.0.0-1 (prerelease)](https://www.npmjs.com/package/@sgarciac/bombadil/v/2.0.0-1)
  * TOML 0.4: [Bombadil 1.0.0 (stable)](https://www.npmjs.com/package/@sgarciac/bombadil/v/1.0.0)

## Usage

```javascript
var bombadil = require('@sgarciac/bombadil')
var input = 'whatever = 1'
var reader = new bombadil.TomlReader
reader.readToml(input)
reader.result // -> {whatever: 1}
```

### Errors

If the input is not a valid TOML string, the reader will store ```undefined``` in its ```result``` property and it will keep the errors in its ```errors``` property. Errors can be either:

  * Lexer errors: [ILexingError](http://sap.github.io/chevrotain/documentation/0_28_3/interfaces/_chevrotain_d_.ilexingerror.html)
  * Parser errors: [IRecognitionException](http://sap.github.io/chevrotain/documentation/0_28_3/interfaces/_chevrotain_d_.exceptions.irecognitionexception.html)
  * Table loading errors:
    ```typescript
    export interface ITomlException {
    message: string,
    token: ct.IToken
    }
    ```
    which uses [IToken](http://sap.github.io/chevrotain/documentation/0_28_3/interfaces/_chevrotain_d_.itoken.html)

## Type mapping

By default, the toml reader will map TOML values to javascript values as follows:

  * Integers -> Number
  * Float -> Number
  * String -> String
  * Boolean -> Boolean
  * Offset Date Time -> [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
  * Local Date Time -> [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) (using UTC±00:00)
  * Local Date -> [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) (using UTC±00:00 and time 00:00:00)
  * Local Time -> [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) (using UTC±00:00 and date 0001-01-01)
  * Array -> Array
  * Table -> Object

As you can see, there is some information loss. If you need the original typing information, you can pass a second parameter to ```readToml``` set to ```true```:

```javascript
var bombadil = require('@sgarciac/bombadil')
var input = 'names = ["sergio","arturo"]'
var reader = new bombadil.TomlReader
reader.readToml(input, true)
reader.result // -> { names:[ TomlAtomicValue { type: 4, image: 'sergio', value: 'sergio' },TomlAtomicValue { type: 4, image: 'arturo', value: 'arturo' } ] }
bombadil.TomlAtomicValueType[reader.result.names[0].type] // ->  'String'
```

Notice that we also keep the original string representation of the value. This can be helpful for example to deal with big integers, which can not be handled by the javascript Number type.

## Known problems

Chevrotain is known to rely on function names, which means that minification
(such as performed by, for example,
[Uglify](https://github.com/mishoo/UglifyJS)) can break bombadil. There are some
solutions to this problem
[here](https://github.com/SAP/chevrotain/blob/master/examples/parser/minification/README.md)

Unless you are running the code inside the browser, and using minification, you
probably don't need to worry about this.
