export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Position", "BoundingBox"]
        })
    },
    update: function(ecs) {
        if (!ecs.globals.debug) return
        const ctx = ecs.globals.canvas.ctx

        const positions = this.query.components.Position
        const colliders = this.query.components.BoundingBox

        ctx.strokeStyle = "#03fc24"
        ctx.fillStyle = "#ff0000"
        ctx.lineWidth = 3
        for (let i = 0; i < colliders.length; i++) {
            const col = colliders[i]
            const pos = positions[i]

            // Draw collider
            ctx.strokeRect(pos.x, pos.y, col.width, col.height)
            // Draw position
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI)
            ctx.fill()
        }
    }
}
