export default class Entity {
    _components = new Map()
    _tags = new Map()

    constructor(id, ecs) {
        this.id = id
        this.ecs = ecs
    }

    addTag(tag) {
        this.ecs.addTag(this.id, tag)
    }

    _addTag(tag) {
        this._tags.set(tag, true)
    }

    removeTag(tag) {
        this.ecs.removeTag(this.id, tag)
    }

    _removeTag(tag) {
        return this._tags.delete(tag)
    }

    hasAllTags(tags) {
        for (const tag of tags) {
            if (!this.hasTag(tag)) return false
        }
        return true
    }

    hasTag(tag) {
        return this._tags.has(tag)
    }

    addComponent(Component, ...args) {
        this.ecs.addComponent(this.id, Component, ...args)
    }

    _addComponent(component) {
        this._components.set(component.constructor.name, component)
    }

    removeComponent(Component) {
        this.ecs.removeComponent(this.id, Component)
    }

    _removeComponent(comp) {
        comp = (typeof comp === "function") ? comp.name : comp
        const component = this._components.get(comp)
        this._components.delete(comp)
        return component
    }

    getComponent(compName) {
        return this._components.get(compName)
    }

    hasComponent(compName) {
        return this._components.has(compName)
    }

    hasAllComponents(compNames) {
        for (const name of compNames) {
            if (!this.hasComponent(name)) return false
        }
        return true
    }

    hasSomeComponents(compNames) {
        for (const name of compNames) {
            if (this.hasComponent(name)) return true
        }
        return false
    }

    hasNoneComponents(compNames) {
        for (const name of compNames) {
            if (this.hasComponent(name)) return false
        }
        return true
    }

}
