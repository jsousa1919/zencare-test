const webpack = require('webpack');
const path = require('path');
const HashOutputPlugin = require("webpack-plugin-hash-output");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const MODE = "development";
const ENTRY_POINTS = [
  {
    name: "home",
    path: "./app/scripts/home.jsx"
  },
];

module.exports = {
  entry: ENTRY_POINTS.reduce((acc, entry) => {
    acc[entry.name] = entry.path;
    return acc;
  }, {}),
  mode: MODE,
  output: {
    path: path.resolve(__dirname, "zencare/static"),
    publicPath: "/static/",
    filename: "[name].[chunkhash].js"
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash].css"
    }),
    new HashOutputPlugin(),
    ...(ENTRY_POINTS.map(entry => (
      new HtmlWebpackPlugin({
        template: "zencare/templates/packs/wp_template.html",
        chunks: [entry.name],
        filename: path.join(
          "../../zencare/templates/packs/",
          entry.name + ".mako"
        ),
        inject: false
      })
    ))),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async'
    })
  ],
  module: {
    rules: [
      {
        test: /.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        use: "url-loader?limit=100000"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
          }
        ]
      }
    ]
  }
}
