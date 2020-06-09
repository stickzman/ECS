import { PIXI } from "./pixi.js"

export default {
    config(ecs, config = {}) {
        PIXI.settings.ROUND_PIXELS = true
        const renderer = new PIXI.Renderer(config)
        ecs.extend("renderer", renderer)
        ecs.extend("camera", new Camera(renderer.view))

        // Add render view to page
        if (!config.selector) config.selector = "body"
        document.querySelector(config.selector).appendChild(renderer.view)
    },

    init(ecs) {
        if (!ecs.renderer) this.config(ecs, {}) // Run config if not yet run

        ecs.on("PixiRect_Added", (ev) => {
            ecs.camera.add(ev.component.graphic)
        })
        ecs.on("PixiRect_Removed", (ev) => {
            ev.component.graphic.destroy()
        })
        ecs.on("PixiCircle_Added", (ev) => {
            ecs.camera.add(ev.component.graphic)
        })
        ecs.on("PixiCircle_Removed", (ev) => {
            ev.component.graphic.destroy()
        })
    },

    update(ecs) {
        const rects = ecs.query({
            id: "renderRect",
            all: ["Position", "PixiRect"]
        })
        const circles = ecs.query({
            id: "renderCircle",
            all: ["Position", "PixiCircle"]
        })
        for (let i = 0; i < rects.length; i++) {
            const { Position, PixiRect } = rects[i]
            PixiRect.graphic.x = Position.x
            PixiRect.graphic.y = Position.y
        }
        for (let i = 0; i < circles.length; i++) {
            const { Position, PixiCircle } = circles[i]
            PixiCircle.graphic.x = Position.x + PixiCircle.radius/2
            PixiCircle.graphic.y = Position.y + PixiCircle.radius/2
        }

        ecs.renderer.render(ecs.camera.view)
    }

}

class Camera {
    _x = 0
    _y = 0
    _scale = 1

    constructor(viewport) {
        this.viewport = viewport

        // Doubles as rotation layers
        this.view = new PIXI.Container()
        this.view.x = viewport.width/2
        this.view.y = viewport.height/2
        this.view.pivot.x = viewport.width/2
        this.view.pivot.y = viewport.height/2

        // Camera panning/zooming layer
        this._translate = new PIXI.Container()
        this._translate.x = viewport.width/2
        this._translate.y = viewport.height/2
        this._translate.pivot.x = viewport.width/2
        this._translate.pivot.y = viewport.height/2
        this.view.addChild(this._translate)

        // Stores all objects in scene
        this._stage = new PIXI.Container()
        this._translate.addChild(this._stage)
    }

    get x() {
        return this._x
    }
    get y() {
        return this._y
    }

    set x(x) {
        this._x = x
        this._translate.x = this.viewport.width/2 - x
    }
    set y(y) {
        this._y = y
        this._translate.y = this.viewport.height/2 - y
    }

    get scale() {
        return this._scale
    }
    set scale(s) {
        this._scale = s
        this._translate.scale.x = s
        this._translate.scale.y = s
    }

    rotate(num, degrees) {
        if (degrees) {
            this.view.angle += num
        } else {
            this.view.rotation += num
        }
    }

    setRotation(num, degrees) {
        if (degrees) {
            this.view.angle = num
        } else {
            this.view.rotation = num
        }
    }

    getRotation(degrees) {
        if (degrees) return this.view.angle
        return this.view.rotation
    }



    add(sprite) {
        this._stage.addChild(sprite)
    }

    remove(sprite) {
        this._stage.removeChild(sprite)
    }
}
