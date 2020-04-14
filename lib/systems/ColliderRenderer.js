export default {
    query: {
        components: ["Position", "RectCollider"]
    },
    update: function(ecs, COLUMNS) {
        const ctx = ecs.singletons.canvas.ctx

        const positions = COLUMNS.Position
        const colliders = COLUMNS.RectCollider

        // Draw colliders
        ctx.strokeStyle = "#03fc24"
        ctx.lineWidth = 3
        for (let i = 0; i < colliders.length; i++) {
            const col = colliders[i]
            const pos = positions[i]

            ctx.strokeRect(pos.x, pos.y, col.width, col.height)
        }
    }
}