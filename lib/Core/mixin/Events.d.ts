import Base from '../Base.js';

// to avoid dependency on `chronograph`
type AnyConstructor<A = any>   = new (...input: any[]) => A

export declare class EventsMixin {
    on (...args) : any
    ion (...args) : any

    un (...args) : any

    detachListeners (name : string)

    trigger (...args) : any

    hasListener (eventName : string) : boolean

    await (eventName : string, options? : { checkLog : boolean; resetLog : boolean } | false) : Promise<void>
}

declare const Events : <T extends AnyConstructor<Base>>(base : T) => AnyConstructor<InstanceType<T> & EventsMixin>;

export default Events;
