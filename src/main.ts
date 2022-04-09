import $ from "jquery"
import SocketIO from "socket.io-client"

import "./styles/_colors.css"
import "./styles/_font.css"

import "./styles/global.css"

const pieces: HTMLElement[] = []
const client = SocketIO(import.meta.env.VITE_BACKEND_URL)
const center = {
  x: document.body.clientWidth / 2,
  y: document.body.clientHeight / 2
}

window.addEventListener("resize", function() {
  center.x = document.body.clientWidth / 2
  center.y = document.body.clientHeight / 2

  client.emit("update-pieces")
})

$(".board").each(function() {
  for (let y = 0; y < 8; y++) {
    const row = document.createElement("div")

    row.className = "board-row"

    for (let x = 0; x < 8; x++) {
      const cell = document.createElement("div")
  
      cell.className = "board-cell"
      cell.setAttribute("drop", "true")

      row.appendChild(cell)
    }

    this.appendChild(row)
  }
})

client.on("delete-piece", function(id) {
  const piece = document.querySelector(`#${id}`) as Element

  piece.parentNode?.removeChild(piece)
})

client.on("move-piece", function(id, x, y) {
  const piece = $(`#${id}`)
  
  piece.css({
    position: "absolute",
    top: y + center.y + "px",
    left: x + center.x + "px"
  })
})

client.on("create-piece", function(uid, icon, color) {
  const piece = document.createElement("div")
  
  piece.setAttribute("id", uid)
  piece.className = `game-piece ${color}`
  piece.innerHTML = `<b>${icon}</b>`

  piece.ondragstart = function(e) {
    e.preventDefault()

    return null
  }

  piece.addEventListener("dblclick", function() {
    client.emit("delete-piece", this.id)
  })

  piece.addEventListener("mousedown", function(e) {
    $(piece).addClass("drag")

    // Mouse position inside the element.
    const rect = piece.getBoundingClientRect()
    const dx = e.clientX - rect.x
    const dy = e.clientY - rect.y

    // Place the element in the body for correct positioning.
    document.body.appendChild(piece)
    
    $(piece).css({
      position: "absolute",
      top: rect.top + "px",
      left: rect.left + "px"
    })
    
    // Makes the dragged piece always on top of the other pieces.
    const id = pieces.indexOf(piece)

    pieces.push(...pieces.splice(id, 1))

    pieces.forEach((c, i) => {
      c.style.zIndex = i.toString()
    })

    function drag(event: MouseEvent) {
      const {clientX, clientY} = event

      client.emit("move-piece", uid, clientX - dx - center.x, clientY - dy - center.y)
    }

    function dragend(event: MouseEvent) {
      const {clientX, clientY} = event

      $(piece).removeClass("drag")

      $(".game-piece").hide()

      const candidate = document.elementFromPoint(clientX, clientY)

      $(".game-piece").show()

      if (candidate && candidate.hasAttribute("drop")) {
        candidate.appendChild(piece)

        piece.style.position = "static"
      }

      const rect = piece.getBoundingClientRect()

      client.emit("move-piece", uid, rect.left - center.x, rect.y - center.y)

      document.removeEventListener("mousemove", drag)
      document.removeEventListener("mouseup", dragend)
    }

    document.addEventListener("mousemove", drag)
    document.addEventListener("mouseup", dragend)
  })

  $("body").append(piece)
})

$(".create-piece").on("click", function() {
  client.emit("create-piece", this.dataset.icon, this.dataset.color)
})
