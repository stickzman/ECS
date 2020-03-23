import Entity from "./Entity.js"
import Query from "./Query.js"
import KeyBindings from "./components/KeyBindings.js"
import InputStream from "./components/InputStream.js"
import InputState from "./components/InputState.js"
import InputUpdateSystem from "./systems/InputUpdateSystem.js"

const ENTITY_ID_NON_INT = "Entity ID must be an integer"
const COMP_NON_CLASS = "Component must be a class"

export default class ECS {
    _nextEntityId = 0
    inputActions = {}

    _queries = new Map()
    _entities = []
    _singletons = {
        input: new InputState(),
        bindings: new KeyBindings(),
        inputStream: new InputStream()
    }
    _systems = []

    constructor() {
        // Set up KeyboardEvent listeners for input
        window.addEventListener("keydown", e => {
            let action = this._singletons.bindings.getAction(e.key.toLowerCase())
            if (action) this._singletons.inputStream.addInput(action, true)
        })
        window.addEventListener("keyup", e => {
            let action = this._singletons.bindings.getAction(e.key.toLowerCase())
            if (action) this._singletons.inputStream.addInput(action, false)
        })
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
            this._singletons.input.addAction(action)
            this._singletons.bindings.addBinding(action, key)
        }
    }

    createEntity(components) {
        const id = this._nextEntityId++
        this._entities[id] = new Entity(id)
        return id
    }

    registerSingleton(component, name) {
        if (typeof component !== "object")
            throw new TypeError("Singleton components must be object")
        name = name || component.constructor.name
        this._singletons[name] = component
        return component
    }

    // Systems execute in the order they are registered
    registerSystem(system) {
        if (typeof system !== "function") {
            throw new TypeError(`Systems must be functions. Attempted to register: ${system}`)
        }

        let Components = system.prototype.requiredComponents

        // Create a new query, add to _queries list if not empty
        if (Components) {
            Components = (Array.isArray(Components)) ? Components : [Components]
            system.prototype.results = this._getQuery(Components)
        } else {
            system.prototype.results = new Query(Components, this._entities)
        }

        this._systems.push(system)
    }

    _getQuery(Components) {
        const key = Components.sort().join(",")
        if (this._queries.has(key)) return this._queries(key)

        const query = new Query(Components, this._entities)
        this._queries.set(key, query)
        return query
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

    removeEntity(id) {
        if (!Number.isInteger(id))
            throw new Error(ENTITY_ID_NON_INT)
        if (this._entities[id] === undefined) return

        const e = this._entities[id]
        for (const [key, query] of this._queries) {
            query.removeEntity(e)
        }
        delete this._entities[id]
    }

    // Passing in all components, singleton components, and input action list
    execSystems() {
        for (var i = 0; i < this._systems.length; i++) {
            const s = this._systems[i]
            s(s.prototype.results.components, this._singletons, this.inputActions)
        }
    }
}
