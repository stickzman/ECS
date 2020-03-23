export default class Entity {
    components = new Map()

    constructor(id) {
        this.id = id
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component)
    }

    removeComponent(Component) {
        return this.components.delete(Component.name)
    }

    hasComponent(compName) {
        return this.components.has(compName)
    }

    hasAllComponents(compNames) {
        for (var i = 0; i < compNames.length; i++) {
            if (!this.hasComponent(compNames[i])) return false
        }
        return true
    }
}
