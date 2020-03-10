export default class Canvas2D {
    constructor(canvasSelector) {
        this.$canvas = document.querySelector(canvasSelector)
        this.ctx = this.$canvas.getContext("2d")
    }

    get width() {
        return this.$canvas.width
    }

    get height() {
        return this.$canvas.height
    }

    clear() {
        this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height)
    }
}
