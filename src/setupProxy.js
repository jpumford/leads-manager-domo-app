const { Proxy } = require('@domoinc/ryuu-proxy');
const manifest = require('../public/manifest.json');

const config = { manifest };
const proxy = new Proxy(config);

module.exports = function (app) {
    app.use(proxy.express());
};