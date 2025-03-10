function htmlSpecialChars(string, quoteStyle = 2, doubleEncode = true) {
  // Service Worker(module) はutile.jsのメソッドを利活用できないので、utils.jsと同じ関数の実装をコピーして利用する
  const QUOTE_STYLES = {
    ENT_NOQUOTES: 0,
    ENT_HTML_QUOTE_SINGLE: 1,
    ENT_HTML_QUOTE_DOUBLE: 2,
    ENT_COMPAT: 2,
    ENT_QUOTES: 3,
    ENT_IGNORE: 4,
    ENT_SUBSTITUTE: 8,
    ENT_DISALLOWED: 128,
    ENT_HTML401: 0,
    ENT_XML1: 16,
    ENT_XHTML: 32,
    ENT_HTML5: 48
  };

  if (typeof quoteStyle !== 'number') {
    quoteStyle = QUOTE_STYLES.ENT_QUOTES;
  }

  if (doubleEncode !== false) {
    string = string.replace(/&/g, '&amp;');
  }

  string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  if (quoteStyle & QUOTE_STYLES.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, '&#039;');
  }

  if (quoteStyle & QUOTE_STYLES.ENT_HTML_QUOTE_DOUBLE) {
    string = string.replace(/"/g, '&quot;');
  }

  return string;
};

const settings = {
  get_position: async function () {
    const result = await chrome.storage.local.get("position");
    return result.position || "bottom_right";
  },
  set_position: function (corner) {
    corner = htmlSpecialChars(corner);
    chrome.storage.local.set({ "position": corner });
  },
};

// configオブジェクトをchrome.storage.localを使用するように修正
const config = {
  has: async function(key) {
    const result = await chrome.storage.local.get(key);
    return key in result;
  },
  get: async function(key) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  },
  set: function(key, value) {
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data).catch(err => {
      console.error("Storage error:", err);
    });
  },
  defaults: async function(vals) {
    for (const key in vals) {
      const exists = await this.has(key);
      if (!exists) {
        this.set(key, vals[key]);
      }
    }
  },
};

// Promiseを使用するようにメッセージハンドラを修正
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  try {
    if (request.type == "move") {
      settings.set_position(request.position)
        .then(position => {
          return settings.get_position();
        })
        .then(position => {
          sendResponse({ position: position });
        })
        .catch(error => {
          sendResponse({ error: error.message });
        });
      return true; // 非同期レスポンスを示す
    } else if (request.type == "get") {
      // リクエストされたキーに基づいて処理を分岐
      if (request.key === "position") {
        settings.get_position()
          .then(position => {
            sendResponse(position);
          })
          .catch(error => {
            sendResponse({ error: error.message });
          });
      } else {
        // 他のキーの場合の処理
        config.get(request.key)
          .then(value => {
            sendResponse(value);
          })
          .catch(error => {
            sendResponse({ error: error.message });
          });
      }
      return true; // 非同期レスポンスを示す
    } else if (request.type == "set") {
      config.set(request.key, request.value)
        .then(() => {
          return config.get(request.key);
        })
        .then(value => {
          sendResponse(value);
        })
        .catch(error => {
          sendResponse({ error: error.message });
        });
      return true; // 非同期レスポンスを示す
    } else {
      sendResponse({ error: "Unknown request type" });
    }
  } catch (e) {
    sendResponse({ error: e.message });
  }
});
