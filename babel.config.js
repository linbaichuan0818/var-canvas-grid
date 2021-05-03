module.exports = function (api) {// commonjs
  api.cache(true)
  const presets = [
      // babel环境预设
      ["@babel/preset-env", {
          targets: {
              ie:"10",
              edge: "17",
              firefox: "60",
              chrome: "67",
              safari: "11.1",
          },
          // 按需添加polyfill
          "corejs":3,
          useBuiltIns: "usage",
      }]
  ];
  return {
      presets,
  }
}