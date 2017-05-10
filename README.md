# bombadil
Copyright Sergio Garcia

A  based [TOML v0.4.0](https://github.com/toml-lang/toml) parser for typescript.

## Usage

```typescript
import toml = require('./bombadil')
var input = fs.readFileSync('/dev/stdin', 'utf8');
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

