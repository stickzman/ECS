import { PIXI } from "./pixi.js"

export class PixiRect {
    constructor(width = 10, height, color = 0) {
        if (!height) height = width
        this.graphic = new PIXI.Graphics()
        this.graphic.beginFill(color)
        this.graphic.drawRect(0, 0, 1, 1)
        this.graphic.endFill()
        this.width = width
        this.height = height
    }

    get width() {
        return this.graphic.width
    }
    set width(w) {
        this.graphic.width = w
    }

    get height() {
        return this.graphic.height
    }
    set height(h) {
        this.graphic.height = h
    }
}
