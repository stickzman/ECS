export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Position", "BoundingBox"]
        })
    },
    update: function(ecs) {
        const ctx = ecs.state.canvas.ctx

        const positions = this.query.components.Position
        const colliders = this.query.components.BoundingBox

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
