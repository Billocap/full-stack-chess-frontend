import $ from "jquery"

export default class Router {
  constructor() {
    const path = new URL(window.location.href).pathname

    $(".screen").hide()

    $(`.screen[route="${path}"]`).show()
  }

  set path(path: string) {
    window.location.href = path
  }
}
