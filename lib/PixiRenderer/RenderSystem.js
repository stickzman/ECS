import { PIXI } from "./pixi.js"

export default {
    config(ecs, config = {}) {
        PIXI.settings.ROUND_PIXELS = true
        const renderer = new PIXI.Renderer(config)
        ecs.extend("renderer", renderer)
        ecs.extend("stage", new PIXI.Container())

        // Add render view to page
        if (!config.selector) config.selector = "body"
        document.querySelector(config.selector).appendChild(renderer.view)
    },

    init(ecs) {
        if (!ecs.renderer) this.config(ecs, {}) // Run config if not yet run

        ecs.on("PixiRect_Added", (ev) => {
            ecs.stage.addChild(ev.component.graphic)
        })
        ecs.on("PixiRect_Removed", (ev) => {
            ev.component.graphic.destroy()
        })
        ecs.on("PixiCircle_Added", (ev) => {
            ecs.stage.addChild(ev.component.graphic)
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

        ecs.renderer.render(ecs.stage)
    }

}
