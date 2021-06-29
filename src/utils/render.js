export function render (targetId, html, handlers) {
  const target = document.getElementById(targetId);
  target.innerHTML = html;
  addHandlers(target, handlers);
};

export function asyncRender(targetId, htmlPromise, handlers) {
  const target = document.getElementById(targetId);
  target.innerHTML("<p>Loading...</p>")
  htmlPromise()
    .then((html) => {
      target.innerHTML(html)
      addHandlers(target, handlers)
    })
}

function addHandlers(target, handlers) {
  if (handlers) {
    handlers.forEach((handler) => {
      switch (handler.action) {
        case "scroll":
          window.addEventListener("scroll", handler.callback);
          break;
        default:
          target.addEventListener(handler.action, handler.callback);
      }
      target.addEventListener(handler.action, handler.callback)
    })
  }
}