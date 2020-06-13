export const AABBCollisionSystem = {
    init(ecs) {
        ecs.on("BoundingBox_Removed", ev => {
            const movables = ecs.query({
                id: "movable",
                all: ["Position", "BoundingBox", "Velocity"]
            })
            for (const entity of movables) {
                if (entity.BoundingBox.touching.has(ev.component)) {
                    exitCollision(entity.BoundingBox, ev.component)
                }
            }
        })
    },
    fixedUpdate(ecs, deltaTime) {
        const movables = ecs.query({
            id: "movable",
            all: ["Position", "BoundingBox", "Velocity"]
        })
        const stationary = ecs.query({
            id: "stationary",
            all: ["Position", "BoundingBox"],
            none: ["Velocity"]
        })

        for (let i = 0; i < movables.length; i++) {
            const moveEntity = movables[i]
            const pos = moveEntity.Position
            const col = moveEntity.BoundingBox
            const vel = moveEntity.Velocity
            // Check against stationary entities
            for (let j = 0; j < stationary.length; j++) {
                const stayEntity = stationary[j]
                const otherPos = stayEntity.Position
                const otherCol = stayEntity.BoundingBox

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
            for (let j = 0; j < movables.length; j++) {
                const other = movables[j]
                if (other === moveEntity) continue // Skip check if same entity

                const otherPos = other.Position
                const otherCol = other.BoundingBox

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
    col.touching.add(otherCol)
    otherCol.touching.add(col)
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
