import { COMP_NON_CLASS } from "./Errors.js"

export default class Query {
    _entityMap = new Map()
    entities = []
    components = {}

    constructor(Components, entities) {
        Components = (Components) ? Components : []
        // Initialize componentTypes and component arrays
        this.componentTypes = Components
        Components.forEach(c => {
            if (typeof c !== "function") throw new Error(COMP_NON_CLASS)
            this.components[c] = []
        })

        // Find relevant entities and add their components to the query
        entities.forEach(entity => {
            if (!entity.hasAllComponents(Components)) return
            this.addEntity(entity)
        })
    }

    hasEntity(entity) {
        return this._entityMap.has(entity.id)
    }

    addEntity(entity) {
        if (this.hasEntity(entity)) return

        this._entityMap.set(entity.id, entity)
        this.entities.push(entity)
        this.componentTypes.forEach(c => {
            this.components[c].push(entity.components.get(c))
        })
    }

    removeEntity(entity) {
        if (!this._entityMap.delete(entity.id)) return

        const i = this.entities.indexOf(entity)
        this.entities.splice(i, 1)
        this.componentTypes.forEach(c => {
            this.components[c].splice(i, 1)
        })
    }
}
