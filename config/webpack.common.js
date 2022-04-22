const Dotenv = require('dotenv-webpack');
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const paths = require("./paths");
const glob = require("glob");

const webpackConfig = {
    context: paths.src,
    entry: {
        main: './index.js',
        home: './views/templates/home/home.js'
    },
    output: {
        path: paths.dist,
    },
    performance: {
        maxAssetSize: 100000000
    },
    module: {
        rules: [
            {
                // asset
                test: /\.(jpe?g|png|ico|gif|svg|json|eot|woff|ttf|woff2)$/i,
                type: 'asset/resource',
                generator: {
                    filename: (pathData)=> {
                        if (pathData.filename.includes("favicon") || pathData.filename.includes("fonts")) {
                            return '/[path][name].[ext]';
                        }
                        return '/[path][name].[hash].[ext]';
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
        ],
    },
    plugins: [
        new ESLintPlugin(),
        new Dotenv(),
        new CopyPlugin({
            patterns: [
                {
                    from: "robots.txt",
                    to: "robots.txt",
                },
            ],

        }),
    ],
};

module.exports = webpackConfig;
