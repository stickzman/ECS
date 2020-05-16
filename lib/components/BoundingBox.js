export class BoundingBox {
    touching = new Set()
    constructor(width, height) {
        this.width = width
        this.height = (height === undefined) ? width : height
    }
}
