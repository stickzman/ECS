export default {
    update: function(ecs) {
        const canvas = ecs.canvas
        canvas.ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}
