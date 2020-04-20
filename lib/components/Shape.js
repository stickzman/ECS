export class Shape {
    TYPES = {
        "rectangle": 1,
        "triangle": 2,
        "circle": 3,
    }
    constructor(type, width, height, color) {
        this.type = this.TYPES[type.toLowerCase()]
        if (this.type === undefined) throw new Error("Unknown Shape type")
        this.width = width
        this.height = height || width
        this.color = color || "#000"
    }
}
