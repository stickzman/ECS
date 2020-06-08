export default {
    update(ecs) {
        const tuples = ecs.query({ id: "shapeRenderer", all: ["Shape", "Position"] })
        const ctx = ecs.canvas.ctx
        for (let i = 0; i < tuples.length; i++) {
            const entity = tuples[i]
            const shape = entity.Shape
            const pos = entity.Position

            const x = pos.x
            const y = pos.y
            const width = shape.width
            const height = shape.height

            ctx.fillStyle = shape.color
            switch (shape.type) {
                case shape.TYPES.rectangle: {
                    ctx.fillRect(x, y, width, height)
                    break;
                }
                case shape.TYPES.triangle: {
                    ctx.beginPath()
                    ctx.moveTo(x, y + height)
                    ctx.lineTo(x + width/2, y)
                    ctx.lineTo(x + width, y + height)
                    ctx.fill()
                    break;
                }
                case shape.TYPES.circle: {
                    ctx.beginPath()
                    ctx.arc(x + width/2, y + width/2,
                                width/2, 0, 2 * Math.PI)
                    ctx.fill()
                    break;
                }
            }
        }
    }
}
