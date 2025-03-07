// 定数オブジェクトを関数の外に配置
const HTML_ENTITY_OPTIONS = {
  ENT_NOQUOTES: 0,
  ENT_HTML_QUOTE_SINGLE: 1,
  ENT_HTML_QUOTE_DOUBLE: 2,
  ENT_COMPAT: 2,
  ENT_QUOTES: 3,
  ENT_IGNORE: 4,
};

function htmlSpecialChars(string, quote_style = 2, charset = null, double_encode = true) {
  // 変数を適切なスコープで宣言
  let noquotes = false;
  let optTemp = 0;

  // 文字列に変換
  string = string.toString();

  // ダブルエンコードの処理
  if (double_encode !== false) {
    string = string.replace(/&/g, "&amp;");
  }

  // 基本的なエスケープ処理
  string = string.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // quote_style が数値でない場合の処理
  if (quote_style === 0) {
    noquotes = true;
  } else if (typeof quote_style !== "number") {
    // 文字列または配列を処理
    const styleArray = [].concat(quote_style);

    for (let i = 0; i < styleArray.length; i++) {
      const currentStyle = styleArray[i];
      if (HTML_ENTITY_OPTIONS[currentStyle] === 0) {
        noquotes = true;
      } else if (HTML_ENTITY_OPTIONS[currentStyle]) {
        optTemp |= HTML_ENTITY_OPTIONS[currentStyle];
      }
    }

    quote_style = optTemp;
  }

  // シングルクォートの処理
  if (quote_style & HTML_ENTITY_OPTIONS.ENT_HTML_QUOTE_SINGLE) {
    string = string.replace(/'/g, "&#039;");
  }

  // ダブルクォートの処理
  if (!noquotes) {
    string = string.replace(/"/g, "&quot;");
  }

  return string;
};

const settings = {
  get_position: function () {
    return config.has("position") ? config.get("position") : "bottom_right";
  },
  set_position: function (corner) {
    corner = htmlSpecialChars(corner);
    config.set("position", corner);
  },
};

const config = {
  has: function(key) {
    return key in localStorage;
  },
  get: function(key) {
    if (this.has(key)) {
      try {
        return JSON.parse(localStorage[key]);
      } catch (e) {
        return localStorage[key];
      }
    }
  },
  set: function(key, value) {
    try {
      localStorage[key] = JSON.stringify(value);
    } catch (err) {
      if (err == QUOTA_EXCEEDED_ERR) {
        alert("Storage quota exceeded for Chrome Title Tag.");
      }
    }
  },
  defaults: function(vals) {
    for (const key in vals) {
      if (!this.has(key)) {
        this.set(key, vals[key]);
      }
    }
  },
};

chrome.extension.onRequest.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.type == "move") {
    // タイトルバーの位置を変更して、新しい位置を返す
    settings.set_position(request.position);
    sendResponse({
      position: settings.get_position(),
    });
  } else if (request.type == "set") {
    // request の任意のキーと値のペアを localStorage に保存する
    config.set(request.key, request.value);
    sendResponse(config.get(request.key));
  } else if (request.type == "get") {
    //タイトルバーの位置を返す
    sendResponse(settings.get_position());
  } else {
    sendResponse({
      error: "error",
    });
  }
});
