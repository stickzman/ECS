export default {
    update: function(ecs) {
        if (!ecs.debug) return
        const ctx = ecs.canvas.ctx

        ctx.strokeStyle = "#03fc24"
        ctx.fillStyle = "#ff0000"
        ctx.lineWidth = 3
        const tuples = ecs.query({
            id: "debugRenderer",
            all: ["Position", "BoundingBox"]
        })
        for (let i = 0; i < tuples.length; i++) {
            const e = tuples[i]
            const col = e.BoundingBox
            const pos = e.Position

            // Draw collider
            ctx.strokeRect(pos.x, pos.y, col.width, col.height)
            // Draw position
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI)
            ctx.fill()
        }
    }
}
