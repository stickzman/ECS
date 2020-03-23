const COMP_NON_CLASS = "Component must be a class or class name (string)"

export default class Query {
    _entityMap = new Map()
    entities = []
    components = {}

    constructor(Components, entities) {
        Components = (Components) ? Components : []
        // Initialize componentTypes and component arrays with Component name
        for (var i = 0; i < Components.length; i++) {
            if (typeof Components[i] === "function") {
                Components[i] = Components[i].name
            } else if (typeof Components[i] !== "string") {
                throw new Error(COMP_NON_CLASS)
            }
            this.components[Components[i]] = []
        }
        this.componentTypes = Components

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
        for (var i = 0; i < this.componentTypes.length; i++) {
            const c = this.componentTypes[i]
            this.components[c].push(entity.components.get(c))
        }
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
