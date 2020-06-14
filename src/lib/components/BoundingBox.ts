export class BoundingBox {
    touching = new Set()
    size: { x: number; y: number }

    constructor(width: number, height: number = width) {
        this.size = { x: width, y: height }
    }

    get width() {
        return this.size.x
    }
    set width(w) {
        this.size.x = w
    }

    get height() {
        return this.size.y
    }
    set height(h) {
        this.size.y = h
    }

    get half() {
        return { x: this.size.x/2, y: this.size.y/2 }
    }
}
