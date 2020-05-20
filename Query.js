const COMP_NON_CLASS = "Component must be a class or class name (string)"

export default class Query {
    components = {}

    _requiredComponents = []
    _optionalComponents = []
    _bannedComponents = []
    _entityMap = new Map()
    _entities = []
    _tags = []

    constructor(entities, query) {
        //Initialize the component type containers
        if (query.all) {
            const reqComps = (Array.isArray(query.all)) ? query.all : [query.all]

            for (const rComp of reqComps) {
                if (typeof rComp === "function") {
                    rComp = rComp.name
                } else if (typeof rComp !== "string") {
                    throw new Error(COMP_NON_CLASS)
                }
                this.components[rComp] = []
                this._requiredComponents.push(rComp)
            }
        }
        if (query.optional) {
            const optComps = (Array.isArray(query.optional)) ? query.optional : [query.optional]

            for (const oComp of optComps) {
                if (typeof oComp === "function") {
                    oComp = oComp.name
                } else if (typeof oComp !== "string") {
                    throw new Error(COMP_NON_CLASS)
                }
                this.components[oComp] = []
                this._optionalComponents.push(oComp)
            }
        }
        if (query.none) {
            const bannedComps = (Array.isArray(query.none)) ? query.none : [query.none]

            for (const bComp of bannedComps) {
                if (typeof bComp === "function") {
                    bComp = bComp.name
                } else if (typeof bComp !== "string") {
                    throw new Error(COMP_NON_CLASS)
                }
                this._bannedComponents.push(bComp)
            }
        }

        if (query.tags)
            this._tags = (Array.isArray(query.tags)) ? query.tags : [query.tags]

        // Find relevant entities and add their components to the query
        for (const entity of entities) {
            if (this.match(entity)) this.addEntity(entity)
        }
    }

    get length() {
        return this._entities.length
    }

    hasEntity(entity) {
        return this._entityMap.has(entity.id)
    }

    addEntity(entity) {
        if (this.hasEntity(entity)) {
            // If query already contains entity and this query
            // has optional components, remove and re-add the entity
            // to ensure optional components are updated
            if (!this._optionalComponents.length) return
            this.removeEntity(entity)
            this.addEntity(entity)
        } else {
            this._entityMap.set(entity.id, entity)
            this._entities.push(entity)
            for (const comp of this._requiredComponents) {
                this.components[comp].push(entity.getComponent(comp))
            }
            for (const comp of this._optionalComponents) {
                this.components[comp].push(entity.getComponent(comp))
            }
        }
    }

    removeEntity(entity) {
        if (!this._entityMap.delete(entity.id)) return

        const i = this._entities.indexOf(entity)
        this._entities.splice(i, 1)
        Object.keys(this.components).forEach(c => {
            this.components[c].splice(i, 1)
        })
    }

    match(entity) {
        return entity.hasAllTags(this._tags)
                && entity.hasAllComponents(this._requiredComponents)
                && entity.hasNoneComponents(this._bannedComponents)
    }
}
