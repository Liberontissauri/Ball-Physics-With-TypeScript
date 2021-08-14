const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./src/js/index.ts",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html"
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.ts$/i,
                use: ["ts-loader"],
                exclude: "/nodemodules/",
            }
        ]
    },
    resolve: {
        extensions: [".tsx",".ts", ".js"]
    },
    devServer: {
        contentBase: "./dist"
    }
}