const path = require('path');
const nodeExternals = require('webpack-node-externals');

const clientConfig = {
  mode: 'none',
  target: 'web',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
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
    path: path.resolve(__dirname, 'lib'),
    filename: 'test.js'
  },
  node: {global: true, fs: 'empty'},
  externals: [nodeExternals()],
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
