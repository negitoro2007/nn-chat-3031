"use strict";

var fs = require("node:fs");

var Cookies = require("cookies");

var _require = require("../config"),
    currentThemeKey = _require.currentThemeKey;

function handleLogout(req, res) {
  res.writeHead(401, {
    "Content-Type": "text/html; charset=utf-8"
  });
  res.end("<!DOCTYPE html><html lang=\"ja\">\n        <body>\n            <h1>\u30ED\u30B0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F</h1>\n            <a href=\"/posts\">\u30ED\u30B0\u30A4\u30F3</a>\n        </body>\n    </html>");
}

function handleChangeTheme(req, res) {
  var cookies = new Cookies(req, res);
  var currentTheme = cookies.get(currentThemeKey) !== "light" ? "light" : "dark";
  cookies.set(currentThemeKey, currentTheme);
  res.writeHead(303, {
    Location: "/posts"
  });
  res.end();
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    "Content-Type": "image/vnd.microsoft.icon",
    "Cache-Control": "public, max-age=604800"
  });
  var favicon = fs.readFileSync("./favicon.ico");
  res.end(favicon);
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/css"
  });
  var file = fs.readFileSync("./public/style.css");
  res.end(file);
}

function handleNnChatJsFile(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/javascript"
  });
  var file = fs.readFileSync("./public/nn-chat.js");
  res.end(file);
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  res.write("<p>ページがみつかりません</p>");
  res.write('<p><a href="/posts">NNチャット</a></p>');
  res.end();
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  res.end("未対応のリクエストです");
}

module.exports = {
  handleLogout: handleLogout,
  handleChangeTheme: handleChangeTheme,
  handleFavicon: handleFavicon,
  handleStyleCssFile: handleStyleCssFile,
  handleNnChatJsFile: handleNnChatJsFile,
  handleNotFound: handleNotFound,
  handleBadRequest: handleBadRequest
};