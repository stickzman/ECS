import Entity from "./Entity.js"
import Query from "./Query.js"
import EventManager from "./EventManager.js"

const ENTITY_ID_NON_INT = "Entity ID must be an integer"
const COMP_NON_CLASS = "Component must be a class"

export default class ECS {
    singletons = {}

    _nextEntityId = 0
    _eventManager = new EventManager()
    _queries = new Map()
    _entities = []
    _systems = []
    _lastTickTime = null

    constructor() { }

    // SYSTEM FORMAT: { requestedComponents, init(), update() }
    // Systems execute in the order they are registered
    registerSystem(system) {
        if (typeof system !== "object")
            throw new TypeError(`System must be an object`)

        if (system.query) {
            const Components = system.query.components
            const tags = system.query.tags

            // Generates/tracks new query if necessary
            system._query = this._getQuery(Components, tags)
        }

        Object.freeze(system)
        this._systems.push(system)
    }

    _getQuery(Components, tags) {
        const key = this._getQueryKey(Components, tags)
        if (this._queries.has(key)) return this._queries(key)

        const query = new Query(this._entities, Components, tags)
        // Add to query list if query is not empty
        if (query.componentTypes.length) this._queries.set(key, query)
        return query
    }

    _getQueryKey(Components, tags) {
        Components = (Array.isArray(Components)) ? Components : [Components]
        tags = (Array.isArray(tags)) ? tags : [tags]

        // Get names of component classes
        Components = Components.map(c => (typeof c === "function") ? c.name : c)
        return Components.sort().join(",") + "#" + tags.sort().join(",")
    }

    registerSingleton(component, name) {
        if (typeof component !== "object")
            throw new TypeError("Singleton components must be object")
        name = name || component.constructor.name
        this.singletons[name] = component
        return component
    }

    createEntity() {
        const id = this._nextEntityId++
        this._entities[id] = new Entity(id)
        return id
    }

    removeEntity(id) {
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return false

        const e = this._entities[id]
        for (const [key, query] of this._queries) {
            query.removeEntity(e)
        }
        delete this._entities[id]
        return true
    }

    addTag(id, tag) {
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return false

        const e = this._entities[id]
        e.addTag(tag)
        for (const [key, query] of this._queries) {
            if (query.hasEntity(e)) continue
            if (query.match(e)) query.addEntity(e)
        }
    }

    removeTag(id, tag) {
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return false

        const e = this._entities[id]
        const existed = e.removeTag(tag)

        if (existed) {
            // Update entity component queries
            for (const [key, query] of this._queries) {
                if (!query.hasEntity(e) || query.match(e)) continue
                query.removeEntity(e)
            }
        }
        return existed
    }

    addComponent(id, Component, ...args) {
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (typeof Component !== "function")
            throw new Error(COMP_NON_CLASS)
        if (this._entities[id] === undefined)
            throw new Error("Entity does not exist")

        // Create component and add to entity
        const e = this._entities[id]
        const comp = new Component(...args)
        comp._entity = e
        e.addComponent(comp)

        // Update entity component queries
        for (const [key, query] of this._queries) {
            if (query.hasEntity(e)) continue
            if (query.match(e)) query.addEntity(e)
        }
        return comp
    }

    removeComponent(id, Component) {
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (typeof Component !== "function")
            throw new Error(COMP_NON_CLASS)
        if (this._entities[id] === undefined)
            throw new Error("Entity does not exist")

        const e = this._entities[id]
        const existed = e.removeComponent(Component)

        if (existed) {
            // Update entity component queries
            for (const [key, query] of this._queries) {
                if (!query.hasEntity(e) || query.match(e)) continue
                query.removeEntity(e)
            }
        }
        return existed
    }

    on(eventType, callback) {
        this._eventManager.addObserver(eventType, callback)
    }

    off(eventType, callback) {
        this._eventManager.removeObserver(eventType, callback)
    }

    emit(eventType, data) {
        this._eventManager.addToQueue(eventType, data)
    }

    emitImmediate(eventType, data) {
        this._eventManager.dispatchEvent(eventType, data)
    }

    // Call init function first time systems updated, then swap to real function
    updateSystems() {
        this.init()
        this.updateSystems = this._updateSystems
        this._updateSystems()
    }

    init() {
        // Call every system's init function
        for (const system of this._systems) {
            if (!system.init) continue
            system.init(
                this,
                (system._query) ? system._query.components : undefined
            )
        }
        this._lastTickTime = performance.now()
    }

    // Passing in component arrays, singleton components, and input action list
    _updateSystems() {
        const currTime = performance.now()
        const deltaTime = currTime - this._lastTickTime
        if (this._eventManager.newEvent) this._eventManager.dispatchQueue()
        for (const system of this._systems) {
            system.update(
                this,
                (system._query) ? system._query.components : undefined,
                deltaTime,
                currTime
            )
            if (this._eventManager.newEvent) this._eventManager.dispatchQueue()
        }
        this._lastTickTime = currTime
    }
}
