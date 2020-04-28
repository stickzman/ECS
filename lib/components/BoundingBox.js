export class BoundingBox {
    constructor(width, height) {
        this.width = width
        this.height = (height === undefined) ? width : height
    }
}
