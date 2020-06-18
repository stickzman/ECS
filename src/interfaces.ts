import { ECS } from "./core/ECS";
import { Entity } from "./core/Entity";

export interface Class {
    new(...args: any[]): any
}
export interface Function {
    (...args: any[]): any
}
export interface InitFunc {
    (ecs: ECS): void
}
export interface UpdateFunc {
    (ecs: ECS, deltaTime: number, currTime: number): void
}
export interface System {
    init?: InitFunc,
    update?: UpdateFunc,
    fixedUpdate?: UpdateFunc
}
export interface QueryParams {
    id?: string,
    all?: string[],
    optional?: string[],
    none?: string[],
    tags?: string[]
}
export interface Component {
    _entity: Entity
}
