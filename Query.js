const COMP_NON_CLASS = "Component must be a class or class name (string)"

export default class Query {
    components = {}
    componentTypes = []
    _entities = []
    _tags = []
    _entityMap = new Map()

    constructor(entities, Components, tags) {
        Components = (Array.isArray(Components)) ? Components : [Components]
        // Initialize componentTypes and component arrays with Component name
        for (let i = 0; i < Components.length; i++) {
            if (typeof Components[i] === "function") {
                Components[i] = Components[i].name
            } else if (typeof Components[i] !== "string") {
                throw new Error(COMP_NON_CLASS)
            }
            this.components[Components[i]] = []
        }
        this.componentTypes = Components

        if (tags) this._tags = (Array.isArray(tags)) ? tags : [tags]

        // Find relevant entities and add their components to the query
        for (const entity of entities) {
            if (!entity.hasAllTags(this._tags)) continue
            if (!entity.hasAllComponents(Components)) continue
            this.addEntity(entity)
        }
    }

    addEntity(entity) {
        if (this.hasEntity(entity)) return

        this._entityMap.set(entity.id, entity)
        this._entities.push(entity)
        for (const compType of this.componentTypes) {
            this.components[compType].push(entity.components.get(compType))
        }
    }

    hasEntity(entity) {
        return this._entityMap.has(entity.id)
    }

    removeEntity(entity) {
        if (!this._entityMap.delete(entity.id)) return

        const i = this._entities.indexOf(entity)
        this._entities.splice(i, 1)
        this.componentTypes.forEach(c => {
            this.components[c].splice(i, 1)
        })
    }

    match(entity) {
        return entity.hasAllTags(this._tags) && entity.hasAllComponents(this.componentTypes)
    }
}
