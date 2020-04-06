export default class EventManager {
    _observers = {}
    // Format of _observers {
    //     eventType: { queue: [], obs: [] }
    // }
    newEvent = false

    constructor() { }

    addObserver(eventType, observer) {
        if (!this._observers[eventType]) {
            this._observers[eventType] = { queue: [], obs: [] }
        }
        this._observers[eventType].obs.push(observer)
    }

    removeObserver(eventType, observer) {
        if (!this._observers[eventType]) return
        const i = this._observers[eventType].obs.indexOf(observer)
        if (i < 0) return
        this._observers[eventType].obs.splice(i, 1)
    }

    dispatchEvent(eventType, data) {
        if (!this._observers[eventType]) return
        const observers = this._observers[eventType].obs
        for (const obs of observers) {
            obs(data)
        }
    }

    addToQueue(eventType, data) {
        if (!this._observers[eventType]) return
        this._observers[eventType].queue.push(data)
        this.newEvent = true
    }

    dispatchQueue() {
        this.newEvent = false
        for (const eventType of Object.values(this._observers)) {
            const queue = eventType.queue
            eventType.queue = []  // Clear existing queue
            const observers = eventType.obs
            for (const data of queue) {
                for (const obs of observers) {
                    obs(data)
                }
            }
        }
    }
}
