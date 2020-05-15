export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Shape", "Position"]
        })
    },
    update(ecs) {
        const ctx = ecs.globals.canvas.ctx
        const { Shape, Position, TestComp } = this.query.components
        for (let i = 0; i < Shape.length; i++) {
            const shape = Shape[i]
            const pos = Position[i]

            ctx.fillStyle = shape.color
            switch (shape.type) {
                case shape.TYPES.rectangle: {
                    ctx.fillRect(pos.x, pos.y, shape.width, shape.height)
                    break;
                }
                case shape.TYPES.triangle: {
                    ctx.beginPath()
                    ctx.moveTo(pos.x, pos.y + shape.height)
                    ctx.lineTo(pos.x + shape.width/2, pos.y)
                    ctx.lineTo(pos.x + shape.width, pos.y + shape.height)
                    ctx.fill()
                    break;
                }
                case shape.TYPES.circle: {
                    ctx.beginPath()
                    ctx.arc(pos.x + shape.width/2, pos.y + shape.width/2,
                                shape.width/2, 0, 2 * Math.PI)
                    ctx.fill()
                    break;
                }
            }
        }
    }
}
