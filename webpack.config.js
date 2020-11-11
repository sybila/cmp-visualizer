const path = require("path");
const APP_PATH = path.resolve(__dirname, "src", "index.ts");

module.exports = {
  entry: APP_PATH,
  mode: "production",
  output: {
    filename: "index.js",
    libraryTarget: "umd",
    library: "cmp-visualizer",
    path: path.resolve(__dirname, "dist"),
    umdNamedDefine: true,
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },

  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React",
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "ReactDOM",
      root: "ReactDOM",
    },
  },

  optimization: {
    minimize: false,
  },

  module: {
    rules: [
      { test: /\.(ts|js)x?$/, loader: "babel-loader", exclude: /node_modules/ },
    ],
  },
};
