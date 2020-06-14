import * as PIXI from "pixi.js"

export class PixiRect {
    graphic: PIXI.Graphics

    constructor(width = 10, height = width, color = 0) {
        this.graphic = new PIXI.Graphics()
        this.graphic.beginFill(color)
        this.graphic.drawRect(0, 0, 1, 1)
        this.graphic.endFill()
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
