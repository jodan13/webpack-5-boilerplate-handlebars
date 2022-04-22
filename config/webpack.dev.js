const { merge } = require("webpack-merge");
const portFinderSync = require("portfinder-sync");
const paths = require("./paths");
const CommonWebpackConfig = require("./webpack.common");
const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const basePort = 8080;
fs.readdirSync(path.join('src', 'views', 'templates')).forEach(page => {
  console.log(`Building page: ${page.toUpperCase()}`);

  const htmlPageInit = new HtmlWebpackPlugin({
    inject: 'body',
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
  mode: "development",

  output: {
    filename: "js/[name].js",
    pathinfo: false,
    publicPath: "/",
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.(scss|sass|css)$/,
        use: [
          "style-loader",
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

  devServer: {
    watchFiles: paths.src,
    port: portFinderSync.getPort(basePort),
  },

  devtool: "eval-cheap-module-source-map",
});
