import ECS from "./modules/ECS.js"
import Canvas2D from "./modules/components/Canvas2D.js"
import Position from "./modules/components/Position.js"
import RectCollider from "./modules/components/RectCollider.js"
import RenderSystem from "./modules/systems/ColliderRenderer.js"
import InputSystem from "./modules/systems/InputSystem.js"

const ecs = new ECS()
window.ecs = ecs // Allows ECS module to be accessed in Chrome's dev console

const inputSystem = new InputSystem(ecs)
inputSystem.addKeyBindings({
    UP: "w",
    DOWN: "s",
    LEFT: "a",
    RIGHT: "d",
    JUMP: " "
})
const canvas = ecs.registerSingleton(new Canvas2D("#canvas"), "canvas")

const player = ecs.createEntity()
ecs.addComponent(player, Position, 100, 100)
ecs.addComponent(player, RectCollider, 30)


const speed = 5
ecs.registerSystem({
    requestedComponents: "Position",
    onUpdate: function(ecs, COLUMNS) {
        const input = ecs.singletons.input
        const actions = ecs.singletons.inputActions
        const { Position : positions  } = COLUMNS
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i]
            if (input.isPressed(actions.UP)) pos.y -= speed
            if (input.isPressed(actions.DOWN)) pos.y += speed
            if (input.isPressed(actions.LEFT)) pos.x -= speed
            if (input.isPressed(actions.RIGHT)) pos.x += speed
        }
    }
})
ecs.registerSystem(RenderSystem)

ecs.on("testEvent", comp => console.log(comp._entity))

function tick() {
    canvas.clear()
    ecs.updateSystems()
    window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)
