export class InputSystem {
    constructor(public ecs) {
        ecs.extend("inputActions", {})
        ecs.extend("input", new InputState())
        ecs.extend("inputStream", new InputStream())
        ecs.extend("bindings", new KeyBindings())
        ecs.registerSystem(this)
    }

    init(ecs) {
        // Set up KeyboardEvent listeners for input
        window.addEventListener("keydown", e => {
            let action = ecs.bindings.getAction(e.code.toLowerCase())
            if (action) ecs.inputStream.addInput(action, true)
        })
        window.addEventListener("keyup", e => {
            let action = ecs.bindings.getAction(e.code.toLowerCase())
            if (action) ecs.inputStream.addInput(action, false)
        })
    }

    update(ecs) {
        const state = ecs.input.state
        const inputStream = ecs.inputStream

        // Reset inputState for new frame
        ecs.input.reset()

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
            this.ecs.inputActions[action] = action
            this.ecs.input.addAction(action)
            this.ecs.bindings.addBinding(action, key.toLowerCase())
        }
    }
}



class KeyBindings {
    keyToAction = {}
    actionToKey = {}

    constructor(bindings?) {
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

interface ActionState {
    pressed: false,
    changed: false
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

    constructor(actions?) {
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
        const vals = <ActionState[]>Object.values(this.state)
        vals.forEach(inputObj => {
            inputObj.changed = false
        })
    }
}
