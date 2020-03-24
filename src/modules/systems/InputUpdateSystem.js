export default {
    requestedComponents: null,
    onRegister: function(components, singletons) {
        // Set up KeyboardEvent listeners for input
        window.addEventListener("keydown", e => {
            let action = singletons.bindings.getAction(e.key.toLowerCase())
            if (action) singletons.inputStream.addInput(action, true)
        })
        window.addEventListener("keyup", e => {
            let action = singletons.bindings.getAction(e.key.toLowerCase())
            if (action) singletons.inputStream.addInput(action, false)
        })
    },
    onUpdate: function(components, singletons) {
        const inputStream = singletons.inputStream
        const state = singletons.input.state

        // Reset inputState for new frame
        singletons.input.reset()

        // Process inputObjs in order, update inputState
        while (inputStream.length()) {
            const newInput = inputStream.nextInput()
            const input = state[newInput.action]
            if (input.pressed !== newInput.pressed) input.changed = true
            input.pressed = newInput.pressed
        }
    }
}
