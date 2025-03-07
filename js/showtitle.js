let lastTitleChangeTimestamp = 0;

const chromeTitleTag = {
  div: document.createElement("div"),

  /**
   * Updates the title text with the new title, unless it's been less than 1 second since last update
   * @return (void)
   */
  setTitle: function () {
    const TITLE_LENGTH_CUTOFF = 65;
    const currentTimestamp = Math.round(new Date().getTime() / 1000); // unix timestamp in seconds

    if (lastTitleChangeTimestamp > currentTimestamp - 1) {
      return false;
    }
    lastTitleChangeTimestamp = currentTimestamp;

    let htmlTitle = document.title;

    // HTMLタイトルが非常に長い場合に、特定の位置で切り取り、そこに「TOLONGCUTOFF」というマーカーを挿入する
    if (htmlTitle.length > TITLE_LENGTH_CUTOFF) {
      htmlTitle =
        htmlTitle.slice(0, TITLE_LENGTH_CUTOFF) +
        "TOLONGCUTOFF" +
        htmlTitle.slice(TITLE_LENGTH_CUTOFF);
    }

    // XSS対策で特殊文字の対策をする
    htmlTitle = htmlSpecialChars(htmlTitle);

    // 処理後タイトルの長さを取得してブラウザに表示するスタイルを変更する
    if (htmlTitle.length > TITLE_LENGTH_CUTOFF) {
      htmlTitle =
        htmlTitle.replace("TOLONGCUTOFF", '<span class="tolong">') + "</span>";
    }

    // DOM要素を更新する
    const titleElement = document.getElementById("showtitle-title");
    if (titleElement) {
      const titleLength = parseInt(document.title.length);
      titleElement.setAttribute("title", `Length: ${titleLength} chars`);
      titleElement.innerHTML = htmlTitle;
    }
    return true;
  },

  /**
   * タイトルバーの表示/非表示を切り替え、状態をlocalStorageに保存
   */
  toggleHide() {
    const { div } = this;
    const hasHideClass = div.className.match(/\bhide\b/);

    if (hasHideClass) {
      div.className = div.className.replace(/hide/g, "").trim();
      localStorage.setItem("showtitle-hide", "false");
    } else {
      div.className += " hide";
      localStorage.setItem("showtitle-hide", "true");
    }
  },

  /**
   * グローバル位置設定を取得
   */
  getPosition() {
    chrome.runtime.sendMessage(
      {
        type: "get",
        key: "position",
      },
      (response) => {
        this.setPosition(response);
      }
    );
  },

  /**
   * タイトルバーを正しい位置に移動し、設定を保存
   * @param {string} position - タイトルバーの位置
   */
  setPosition: function (position) {
    const wrapper = document.getElementById("showtitlewrapper");
    if (wrapper) {
      wrapper.className = position;
      if (localStorage["showtitle-hide"] == "true") {
        wrapper.className += " hide";
      }
    }
    chrome.extension.sendRequest(
      {
        type: "move",
        position: position,
      },
      function (response) {}
    );
  },

  /**
   * イベントハンドラを設定（ボタンのクリックなど）
   */
  addHandlers: function () {
    document.getElementById("showtitleremovelink").onclick = function () {
      this.toggle_hide();
      return false;
    };

    document.getElementById("showtitlemove").onclick = function () {
      chrome.extension.sendRequest(
        {
          type: "get",
          key: "position",
        },
        function (response) {
          // 位置の循環: bottom_right → bottom_left → top_left → top_right → bottom_right
          const positionMap = {
            bottom_right: "bottom_left",
            bottom_left: "top_left",
            top_left: "top_right",
            top_right: "bottom_right"
          };
          const newPosition = positionMap[response] || "bottom_right";

          chrome.extension.sendRequest(
            {
              type: "move",
              position: newPosition,
            },
            function (response) {
              this.get_position();
            }
          );
        }
      );
      return false;
    };
  },

  /**
   * Initialize the plugin
   * @return (cake)
   */
  init: function () {
    this.div.id = "showtitlewrapper";
    this.div.className = "not-initialized";

    // FontAwesomeアイコンを使用したHTML
    this.div.innerHTML = `
      <p>
        <span id="showtitle-title"></span>
        <span class="link" id="showtitlemove" title="Move this bar">
          <i class="icon-hand-down"></i><i class="icon-hand-up"></i>
          <i class="icon-hand-right"></i><i class="icon-hand-left"></i>
        </span>
        <span id="showtitleremovelink" class="link" title="Hide this bar">
          <i class="icon-eye-open"></i><i class="icon-eye-close"></i>
        </span>
      </p>
    `;
    // DOMに追加する
    document.body.appendChild(this.div);

    // 初期設定
    this.setTitle();
    this.get_position();
    this.addHandlers();

    const observer = new MutationObserver(this.setTitle);
    observer.observe(document.querySelector("title"), { childList: true });

    setInterval("chromeTitleTag.get_position()", 2000);
  },
};
/* Initialize the plugin */
chromeTitleTag.init();
