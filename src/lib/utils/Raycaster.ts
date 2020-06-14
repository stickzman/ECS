// Works exclusively with AABB
export const Raycaster = {
    // Get all intersections of a line segment from origin to origin+delta
    cast(ecs, origin, delta, includeExits) {
        const tuples = ecs.query({id: "raycast", all: ["Position", "BoundingBox"]})
        const signX = (delta.x >= 0) ? 1 : -1
        const signY = (delta.y >= 0) ? 1 : -1

        const inverseDeltaX = 1/delta.x
        const inverseDeltaY = 1/delta.y

        const hits = []
        for (let i = 0; i < tuples.length; i++) {
            const entity = tuples[i]
            const pos = entity.Position
            const box = entity.BoundingBox

            if (this._testIntersection(
                    origin,
                    inverseDeltaX,
                    inverseDeltaY,
                    signX,
                    signY,
                    pos,
                    box,
                    includeExits
                )) {
                hits.push(box) // Add colliding box to results
            }
        }

        return hits
    },

    // Returns true if line segment intersects anything
    hitTest(ecs, origin, delta, includeExits) {
        const signX = (delta.x >= 0) ? 1 : -1
        const signY = (delta.y >= 0) ? 1 : -1

        const inverseDeltaX = 1/delta.x
        const inverseDeltaY = 1/delta.y

        const tuples = ecs.query({id: "raycast", all: ["Position", "BoundingBox"]})
        for (let i = 0; i < tuples.length; i++) {
            const entity = tuples[i]
            const pos = entity.Position
            const box = entity.BoundingBox

            if (this._testIntersection(
                    origin,
                    inverseDeltaX,
                    inverseDeltaY,
                    signX,
                    signY,
                    pos,
                    box,
                    includeExits
                )) {
                return true
            }
        }

        return false
    },

    _testIntersection(origin, inverseDeltaX, inverseDeltaY,
                        signX, signY, pos, box, includeExits) {
        const nearX = pos.x + box.half.x - (signX * box.half.x)
        const nearY = pos.y + box.half.y - (signY * box.half.y)
        const farX = pos.x + box.half.x + (signX * box.half.x)
        const farY = pos.y + box.half.y + (signY * box.half.y)

        const nearTimeX = (nearX - origin.x) * inverseDeltaX
        const nearTimeY = (nearY - origin.y) * inverseDeltaY
        const farTimeX = (farX - origin.x) * inverseDeltaX
        const farTimeY = (farY - origin.y) * inverseDeltaY

        if (nearTimeX > farTimeY || nearTimeY > farTimeX) return false

        const nearTime = (nearTimeX > nearTimeY) ? nearTimeX : nearTimeY
        const farTime = (farTimeX < farTimeY) ? farTimeX : farTimeY

        if (nearTime >= 1 || farTime <= 0) return false
        if (!includeExits && nearTime < 0) return false
        return true
    }
}
