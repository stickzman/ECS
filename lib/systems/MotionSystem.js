export default {
    fixedUpdate(ecs, deltaTime) {
        const tuples = ecs.query({
            id: "motionSystem",
            all: ["Position", "Velocity"],
            optional: ["Acceleration"]
        })
        for (let i = 0; i < tuples.length; i++) {
            const e = tuples[i]
            const acc = e.Acceleration
            const pos = e.Position
            const vel = e.Velocity

            if (acc) {
                vel.x += acc.x * (deltaTime / 1000)
                vel.y += acc.y * (deltaTime / 1000)
            }
            pos.x += vel.x * (deltaTime / 1000)
            pos.y += vel.y * (deltaTime / 1000)
        }
    }
}
