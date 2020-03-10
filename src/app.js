import ECS from "./modules/ECS.js"

const $div = document.querySelector("body > div")
const ecs = new ECS()
window.ecs = ecs // Allows ECS module to be accessed in Chrome's dev console

ecs.addKeyBindings({
    UP: "w",
    DOWN: "s",
    LEFT: "a",
    RIGHT: "d",
    JUMP: " "
})
ecs.registerSystem((c, s, a) => {
    const input = s.input
    if (input.pressedThisFrame(a.JUMP)) {
        $div.style.background = "red"
    }
    if (input.releasedThisFrame(a.JUMP)) {
        $div.style.background = "blue"
    }
})

function tick() {
    ecs.runSystems()
    window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)
