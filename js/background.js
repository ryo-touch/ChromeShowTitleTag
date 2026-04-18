const DEFAULT_POSITION = "bottom_right";

const settings = {
  async get_position() {
    const result = await chrome.storage.local.get("position");
    return result.position || DEFAULT_POSITION;
  },
  async set_position(corner) {
    await chrome.storage.local.set({ position: corner });
  },
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "move") {
    settings.set_position(request.position)
      .then(() => settings.get_position())
      .then((position) => sendResponse({ position }))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }

  if (request.type === "get" && request.key === "position") {
    settings.get_position()
      .then((position) => sendResponse(position))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }

  sendResponse({ error: "Unknown request type" });
});
