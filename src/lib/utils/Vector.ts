export class Vector {
    constructor(public x, public y) { }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }
}
