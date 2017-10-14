const path = require('path')

module.exports = {
    entry: ['babel-polyfill', path.resolve(__dirname, 'src/index.js')],
    
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'quirky-engine.js',
        libraryTarget: 'commonjs2'
    },
    
    module: {
        rules: [
            {
                test: /\.pug$/, use: 'pug-loader'
            },
            {
                test: /\.js$/, use: 'babel-loader'
            },
            {
                test: /\.js$/, use: 'eslint-loader', exclude: /node_modules/, enforce: 'pre'
            },
            {
                test: /\.scss$/, use: ['raw-loader', 'sass-loader']
            },
            {
                test: /\.json5/, use: 'json5-loader'
            },
            {
                test: /\.json/, use: 'json-loader'
            }
        ]
    },
    
    resolve: {
        extensions: [ '.pug', '.js', '.scss', '.json5', '.json', '.css' ],
        modules: [ path.resolve(__dirname, 'src'), 'node_modules']
    },
    
    target: 'node'
}