export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Position", "RectCollider"]
        })
    },
    update: function(ecs) {
        const ctx = ecs.singletons.canvas.ctx

        const positions = this.query.components.Position
        const colliders = this.query.components.RectCollider

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
