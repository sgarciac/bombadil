# bombadil
Copyright Sergio Garcia

A [chevrotain](https://github.com/SAP/chevrotain) based [TOML v0.4.0](https://github.com/toml-lang/toml) parser for typescript.

## Usage

```javascript
var bombadil = require('@sgarciac/bombadil')
var input = 'name = "sergio"'
var reader = new bombadil.TomlReader
reader.readToml(input)
reader.result // -> {name: 'sergio'}
```

### Errors

If the input is not a valid TOML string, the reader will store ```null``` in its ```result``` property and it will keep the errors in its ```errors``` property. Errors can be either:

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
  * Local Time -> [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) (using UTC±00:00 and date 0000-00-00)
  * Array -> Array
  * Table -> Object

As you can see, there is some information loss. If you need full typing information, you can do:

```javascript
var bombadil = require('@sgarciac/bombadil')
var input = 'name = "sergio"'
var reader = new bombadil.TomlReader
reader.readToml(input)
```

  