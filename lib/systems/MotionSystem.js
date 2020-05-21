export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Position", "Velocity"],
            optional: ["Acceleration"]
        })
    },
    fixedUpdate(ecs, deltaTime) {
        for (let i = 0; i < this.query.tuples.length; i++) {
            const e = this.query.tuples[i]
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
