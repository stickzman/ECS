export class BoundingBox {
    touching = new Map()
    constructor(width, height) {
        this.width = width
        this.height = (height === undefined) ? width : height
    }
}
