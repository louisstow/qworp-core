const path = require('path');
const nodeExternals = require('webpack-node-externals');

const clientConfig = {
  mode: 'none',
  target: 'web',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'editor.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};

const testConfig = {
  mode: 'none',
  target: 'node',
  entry: './tests/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.js'
  },
  node: {global: true, fs: 'empty'},
  externals: [nodeExternals()],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};

module.exports = [ clientConfig, testConfig ];
