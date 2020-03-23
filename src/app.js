import ECS from "./modules/ECS.js"
import Canvas2D from "./modules/components/Canvas2D.js"
import Position from "./modules/components/Position.js"
import RectCollider from "./modules/components/RectCollider.js"
import RenderSystem from "./modules/systems/ColliderRenderer.js"

const ecs = new ECS()
window.ecs = ecs // Allows ECS module to be accessed in Chrome's dev console

ecs.addKeyBindings({
    UP: "w",
    DOWN: "s",
    LEFT: "a",
    RIGHT: "d",
    JUMP: " "
})
const canvas = ecs.registerSingleton(new Canvas2D("#canvas"), "canvas")
ecs.registerSystem(RenderSystem)

// Generate random rectangles of various sizes
for (let i = 0; i < 1000; i++) {
    const id = ecs.createEntity()
    ecs.addComponent(id, Position, Math.random() * canvas.width, Math.random() * canvas.height)
    ecs.addComponent(id, RectCollider, Math.random() * 100)
    setTimeout(function () {
        ecs.removeEntity(id)
    }, Math.random() * 5000);
}

const player = ecs.createEntity()
ecs.addComponent(player, Position, 100, 100)
ecs.addComponent(player, RectCollider, 30)
setTimeout(function () {
    ecs.removeComponent(player, RectCollider)
}, 1000);

function tick() {
    canvas.clear()
    ecs.execSystems()
    window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)
