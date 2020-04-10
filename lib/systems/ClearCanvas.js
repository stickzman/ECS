export default {
    onUpdate: function(ecs) {
        const canvas = ecs.singletons.canvas
        canvas.ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}
