const path = require('path');

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: "./index.js",
    output: {
        path: __dirname,
        filename: "build/bundle.js"
    }
};