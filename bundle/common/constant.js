'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var GRAPH_API_VERSION = 'v3.0';
var FBSDK_VERSION = 'v3.0';
var GRAPH_BASE_URL = 'https://graph.facebook.com/' + GRAPH_API_VERSION;
var HEROKU_APP_URL = process.env.HEROKU_APP_NAME ? 'https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com' : process.env.HEROKU_LOCAL_URL;
var WEBHOOK_PATH = '/webhook';
var FB_APP_ID = process.env.FB_APP_ID;
var FB_APP_SECRET = process.env.FB_APP_SECRET;
var FB_APP_ACCESS_TOKEN = FB_APP_ID + '|' + process.env.FB_APP_SECRET;
var WEBHOOK_VERIFY_TOKEN = 'TEMPLATE_BOT';
var LOCAL_FILE_STORE_PATH = process.cwd() + '/var/data';
var REDISCLOUD_URL = '' + (process.env.REDIS_URL || '');

// for store/bot/config.js
var ACCESS_TOKEN_TTL = 30 * 60; // 30 minutes of seconds
var ACCESS_TOKEN_REAP_INTERVAL = 60 * 1000; // 1 min

var PAGE_ACCESS_TOKEN_KEY = process.env.PAGE_ACCESS_TOKEN_KEY ? process.env.PAGE_ACCESS_TOKEN_KEY : 'page_access_token';

exports.default = {
  ACCESS_TOKEN_REAP_INTERVAL: ACCESS_TOKEN_REAP_INTERVAL,
  ACCESS_TOKEN_TTL: ACCESS_TOKEN_TTL,
  FB_APP_ACCESS_TOKEN: FB_APP_ACCESS_TOKEN,
  FB_APP_ID: FB_APP_ID,
  FB_APP_SECRET: FB_APP_SECRET,
  FBSDK_VERSION: FBSDK_VERSION,
  GRAPH_API_VERSION: GRAPH_API_VERSION,
  GRAPH_BASE_URL: GRAPH_BASE_URL,
  HEROKU_APP_URL: HEROKU_APP_URL,
  WEBHOOK_PATH: WEBHOOK_PATH,
  LOCAL_FILE_STORE_PATH: LOCAL_FILE_STORE_PATH,
  PAGE_ACCESS_TOKEN_KEY: PAGE_ACCESS_TOKEN_KEY,
  REDISCLOUD_URL: REDISCLOUD_URL,
  WEBHOOK_VERIFY_TOKEN: WEBHOOK_VERIFY_TOKEN
};
//# sourceMappingURL=constant.js.map