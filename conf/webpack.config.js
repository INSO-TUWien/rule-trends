const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        chart_page: ["./src/main/js/chart_page/index.js"]
    },
    output: {
        path: path.join(__dirname, "../target/classes/static"),
        filename: "[name].js"
    },
    externals: {
        react: "React",
        "react-dom": "ReactDOM"
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './src/main/js/chart_page/exampleIssueData.json', to: path.join(__dirname, "../target/classes/static", "exampleIssueData.json") },
                { from: './src/main/js/chart_page/exampleRuleData.json', to: path.join(__dirname, "../target/classes/static", "exampleRuleData.json") }
            ],
        }),
    ],
    module: {
        rules: [
            {
                //test: /\.js$/,
                test: /\.(js|jsx|tsx|ts)$/,
                use: [{
                    loader: "babel-loader"
                }],
                exclude: /(node_modules)/
            },
            {
                test: /\.css/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {extensions: [ '.ts', '.tsx', '.js', '.jsx', '.react.js']}
};