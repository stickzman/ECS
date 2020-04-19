export class Shape {
    TYPES = {
        "rectangle": 1,
        "square": 1,
    }
    constructor(type, width, height, color) {
        this.type = this.TYPES[type.toLowerCase()]
        this.width = width
        this.height = height || width
        this.color = color || "#000"
    }
}
