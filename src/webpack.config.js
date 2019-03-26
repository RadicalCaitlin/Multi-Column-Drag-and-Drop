"use strict";

var webpack = require("webpack");
var extractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: {
        "mc-dnd": "./js/main.js"
    },
    output: {
        filename: "./[name].bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.scss$/,
                loader: extractTextPlugin.extract(["css-loader", "postcss-loader", "sass-loader"]),
            }
        ]
    },
    plugins: [
        new extractTextPlugin({
            filename: "./[name].bundle.css",
            allChunks: true
        }),
        new webpack.LoaderOptionsPlugin({
            debug: true
        }),
    ]
};
