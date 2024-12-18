import { Entity } from "./Entity.js"
import { Query } from "./Query.js"
import { EventManager } from "./EventManager.js"

const ENTITY_ID_NON_INT = "Entity ID must be an integer"
const COMP_NON_CLASS = "Component must be a class"

export class ECS {
    fixedTimeStep = 1000/60

    _nextEntityId = 0
    _eventManager = new EventManager()
    _queries = new Map()
    _entities = []
    _initFuncs = []
    _fixedFuncs = []
    _updateFuncs = []
    _lastTickTime = null

    _fixedDelta = 0
    _maxFixedDelta = 133
    _fuzzyDeltaThreshold = 1
    _reservedKeys = new Set(Object.getOwnPropertyNames(this)
                            .concat(Object.getOwnPropertyNames(
                                Object.getPrototypeOf(this))))

    constructor() { }

    // Extend ECS instance with singleton components/utility functions
    extend(name, data) {
        if (this._reservedKeys.has(name))
            throw new Error(name + "is a reserved property within ECS")
        this[name] = data
        return data
    }

    // Systems execute in the order they are registered
    // SYSTEM FORMAT: { init(), update(), fixedUpdate() }
    registerSystem(system) {
        if (typeof system !== "object")
            throw new TypeError(`System must be an object`)

        if (system.init) this.on("init", system.init)
        if (system.update) this.on("update", system.update)
        if (system.fixedUpdate) this.on("fixedUpdate", system.fixedUpdate)
    }

    // Query entities, accessing from cache if possible
    // queryParams = { id, all, optional, none, tags }
    query(queryParams) {
        let query
        if (queryParams.id) query = this._queries.get(queryParams.id)

        if (!query) {
            query = new Query(this._entities, queryParams)
            // Add to query list so it can be cached/updated with future changes
            if (queryParams.id) this._queries.set(queryParams.id, query)
        }

        return query.tuples
    }

    createEntity() {
        const id = this._nextEntityId++
        this._entities[id] = new Entity(id, this)
        this.emitImmediate("Entity_Created", { entity: this._entities[id], id: id })
        return this._entities[id]
    }

    removeEntity(id) {
        if (typeof id === "object") id = id.id
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return false

        const e = this._entities[id]
        for (const [key, query] of this._queries) {
            query.removeEntity(e)
        }

        for (const [compName, comp] of e._components) {
            this.emitImmediate(compName + "_Removed", { component: comp, entity: e })
        }
        for (const tag of e._tags) {
            this.emitImmediate(tag + "_Removed", { tag: tag, entity: e })
        }

        delete this._entities[id]
        this.emitImmediate("Entity_Removed", { entity: e, id: id })
        return true
    }

    addTag(id, tag) {
        if (typeof id === "object") id = id.id
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return false

        const e = this._entities[id]
        e._addTag(tag)
        for (const [key, query] of this._queries) {
            if (query.hasEntity(e)) continue
            if (query.match(e)) query.addEntity(e)
        }

        this.emitImmediate(tag + "_Added", { tag: tag, entity: e })
    }

    removeTag(id, tag) {
        if (typeof id === "object") id = id.id
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return false

        const e = this._entities[id]
        const existed = e._removeTag(tag)

        if (existed) {
            // Update entity component queries
            for (const [key, query] of this._queries) {
                if (!query.hasEntity(e) || query.match(e)) continue
                query.removeEntity(e)
            }

            this.emitImmediate(tag + "_Removed", { tag: tag, entity: e })
        }
        return existed
    }

    addComponent(id, Component, ...args) {
        if (typeof id === "object") id = id.id
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
        Object.seal(comp)
        e._addComponent(comp)

        // Update entity component queries
        for (const [key, query] of this._queries) {
            if (query.match(e)) {
                query.addEntity(e)
            } else {
                query.removeEntity(e)
            }
        }

        this.emitImmediate(Component.name + "_Added", { component: comp, entity: e })
        return comp
    }

    removeComponent(id, Component) {
        if (typeof id === "object") id = id.id
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (typeof Component !== "function" && typeof Component !== "string")
            throw new Error(COMP_NON_CLASS)
        if (this._entities[id] === undefined)
            throw new Error("Entity does not exist")

        const e = this._entities[id]
        const removedComp = e._removeComponent(Component)

        if (removedComp) {
            // Update entity component queries
            for (const [key, query] of this._queries) {
                if (query.match(e)) {
                    query.addEntity(e)
                } else {
                    query.removeEntity(e)
                }
            }

            this.emitImmediate((Component.name || Component) + "_Removed",
                                { component: removedComp, entity: e })
        }
        return removedComp !== undefined
    }

    // Attach event listeners (custom or lifecycle)
    // Lifecycle events:
    // init, update, fixedUpdate
    // Entity_Created, Entity_Removed
    // <Component_Name>_Added, <Component_Name>_Removed
    // <Tag_Name>_Added, <Tag_Name>_Removed
    on(eventType, callback) {
        if (eventType === "update") {
            this._updateFuncs.push(callback)
        } else if (eventType === "fixedUpdate") {
            this._fixedFuncs.push(callback)
        } else if (eventType === "init") {
            this._initFuncs.push(callback)
        } else {
            this._eventManager.addListener(eventType, callback)
        }
    }

    off(eventType, callback) {
        this._eventManager.removeListener(eventType, callback)
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
        for (const init of this._initFuncs) {
            init(this)
        }
        // Execute any events queued before this first tick
        this._eventManager.initialize()
        this._lastTickTime = performance.now()
    }

    // Passing in component arrays, singleton components, and input action list
    _updateSystems(resetTime?) {
        if (resetTime) {
            // Allow last tick to be reset
            this._lastTickTime = performance.now()
            this._fixedDelta = 0
        }
        const currTime = performance.now()
        const deltaTime = currTime - this._lastTickTime

        // Snap delta time to fixed update when close enough
        let snappedDeltaTime
        if (Math.abs(deltaTime-1000/60) < this._fuzzyDeltaThreshold) {
            snappedDeltaTime = 1000/60
        } else if (Math.abs(deltaTime-1000/30) < this._fuzzyDeltaThreshold) {
            snappedDeltaTime = 1000/30
        } else if (Math.abs(deltaTime-1000/120) < this._fuzzyDeltaThreshold) {
            snappedDeltaTime = 1000/120
        } else {
            snappedDeltaTime = deltaTime
        }
        this._fixedDelta += snappedDeltaTime
        // Clamp fixedDelta to a max to avoid the slow update spiral of death
        this._fixedDelta = Math.min(this._fixedDelta, this._maxFixedDelta)

        // Dispatch any remaining events from last frame
        if (this._eventManager.queuedEvent) this._eventManager.dispatchQueue()

        // Execute fixedUpdates until caught up
        while (this._fixedDelta > this.fixedTimeStep) {
            this._fixedDelta -= this.fixedTimeStep
            for (const fixedUpdate of this._fixedFuncs) {
                fixedUpdate(
                    this,
                    this.fixedTimeStep,
                    currTime - this._fixedDelta
                )
                if (this._eventManager.queuedEvent) this._eventManager.dispatchQueue()
            }
        }

        // execute update functions
        for (const update of this._updateFuncs) {
            update(this, deltaTime, currTime)
            if (this._eventManager.queuedEvent) this._eventManager.dispatchQueue()
        }

        this._lastTickTime = currTime
    }
}
