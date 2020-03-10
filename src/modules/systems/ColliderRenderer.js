export default function ColliderRenderer (components, singletons) {
    const ctx = singletons.canvas.ctx

    const positions = components.Position
    const colliders = components.RectCollider
    if (!ctx || !positions || !colliders)
        throw new Error(`ColliderRenderer requires components: canvas, Position, and RectCollider`)

    // Draw colliders
    ctx.strokeStyle = "#03fc24"
    ctx.lineWidth = 3
    colliders.forEach((col, id) => {
        const pos = positions[id]
        if (!pos) return

        ctx.strokeRect(pos.x, pos.y, col.width, col.height)
    })
}
