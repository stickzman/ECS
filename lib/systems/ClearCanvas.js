export default {
    update: function(ecs) {
        const canvas = ecs.singletons.canvas
        canvas.ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}
