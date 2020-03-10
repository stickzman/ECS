export default class {
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
