export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Shape", "Position"]
        })
    },
    update(ecs) {
        const canvas = ecs.singletons.canvas
        const { Shape, Position, TestComp } = this.query.components
        for (let i = 0; i < Shape.length; i++) {
            const shape = Shape[i]
            const pos = Position[i]

            canvas.ctx.fillStyle = shape.color
            switch (shape.type) {
                case shape.TYPES.square: {
                    canvas.ctx.fillRect(pos.x, pos.y, shape.width, shape.height)
                    break;
                }
            }
        }
    }
}
