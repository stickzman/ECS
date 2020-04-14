export class Canvas2D {
    constructor(width, height, selector) {
        selector = (selector) ? selector : "body"
        width = (width) ? width : 600
        height = (height) ? height : width

        this.parent = document.querySelector(selector)
        this.$canvas = document.createElement("canvas")
        this.$canvas.width = width
        this.$canvas.height = height
        this.parent.appendChild(this.$canvas)
        this.ctx = this.$canvas.getContext("2d")
    }

    get width() {
        return this.$canvas.width
    }

    get height() {
        return this.$canvas.height
    }
}