const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/gamefeed",
    createProxyMiddleware({
      target: "https://gamemonetize.com",
      changeOrigin: true,
      pathRewrite: { "^/gamefeed": "/feed.php" },
    })
  );
};
