export default {
    query: {
        components: ["Shape", "Position"]
    },
    update(ecs, COLUMNS) {
        const canvas = ecs.singletons.canvas
        const { Shape, Position } = COLUMNS
        for (let i = 0; i < Shape.length; i++) {
            const shape = Shape[i]
            const pos = Position[i]

            canvas.ctx.fillStyle = shape.color
            switch (shape.type) {
                case shape.TYPES.square: {
                    canvas.ctx.fillRect(pos.x, pos.y, shape.width, shape.height)
                    break;
                }
                case shape.TYPES.triangle: {

                    break;
                }
                case shape.TYPES.circle: {

                    break;
                }
            }
        }
    }
}
