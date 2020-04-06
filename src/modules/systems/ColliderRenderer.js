export default {
    requestedComponents: ["Position", "RectCollider"],
    onUpdate: function(ecs, COLUMNS) {
        const ctx = ecs.singletons.canvas.ctx

        const positions = COLUMNS.Position
        const colliders = COLUMNS.RectCollider

        // Draw colliders
        ctx.strokeStyle = "#03fc24"
        ctx.lineWidth = 3
        for (let i = 0; i < colliders.length; i++) {
            const col = colliders[i]
            const pos = positions[i]

            if (pos.x < 0) ecs.emit("testEvent", pos)

            ctx.strokeRect(pos.x, pos.y, col.width, col.height)
        }
    }
}
