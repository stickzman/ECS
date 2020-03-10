export default class InputState {
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
