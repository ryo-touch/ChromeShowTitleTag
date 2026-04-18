const POSITIONS = ["bottom_right", "bottom_left", "top_left", "top_right"];
const NEXT_POSITION = {
  bottom_right: "bottom_left",
  bottom_left: "top_left",
  top_left: "top_right",
  top_right: "bottom_right",
};
const TITLE_LENGTH_CUTOFF = 65;
const TITLE_UPDATE_THROTTLE_SECONDS = 1;

const chromeTitleTag = {
  div: document.createElement("div"),
  titleElement: null,
  lastTitleChangeTimestamp: 0,

  setTitle() {
    const currentTimestamp = Math.round(Date.now() / 1000);
    if (
      this.lastTitleChangeTimestamp >
      currentTimestamp - TITLE_UPDATE_THROTTLE_SECONDS
    ) {
      return;
    }
    this.lastTitleChangeTimestamp = currentTimestamp;

    const titleElement = this.titleElement;
    if (!titleElement) return;

    const title = document.title;
    titleElement.setAttribute("title", `Length: ${title.length} chars`);

    if (title.length > TITLE_LENGTH_CUTOFF) {
      const overflow = document.createElement("span");
      overflow.className = "tolong";
      overflow.textContent = title.slice(TITLE_LENGTH_CUTOFF);
      titleElement.replaceChildren(
        document.createTextNode(title.slice(0, TITLE_LENGTH_CUTOFF)),
        overflow
      );
    } else {
      titleElement.replaceChildren(document.createTextNode(title));
    }
  },

  toggleHide() {
    const isHidden = this.div.classList.toggle("hide");
    chrome.storage.local.set({
      "showtitle-hide": isHidden ? "true" : "false",
    });
  },

  getPosition() {
    try {
      chrome.runtime.sendMessage(
        { type: "get", key: "position" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.log("Chrome runtime error:", chrome.runtime.lastError);
            return;
          }
          this.setPosition(response);
        }
      );
    } catch (e) {
      console.log("Failed to send message to extension:", e);
    }
  },

  setPosition(position) {
    if (!POSITIONS.includes(position)) return;
    this.div.classList.remove(...POSITIONS, "not-initialized");
    this.div.classList.add(position);
    chrome.runtime.sendMessage({ type: "move", position });
  },

  addHandlers() {
    document.getElementById("showtitleremovelink").onclick = () => {
      this.toggleHide();
      return false;
    };

    document.getElementById("showtitlemove").onclick = () => {
      chrome.runtime.sendMessage(
        { type: "get", key: "position" },
        (response) => {
          const newPosition = NEXT_POSITION[response] || "bottom_right";
          this.setPosition(newPosition);
        }
      );
      return false;
    };
  },

  init() {
    this.div.id = "showtitlewrapper";
    this.div.className = "not-initialized";

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
    document.body.appendChild(this.div);
    this.titleElement = this.div.querySelector("#showtitle-title");

    this.setTitle();
    this.getPosition();
    this.addHandlers();

    chrome.storage.local.get("showtitle-hide", (result) => {
      if (result["showtitle-hide"] === "true") {
        this.div.classList.add("hide");
      }
    });

    const titleNode = document.querySelector("title");
    if (titleNode) {
      const observer = new MutationObserver(() => this.setTitle());
      observer.observe(titleNode, { childList: true });
    }
  },
};

chromeTitleTag.init();
