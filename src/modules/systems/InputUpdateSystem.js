export default function (components, singletons) {
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
