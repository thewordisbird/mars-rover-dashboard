import App from './app';
import { render } from './utils/render';
const handlers = [
  {
    action: "click",
    callback: () => console.log("click handled!")
  },
  {
    action: "scroll",
    callback: () => console.log("scroll handled!")
  }
]
const html = App();
render("root", html, handlers)
