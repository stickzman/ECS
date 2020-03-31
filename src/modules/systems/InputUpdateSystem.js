export default {
    requestedComponents: null,
    onInit: function(ecs) {
        const singletons = ecs.singletons
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
    onUpdate: function(ecs, COLUMNS) {
        const inputStream = ecs.singletons.inputStream
        const state = ecs.singletons.input.state

        // Reset inputState for new frame
        ecs.singletons.input.reset()

        // Process inputObjs in order, update inputState
        while (inputStream.length()) {
            const newInput = inputStream.nextInput()
            const input = state[newInput.action]
            if (input.pressed !== newInput.pressed) input.changed = true
            input.pressed = newInput.pressed
        }
    }
}
