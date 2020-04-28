export default class InputSystem {
    constructor(ecs) {
        this.ecs = ecs
        this.ecs.state.inputActions = {}
        this.ecs.state.input = new InputState()
        this.ecs.state.inputStream = new InputStream()
        this.ecs.state.bindings = new KeyBindings()
        this.ecs.registerSystem(this)
    }

    init(ecs) {
        // Set up KeyboardEvent listeners for input
        window.addEventListener("keydown", e => {
            let action = ecs.state.bindings.getAction(e.key.toLowerCase())
            if (action) ecs.state.inputStream.addInput(action, true)
        })
        window.addEventListener("keyup", e => {
            let action = ecs.state.bindings.getAction(e.key.toLowerCase())
            if (action) ecs.state.inputStream.addInput(action, false)
        })
    }

    update(ecs) {
        const state = ecs.state.input.state
        const inputStream = ecs.state.inputStream

        // Reset inputState for new frame
        ecs.state.input.reset()

        // Process inputObjs in order, update inputState
        while (inputStream.length()) {
            const newInput = inputStream.nextInput()
            const input = state[newInput.action]
            if (input.pressed !== newInput.pressed) input.changed = true
            input.pressed = newInput.pressed
        }
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
            this.ecs.state.inputActions[action] = action
            this.ecs.state.input.addAction(action)
            this.ecs.state.bindings.addBinding(action, key)
        }
    }
}



class KeyBindings {
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



class InputStream {
    stream = []

    constructor() { }

    addInput(action, pressed) {
        this.stream.push({
            action: action,
            pressed: pressed
        })
    }

    nextInput() {
        return this.stream.shift()
    }

    length() {
        return this.stream.length
    }
}



class InputState {
    state = {}

    constructor(actions) {
        if (!actions) return
        actions.forEach(a => {
            this.addAction(a)
        })
    }

    addAction(action) {
        this.state[action] = {pressed: false, changed: false}
    }

    isPressed(action) {
        const state = this.state[action]
        if (!state) return null
        return state.pressed
    }

    pressedThisFrame(action) {
        const state = this.state[action]
        if (!state) return null
        return state.pressed && state.changed
    }

    releasedThisFrame(action) {
        const state = this.state[action]
        if (!state) return null
        return !state.pressed && state.changed
    }

    reset() {
        const vals = Object.values(this.state)
        vals.forEach(inputObj => {
            inputObj.changed = false
        })
    }
}
