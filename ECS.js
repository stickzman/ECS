import Entity from "./Entity.js"
import Query from "./Query.js"
import EventManager from "./EventManager.js"

const ENTITY_ID_NON_INT = "Entity ID must be an integer"
const COMP_NON_CLASS = "Component must be a class"

export default class ECS {
    globals = {}
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

    constructor() { }

    // Systems execute in the order they are registered
    // SYSTEM FORMAT: { init(), update(), fixedUpdate() }
    registerSystem(system) {
        if (typeof system !== "object")
            throw new TypeError(`System must be an object`)

        if (system.init) this.on("init", system.init.bind(system))
        if (system.update) this.on("update", system.update.bind(system))
        if (system.fixedUpdate) this.on("fixedUpdate", system.fixedUpdate.bind(system))
    }

    getQuery(query) {
        const key = this._getQueryKey(query)
        if (this._queries.has(key)) return this._queries.get(key)

        query = new Query(this._entities, query)
        // Add to query list so it can be updated with future changes
        this._queries.set(key, query)
        return query
    }

    _getQueryKey(query) {
        let reqComps = (Array.isArray(query.all)) ? query.all : [query.all]
        let optComps = (Array.isArray(query.optional)) ? query.optional : [query.optional]
        let bannedComps = (Array.isArray(query.none)) ? query.none : [query.none]
        const tags = (Array.isArray(query.tags)) ? query.tags : [query.tags]

        // Get names of component classes
        reqComps = reqComps.map(c => (typeof c === "function") ? c.name : c)
        optComps = optComps.map(c => (typeof c === "function") ? c.name : c)
        bannedComps = bannedComps.map(c => (typeof c === "function") ? c.name : c)
        return reqComps.sort().join(",")
                + "|" + optComps.sort().join(",")
                + "!" + bannedComps.sort().join(",")
                + "#" + tags.sort().join(",")
    }

    createEntity() {
        const id = this._nextEntityId++
        this._entities[id] = new Entity(id)
        this.emitImmediate("Entity_Created", { entity: this._entities[id], id: id })
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
        this.emitImmediate("Entity_Deleted", { entity: e, id: id })
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

        this.emitImmediate(tag + "_Added", { tag: tag, entity: e })
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

            this.emitImmediate(tag + "_Removed", { tag: tag, entity: e })
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
        Object.seal(comp)
        e.addComponent(comp)

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
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (typeof Component !== "function" && typeof Component !== "string")
            throw new Error(COMP_NON_CLASS)
        if (this._entities[id] === undefined)
            throw new Error("Entity does not exist")

        const e = this._entities[id]
        const removedComp = e.removeComponent(Component)

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
        this._lastTickTime = performance.now()
    }

    // Passing in component arrays, singleton components, and input action list
    _updateSystems(resetTime) {
        // Allow last tick to be reset
        if (resetTime) {
            this._lastTickTime = performance.now()
            this._fixedDelta = 0
        }
        const currTime = performance.now()
        const deltaTime = currTime - this._lastTickTime

        if (this._eventManager.queuedEvent) this._eventManager.dispatchQueue()

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
        // Fixed update functions
        this._fixedDelta += snappedDeltaTime
        // Clamp fixedDelta to a max to avoid the slow update spiral of death
        this._fixedDelta = Math.min(this._fixedDelta, this._maxFixedDelta)
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

        // Update functions
        for (const update of this._updateFuncs) {
            update(this, deltaTime, currTime)
            if (this._eventManager.queuedEvent) this._eventManager.dispatchQueue()
        }

        this._lastTickTime = currTime
    }
}
