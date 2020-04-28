function colliding(pos, col, otherPos, otherCol) {
    return pos.x < otherPos.x + otherCol.width
            && pos.x + col.width > otherPos.x
            && pos.y < otherPos.y + otherCol.height
            && pos.y + col.height > otherPos.y
}

function resolve(pos, col, vel, otherPos, otherCol) {
    let deltaX
    if (pos.x + col.width/2 < otherPos.x + otherCol.width/2) {
        deltaX = otherPos.x - (pos.x + col.width)
    } else {
        deltaX = otherPos.x + otherCol.width - pos.x
    }
    let deltaY
    if (pos.y + col.height/2 < otherPos.y + otherCol.height/2) {
        deltaY = otherPos.y - (pos.y + col.height)
    } else {
        deltaY = otherPos.y + otherCol.height - pos.y
    }

    if (Math.abs(deltaX) < Math.abs(deltaY)) {
        pos.x += deltaX
        vel.x = 0
    } else {
        pos.y += deltaY
        vel.y = 0
    }
}

export default {
    init(ecs) {
        this.movable = ecs.getQuery({
            all: ["Position", "BoundingBox", "Velocity"]
        })
        this.stationary = ecs.getQuery({
            all: ["Position", "BoundingBox"],
            none: ["Velocity"]
        })
        this.triggers = ecs.getQuery({
            all: ["Position", "BoundingBox"],
            tags: ["trigger"]
        })
    },
    update(ecs, deltaTime) {
        const {
            Position: movePos,
            BoundingBox: moveCol,
            Velocity
        } = this.movable.components
        const {Position: stayPos, BoundingBox: stayCol} = this.stationary.components
        for (let i = 0; i < movePos.length; i++) {
            const pos = movePos[i]
            const col = moveCol[i]
            const vel = Velocity[i]
            // Check against stationary entities
            for (let j = 0; j < stayPos.length; j++) {
                const otherPos = stayPos[j]
                const otherCol = stayCol[j]

                if (colliding(pos, col, otherPos, otherCol)) {
                    // TODO: Emit Event
                    resolve(pos, col, vel, otherPos, otherCol)
                }
            }
            // Check against moving entities
            for (let j = 0; j < movePos.length; j++) {
                const otherPos = movePos[j]
                if (otherPos === pos) continue // Skip check if same entity
                const otherCol = moveCol[j]

                if (colliding(pos, col, otherPos, otherCol)) {
                    // console.log("moving Collision Detected!", pos._entity.id, otherPos._entity.id)
                    // TODO: Emit Event
                }
            }
        }
    }
}
