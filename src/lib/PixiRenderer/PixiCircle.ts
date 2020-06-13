import * as PIXI from "pixi.js"

export class PixiCircle {
    constructor(radius = 10, color = 0) {
        this.graphic = new PIXI.Graphics()
        this.graphic.beginFill(color)
        this.graphic.drawCircle(0, 0, 10)
        this.graphic.endFill()
        this.graphic.width = radius
        this.graphic.height = radius
    }

    get radius() {
        return this.graphic.width
    }
    set radius(r) {
        this.graphic.width = r
        this.graphic.height = r
    }
}
