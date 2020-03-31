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

const player = ecs.createEntity()
ecs.addComponent(player, Position, 100, 100)
ecs.addComponent(player, RectCollider, 30)


const speed = 5
function PlayerController(comps, singletons, actions) {
    const { positions: Positions } = comps
    for (var i = 0; i < positions.length; i++) {
        if (actions.UP) positions.y -= speed
        if (actions.DOWN) positions.y += speed
        if (actions.LEFT) positions.x -= speed
        if (actions.RIGHT) positions.x += speed
    }
}
ecs.registerSystem({
    requestedComponents: "Position",
    onUpdate: function(ecs, COLUMNS) {
        const input = ecs.singletons.input
        const actions = ecs.inputActions
        const { Position : positions  } = COLUMNS
        for (var i = 0; i < positions.length; i++) {
            const pos = positions[i]
            if (input.isPressed(actions.UP)) pos.y -= speed
            if (input.isPressed(actions.DOWN)) pos.y += speed
            if (input.isPressed(actions.LEFT)) pos.x -= speed
            if (input.isPressed(actions.RIGHT)) pos.x += speed
        }
    }
})
ecs.registerSystem(RenderSystem)

function tick() {
    canvas.clear()
    ecs.updateSystems()
    window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)
