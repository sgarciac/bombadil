var webpack = require('webpack'),
    path = require('path');
 
var libraryName = 'bombadil';
    
var config = {
  context: path.resolve(__dirname, "src"),
  entry: [
    './bombadil.ts'
  ],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: libraryName + '.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
 module: {
    rules: [
        {
            enforce: 'pre',
            test: /\.tsx?$/,
            use: 'tslint-loader',
            exclude: [path.resolve(__dirname, "node_modules"),path.resolve(__dirname, "../main.ts")]
        },
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: [path.resolve(__dirname, "node_modules"),path.resolve(__dirname, "../main.ts")]
        }
    ]
},
  resolve: {
    modules: [path.resolve(__dirname, "node_modules")],
    extensions: [ '.ts', '.js' ]
  }
};
 
module.exports = config;