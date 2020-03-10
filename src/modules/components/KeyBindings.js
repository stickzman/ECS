export default class KeyBindings {
    keyToAction = {}
    actionToKey = {}

    constructor(bindings) {
        if (typeof(bindings) === "object") {
            const actions = Object.keys(bindings)
            actions.forEach(a => { this.addBinding(a, bindings[a]) })
        }
    }

    addBinding(action, key) {
        if (typeof(action) !== "string" || typeof(key) !== "string") {
            throw new TypeError(`Key bindings must be strings`)
        }
        this.keyToAction[key] = action
        this.actionToKey[action] = key
    }

    getAction(key) {
        if (typeof(key) !== "string") return null
        return this.keyToAction[key]
    }

    getKey(action) {
        if (typeof(action) !== "string") return null
        return this.actionToKey[action]
    }
}
