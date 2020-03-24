export default {
    requestedComponents: ["Position", "RectCollider"],
    onUpdate: function(components, singletons) {
        const ctx = singletons.canvas.ctx

        const positions = components.Position
        const colliders = components.RectCollider

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
