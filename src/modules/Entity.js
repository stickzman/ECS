export default class Entity {
    components = new Map()

    constructor(id) {
        this.id = id
    }

    addComponent(component) {
        this.components.set(component.constructor, component)
    }

    removeComponent(Component) {
        this.components.delete(Component)
    }

    hasComponent(Component) {
        return this.components.has(Component)
    }

    hasAllComponents(Components) {
        for (var i = 0; i < Components.length; i++) {
            if (!this.hasComponent(Components[i])) return false
        }
        return true
    }
}
