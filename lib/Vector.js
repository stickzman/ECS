export class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }
}
