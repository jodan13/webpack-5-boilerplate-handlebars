const fs = require('fs');
const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const devMode = process.env.NODE_ENV !== "production";
const config = require('./config');
const {normalizeText} = require('./utils/normalize');
const paths = require("./paths");

const webpackConfig = {
  context: paths.src,
  mode: devMode ? 'development' : 'production',
  entry: {
    main: './js/index.js',
    home: './views/templates/home/home.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    watchFiles: paths.src,
    // static: paths.dist
  },
  output: {
    path: paths.dist,
    filename: 'js/[name].js',
    publicPath: "",
    clean: true,
    // assetModuleFilename: 'assets/[name].[hash:6][ext]'
  },
  module: {
    rules: [
      {
        test: /\.(gif|jpe?g|png|ico|svg|woff2?|ttf|eot)$/,
        type: 'asset/resource',
        generator: {
                filename: (pathData)=> {
                  if (pathData.filename.includes("favicon")) {
                    return '[path][name].[ext]';
                  }
                  return '[path][name].[hash].[ext]';
                },
        },
      },
      {
        test: /\.hbs$/,
        use: {
          loader: "handlebars-loader",
          options: {
            // This option tells to to require the assest 👇
            inlineRequires: '\/assets\/',
            partialDirs: [
              paths.views,
              paths.layout,
              paths.templates,
              paths.partials
            ].concat(
              glob.sync('**/', {
                cwd: paths.partials,
                realpath: true
              }))
          }
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
          "resolve-url-loader",
          'sass-loader'
        ]
      },
    ],
  },
  plugins: [].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              "imagemin-gifsicle",
              "imagemin-jpegtran",
              "imagemin-optipng",
              "imagemin-svgo",
            ],
          },
        },
        loader: false,
      }),
    ],
  },
};
fs.readdirSync(path.join('src', 'views', 'templates')).forEach(page => {
  console.log(`Building page: ${page.toUpperCase()}`);

  const htmlPageInit = new HtmlWebpackPlugin({
    inject: 'body',
    title: `${normalizeText(page)} | Bakery`,
    template: `./views/templates/${page}/${page}.hbs`,
    filename: `./${page !== "home" ? page + "/" : ""}index.html`,
    chunks: ['main', page],
    minify: config.htmlMinifyOptions
  });

  webpackConfig.entry[page] = `./views/templates/${page}/${page}.js`;
  webpackConfig.plugins.push(htmlPageInit);

});
module.exports = webpackConfig;
