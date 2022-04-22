const {ProgressPlugin} = require("webpack");
const {merge} = require("webpack-merge");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CommonWebpackConfig = require("./webpack.common");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const path = require("path");
// const dotenv = require('dotenv').config();

fs.readdirSync(path.join('src', 'views', 'templates')).forEach(page => {
  console.log(`Building page: ${page.toUpperCase()}`);

  const htmlPageInit = new HtmlWebpackPlugin({
    inject: 'body',
    // base: dotenv.parsed.API,
    base: "/",
    template: `./views/templates/${page}/${page}.hbs`,
    filename: `./${page !== "home" ? page + "/" : ""}index.html`,
    chunks: ['main', page],
    minify: {
      collapseWhitespace: true,
      collapseInlineTagWhitespace: false,
      conservativeCollapse: false,
      preserveLineBreaks: true,
      removeAttributeQuotes: false,
      removeComments: false,
      useShortDoctype: false,
      html5: true,
    }
  });

  CommonWebpackConfig.entry[page] = `./views/templates/${page}/${page}.js`;
  CommonWebpackConfig.plugins.push(htmlPageInit);

});
module.exports = merge(CommonWebpackConfig, {
  mode: "production",

  output: {
    filename: "./js/[name].[contenthash].js",
    publicPath: "",
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.(scss|sass|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: "css-loader"},
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
          {loader: "resolve-url-loader"},
          {loader: "sass-loader"},
        ]
      },
    ],
  },

  optimization: {
    minimize: true,
    realContentHash: false,
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              // "imagemin-gifsicle",
              "imagemin-jpegtran",
              "imagemin-optipng",
              "imagemin-svgo",
            ],
          },
        },
        loader: false,
      }),
      new TerserPlugin(),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: {removeAll: true},
            },
          ],
        },
      })],
  },

  plugins: [
    new ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: "./css/[name].[contenthash].css",
    }),
  ],

  devtool: 'source-map',

  target: ["web", "es5"],
});
