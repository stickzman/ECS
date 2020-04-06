class EventContainer {
    queue = []
    observers = []

    constructor() { }
}

export default class EventManager {
    newEvent = false
    _events = {}

    constructor() { }

    addObserver(eventType, observer) {
        if (!this._events[eventType]) {
            this._events[eventType] = new EventContainer()
        }
        this._events[eventType].observers.push(observer)
    }

    removeObserver(eventType, observer) {
        if (!this._events[eventType]) return
        const i = this._events[eventType].observers.indexOf(observer)
        if (i < 0) return
        this._events[eventType].observers.splice(i, 1)
    }

    dispatchEvent(eventType, event) {
        // If object is passed in, get its class name, assign data appropiately
        if (typeof eventType === "object") {
            event = eventType
            eventType = event.constructor.name
        }
        if (!this._events[eventType]) return
        const observers = this._events[eventType].observers
        for (const obs of observers) {
            obs(event)
        }
    }

    addToQueue(eventType, event) {
        // If object is passed in, get its class name, assign data appropiately
        if (typeof eventType === "object") {
            event = eventType
            eventType = event.constructor.name
        }
        if (!this._events[eventType]) return
        this._events[eventType].queue.push(event)
        this.newEvent = true
    }

    dispatchQueue() {
        this.newEvent = false
        for (const eventType of Object.values(this._events)) {
            const queue = eventType.queue
            eventType.queue = []  // Clear existing queue
            const observers = eventType.observers
            for (const event of queue) {
                for (const obs of observers) {
                    obs(event)
                }
            }
        }
    }
}
