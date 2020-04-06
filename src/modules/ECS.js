import Entity from "./Entity.js"
import Query from "./Query.js"
import EventManager from "./EventManager.js"
import KeyBindings from "./components/KeyBindings.js"
import InputStream from "./components/InputStream.js"
import InputState from "./components/InputState.js"
import InputUpdateSystem from "./systems/InputUpdateSystem.js"

const ENTITY_ID_NON_INT = "Entity ID must be an integer"
const COMP_NON_CLASS = "Component must be a class"

export default class ECS {
    inputActions = {}
    singletons = {
        input: new InputState(),
        bindings: new KeyBindings(),
        inputStream: new InputStream()
    }

    _nextEntityId = 0
    _eventManager = new EventManager()
    _queries = new Map()
    _entities = []
    _systems = []

    constructor() {
        this.registerSystem(InputUpdateSystem)
    }

    // Expect format for bindings is {ACTION_NAME: KEY}
    addKeyBindings(bindings) {
        if (typeof bindings !== "object") return

        for (const action in bindings) {
            let key = bindings[action]
            if (typeof key !== "string") {
                console.error(`Key bindings must be strings. Cannot bind:`, {
                    action: action,
                    key: key
                })
                continue
            }
            this.inputActions[action] = action
            this.singletons.input.addAction(action)
            this.singletons.bindings.addBinding(action, key)
        }
    }

    // SYSTEM FORMAT: { requestedComponents, onRegister(), onUpdate() }
    // Systems execute in the order they are registered
    registerSystem(system) {
        if (typeof system !== "object")
            throw new TypeError(`System must be an object`)

        let Components = system.requestedComponents
        if (Components === undefined)
            console.warn("No components requested by system:", system)

        // Generates/tracks new query if necessary
        system.query = this._getQuery(Components)
        Object.freeze(system)
        this._systems.push(system)
    }

    _getQuery(Components) {
        Components = (typeof Components === "string") ? [Components] : Components
        const key = this._getQueryKey(Components)
        if (this._queries.has(key)) return this._queries(key)

        const query = new Query(Components, this._entities)
        // Add to query list if query is not empty
        if (query.componentTypes.length) this._queries.set(key, query)
        return query
    }

    _getQueryKey(Components) {
        Components = Array.isArray(Components) ? Components : [Components]
        return Components
                .map(c => (typeof c === "function") ? c.name : c) // Get names of component classes
                .sort()
                .join(",")
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
            if (query.hasEntity(e)) continue
            if (e.hasAllComponents(query.componentTypes)) query.addEntity(e)
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
                if (query.hasEntity(e) && !e.hasAllComponents(query.componentTypes))
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
            if (!system.onInit) continue
            system.onInit(
                this,
                system.query.components,
                system.query.entities
            )
        }
    }

    // Passing in component arrays, singleton components, and input action list
    _updateSystems() {
        if (this._eventManager.newEvent) this._eventManager.dispatchQueue()
        for (const system of this._systems) {
            system.onUpdate(
                this,
                system.query.components,
                system.query.entities
            )
            if (this._eventManager.newEvent) this._eventManager.dispatchQueue()
        }
    }
}
