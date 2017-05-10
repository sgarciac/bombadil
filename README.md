# bombadil
Copyright Sergio Garcia

A  based [TOML v0.4.0](https://github.com/toml-lang/toml) parser for typescript.

## Usage

```typescript
import toml = require('./bombadil')
var input = fs.readFileSync('/dev/stdin', 'utf8');
```

### Errors

The reader will store errors in the ```errors``` property. They can be either:

  * Lexer errors: [ILexingError](http://sap.github.io/chevrotain/documentation/0_28_3/interfaces/_chevrotain_d_.ilexingerror.html)
  * Parser errors: [IRecognitionException](http://sap.github.io/chevrotain/documentation/0_28_3/interfaces/_chevrotain_d_.exceptions.irecognitionexception.html)
  * Table loading errors:
    ```typescript
    export interface ITomlException {
    message: string,
    token: ct.ISimpleTokenOrIToken
    }
    ```