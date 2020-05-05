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
        ecs.on("BoundingBox_Removed", ev => {
            for (const col of this.movable.components.BoundingBox) {
                if (col.touching.has(ev.component)) {
                    exitCollision(col, ev.component)
                }
            }
        })
    },
    fixedUpdate(ecs, deltaTime) {
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

                if (isColliding(pos, col, otherPos, otherCol)) {
                    resolve(pos, col, vel, otherPos, otherCol)

                    if (!wasColliding(col, otherCol)) {
                        enterCollision(col, otherCol)
                    }
                } else if (wasColliding(col, otherCol)) {
                    exitCollision(col, otherCol)
                }
            }
            // Check against moving entities
            for (let j = 0; j < movePos.length; j++) {
                const otherPos = movePos[j]
                if (otherPos === pos) continue // Skip check if same entity
                const otherCol = moveCol[j]

                if (isColliding(pos, col, otherPos, otherCol)) {
                    if (!wasColliding(col, otherCol)) {
                        enterCollision(col, otherCol)
                    }
                } else if (wasColliding(col, otherCol)) {
                    exitCollision(col, otherCol)
                }
            }
        }
    }
}

function isColliding(pos, col, otherPos, otherCol) {
    return pos.x <= otherPos.x + otherCol.width
            && pos.x + col.width >= otherPos.x
            && pos.y <= otherPos.y + otherCol.height
            && pos.y + col.height >= otherPos.y
}

function wasColliding(col1, col2) {
    return col1.touching.has(col2) || col2.touching.has(col1)
}

function enterCollision(col, otherCol) {
    col.touching.set(otherCol, true)
    otherCol.touching.set(col, true)
    ecs.emit("collisionEnter", {
        collider: col,
        entity: col._entity,
        otherCollider: otherCol,
        otherEntity: otherCol._entity
    })
}

function exitCollision(col, otherCol) {
    col.touching.delete(otherCol)
    otherCol.touching.delete(col)
    ecs.emit("collisionExit", {
        collider: col,
        entity: col._entity,
        otherCollider: otherCol,
        otherEntity: otherCol._entity
    })
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
