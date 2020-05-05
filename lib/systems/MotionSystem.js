export default {
    init(ecs) {
        this.query = ecs.getQuery({
            all: ["Position", "Velocity"],
            optional: ["Acceleration"]
        })
    },
    fixedUpdate(ecs, deltaTime) {
        const { Acceleration, Position, Velocity } = this.query.components
        for (let i = 0; i < Position.length; i++) {
            const acc = Acceleration[i]
            const pos = Position[i]
            const vel = Velocity[i]

            if (acc) {
                vel.x += acc.x * (deltaTime / 1000)
                vel.y += acc.y * (deltaTime / 1000)
            }
            pos.x += vel.x * (deltaTime / 1000)
            pos.y += vel.y * (deltaTime / 1000)
        }
    }
}
