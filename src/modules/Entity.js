export default class Entity {
    components = new Map()
    tags = new Map()

    constructor(id) {
        this.id = id
    }

    addTag(tag) {
        this.tags.set(tag, true)
    }

    removeTag(tag) {
        return this.tags.delete(tag)
    }

    hasAllTags(tags) {
        for (const tag of tags) {
            if (!this.hasTag(tag)) return false
        }
        return true
    }

    hasTag(tag) {
        return this.tags.has(tag)
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component)
    }

    removeComponent(Component) {
        return this.components.delete(Component.name)
    }

    hasAllComponents(compNames) {
        for (const name of compNames) {
            if (!this.hasComponent(name)) return false
        }
        return true
    }

    hasComponent(compName) {
        return this.components.has(compName)
    }
}
