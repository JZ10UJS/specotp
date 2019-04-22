const path = require('path');

module.exports = {
    entry: {
        main: path.join(__dirname, '/src/index.ts'),
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].bundle.js'
    },
    // devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            { test: /\.css$/, use: 'css-loader' },
            { test: /\.html$/, use: 'html-loader' },
            { test: /\.ts/, use: 'ts-loader' }
        ]
    }
}