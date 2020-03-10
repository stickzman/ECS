import KeyBindings from "./components/KeyBindings.js"
import InputStream from "./components/InputStream.js"
import InputState from "./components/InputState.js"
import InputUpdateSystem from "./systems/InputUpdateSystem.js"

export default class ECS {
    nextEntityId = 0
    inputActions = {}
    removedComponents = new Map()
    singletons = {
        input: new InputState(),
        bindings: new KeyBindings(),
        inputStream: new InputStream()
    }
    components = {}
    systems = []

    constructor() {
        // Set up KeyboardEvent listeners for input
        window.addEventListener("keydown", e => {
            let action = this.singletons.bindings.getAction(e.key.toLowerCase())
            if (!action) return
            this.singletons.inputStream.addInput(action, true)
        })
        window.addEventListener("keyup", e => {
            let action = this.singletons.bindings.getAction(e.key.toLowerCase())
            if (!action) return
            this.singletons.inputStream.addInput(action, false)
        })
        this.registerSystem(InputUpdateSystem)
    }

    // Expect format for bindings is {ACTION_NAME: KEY}
    addKeyBindings(bindings) {
        if (typeof(bindings) !== "object") return

        for (const action in bindings) {
            let key = bindings[action]
            if (typeof(key) !== "string") {
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

    createEntity(components) {
        const id = this.nextEntityId++
        // If any components are passed in, add them to entity b4 returning id
        if (components) components.forEach(c => this.addComponent(id, c))
        return id
    }

    registerSingleton(component, name) {
        if (typeof(component) !== "object")
            throw new TypeError("Registered components must be objects")
        name = name || component.constructor.name
        this.singletons[name] = component
    }

    registerComponent(component) {
        if (typeof(component) === "function") {
            this.components[component.name] = []
        } else if (typeof(component) === "string") {
            this.components[component] = []
        } else {
            throw new TypeError("Registered components must be classes")
        }
    }

    // Systems execute in the order they are registered
    registerSystem(system) {
        if (typeof(system) !== "function") {
            throw new TypeError(`Systems must be functions. Attempted to register: ${system}`)
        }
        this.systems.push(system)
    }

    addComponent(entityId, component) {
        if (!Number.isInteger(entityId))
            throw new TypeError("Entity IDs must be integers")
        if (typeof(component) !== "object")
            throw new TypeError("Components must be objects")

        const compName = component.constructor.name
        if (!this.components[compName]) this.registerComponent(compName)
        if (entityId >= this.nextEntityId) this.nextEntityId = entityId + 1

        this.components[compName][entityId] = component
    }

    removeEntity(entityId) {
        if (!Number.isInteger(entityId))
        throw new TypeError("Entity IDs must be integers")

        Object.values(this.components).forEach(comp => {
            delete comp[entityId]
        })
    }

    removeComponent(entityId, component) {
        if (!Number.isInteger(entityId))
            throw new TypeError("Entity IDs must be integers")

        let compName = component
        if (typeof(component) === "function") compName = component.name

        // Add the id to a list of ids to remove from that component array
        if (this.removedComponents.has(compName)) {
            this.removedComponents.get(compName).push(entityId)
        } else {
            this.removedComponents.set(compName, [entityId])
        }
    }

    // Clear out all components related to entity
    clearRemovedComponents() {
        if (!this.removedComponents.size) return

        this.removedComponents.forEach((entityList, compName) => {
            entityList.forEach(id => {
                delete this.components[compName][id]
            })
        })

        this.removedComponents.clear()
    }

    // Passing in all components, singleton components, and input action list
    execSystems() {
        this.clearRemovedComponents()
        this.systems.forEach(s => {
            s(this.components, this.singletons, this.inputActions)
        })
    }
}
