'use strict';

var pug = require('pug');

var Cookies = require('cookies');

var _require = require('@prisma/client'),
    PrismaClient = _require.PrismaClient;

var prisma = new PrismaClient();

var util = require('./handler-util');

var _require2 = require('../config'),
    currentThemeKey = _require2.currentThemeKey;

var dayjs = require('dayjs');

var utc = require('dayjs/plugin/utc');

var timezone = require('dayjs/plugin/timezone');

var relativeTime = require('dayjs/plugin/relativeTime');

require('dayjs/locale/ja');

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.tz.setDefault('Asia/Tokyo');

var crypto = require('node:crypto');

var oneTimeTokenMap = new Map(); // キーをユーザ名、値をトークンとする連想配列

function handle(req, res) {
  var cookies, currentTheme, options, posts, oneTimeToken, body;
  return regeneratorRuntime.async(function handle$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          cookies = new Cookies(req, res);
          currentTheme = cookies.get(currentThemeKey) || 'light';
          options = {
            maxAge: 30 * 86400 * 1000
          };
          cookies.set(currentThemeKey, currentTheme, options);
          _context2.t0 = req.method;
          _context2.next = _context2.t0 === 'GET' ? 7 : _context2.t0 === 'POST' ? 17 : 20;
          break;

        case 7:
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
          });
          _context2.next = 10;
          return regeneratorRuntime.awrap(prisma.post.findMany({
            orderBy: {
              id: 'asc'
            }
          }));

        case 10:
          posts = _context2.sent;
          posts.forEach(function (post) {
            post.relativeCreatedAt = dayjs(post.createdAt).tz().fromNow();
            post.absoluteCreatedAt = dayjs(post.createdAt).tz().format('YYYY年MM月DD日 HH時mm分ss秒');
          });
          oneTimeToken = crypto.randomBytes(8).toString('hex');
          oneTimeTokenMap.set(req.user, oneTimeToken);
          res.end(pug.renderFile('./views/posts.pug', {
            currentTheme: currentTheme,
            posts: posts,
            user: req.user,
            oneTimeToken: oneTimeToken
          }));
          console.info("\u95B2\u89A7\u3055\u308C\u307E\u3057\u305F: user: ".concat(req.user, ", ") + "remoteAddress: ".concat(req.socket.remoteAddress, ", ") + "userAgent: ".concat(req.headers['user-agent'], " "));
          return _context2.abrupt("break", 22);

        case 17:
          body = '';
          req.on('data', function (chunk) {
            body += chunk;
          }).on('end', function _callee() {
            var params, content, requestedOneTimeToken;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    params = new URLSearchParams(body);
                    content = params.get('content');
                    requestedOneTimeToken = params.get('oneTimeToken');

                    if (content) {
                      _context.next = 6;
                      break;
                    }

                    handleRedirectPosts(req, res);
                    return _context.abrupt("return");

                  case 6:
                    if (requestedOneTimeToken) {
                      _context.next = 9;
                      break;
                    }

                    util.handleBadRequest(req, res);
                    return _context.abrupt("return");

                  case 9:
                    if (!(oneTimeTokenMap.get(req.user) !== requestedOneTimeToken)) {
                      _context.next = 12;
                      break;
                    }

                    util.handleBadRequest(req, res);
                    return _context.abrupt("return");

                  case 12:
                    console.info("\u9001\u4FE1\u3055\u308C\u307E\u3057\u305F: ".concat(content));
                    _context.next = 15;
                    return regeneratorRuntime.awrap(prisma.post.create({
                      data: {
                        content: content,
                        postedBy: req.user
                      }
                    }));

                  case 15:
                    oneTimeTokenMap["delete"](req.user);
                    handleRedirectPosts(req, res);

                  case 17:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });
          return _context2.abrupt("break", 22);

        case 20:
          util.handleBadRequest(req, res);
          return _context2.abrupt("break", 22);

        case 22:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

function handleDelete(req, res) {
  switch (req.method) {
    case 'POST':
      var body = '';
      req.on('data', function (chunk) {
        body += chunk;
      }).on('end', function _callee2() {
        var params, id, requestedOneTimeToken, post;
        return regeneratorRuntime.async(function _callee2$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                params = new URLSearchParams(body);
                id = parseInt(params.get('id'));
                requestedOneTimeToken = params.get('oneTimeToken');

                if (id) {
                  _context3.next = 6;
                  break;
                }

                util.handleBadRequest(req, res);
                return _context3.abrupt("return");

              case 6:
                if (requestedOneTimeToken) {
                  _context3.next = 9;
                  break;
                }

                util.handleBadRequest(req, res);
                return _context3.abrupt("return");

              case 9:
                if (!(oneTimeTokenMap.get(req.user) !== requestedOneTimeToken)) {
                  _context3.next = 12;
                  break;
                }

                util.handleBadRequest(req, res);
                return _context3.abrupt("return");

              case 12:
                _context3.next = 14;
                return regeneratorRuntime.awrap(prisma.post.findUnique({
                  where: {
                    id: id
                  }
                }));

              case 14:
                post = _context3.sent;

                if (!(req.user === post.postedBy || req.user === 'admin')) {
                  _context3.next = 21;
                  break;
                }

                _context3.next = 18;
                return regeneratorRuntime.awrap(prisma.post["delete"]({
                  where: {
                    id: id
                  }
                }));

              case 18:
                console.info("\u524A\u9664\u3055\u308C\u307E\u3057\u305F: user: ".concat(req.user, ", ") + "remoteAddress: ".concat(req.socket.remoteAddress, ", ") + "userAgent: ".concat(req.headers['user-agent'], " "));
                oneTimeTokenMap["delete"](req.user);
                handleRedirectPosts(req, res);

              case 21:
              case "end":
                return _context3.stop();
            }
          }
        });
      });
      break;

    default:
      util.handleBadRequest(req, res);
      break;
  }
}

module.exports = {
  handle: handle,
  handleDelete: handleDelete
};