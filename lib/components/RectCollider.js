export class RectCollider {
    constructor(width, height) {
        this.width = width
        this.height = (height === undefined) ? width : height
    }
}
