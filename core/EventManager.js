export default class EventManager {
    queuedEvent = false
    _eventListeners = {}
    _eventQueue = []

    constructor() { }

    addListener(eventType, listener) {
        if (!this._eventListeners[eventType]) {
            this._eventListeners[eventType] = []
        }
        this._eventListeners[eventType].push(listener)
    }

    removeListener(eventType, listener) {
        if (!this._eventListeners[eventType]) return
        const i = this._eventListeners[eventType].indexOf(listener)
        if (i < 0) return
        this._eventListeners[eventType].splice(i, 1)
    }

    initialize() {
        this.dispatchEvent = this._dispatchEvent
        this.dispatchQueue()
    }

    dispatchEvent = this.addToQueue

    _dispatchEvent(eventType, event) {
        // If object is passed in, get its class name, assign data appropiately
        if (typeof eventType === "object") {
            event = eventType
            eventType = event.constructor.name
        }
        if (!this._eventListeners[eventType]) return
        const listeners = this._eventListeners[eventType]
        for (const callback of listeners) {
            callback(event)
        }
    }

    addToQueue(eventType, event) {
        // If object is passed in, get its class name, assign data appropiately
        if (typeof eventType === "object") {
            event = eventType
            eventType = event.constructor.name
        }
        this._eventQueue.push({
            eventType: eventType,
            event: event
        })
        this.queuedEvent = true
    }

    dispatchQueue() {
        this.queuedEvent = false
        const queue = this._eventQueue
        this._eventQueue = [] // Clear existing queue
        for (const e of queue) {
            this.dispatchEvent(e.eventType, e.event)
        }
    }
}
