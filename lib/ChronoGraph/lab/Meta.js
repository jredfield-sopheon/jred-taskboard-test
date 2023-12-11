import { Base } from "../class/Base.js";
import { Mixin } from "../class/Mixin.js";
export class Property extends Base {
    constructor() {
        super(...arguments);
        this.name = undefined;
    }
    apply(target) {
    }
    getInitString(configName) {
        return `this.${this.name}=${configName}.${this.name};`;
    }
    static decorator(props, cls) {
        return (target, propertyKey) => {
            const property = new (cls || this)();
            property.initialize(props);
            property.name = propertyKey;
            target.meta.addProperty(property);
        };
    }
}
export class MetaClass extends Base {
    constructor() {
        super(...arguments);
        this.konstructor = undefined;
        this.properties = [];
        this.$initializer = undefined;
    }
    initialize(props) {
        super.initialize(props);
        if (!this.konstructor) {
            throw new Error('Required property `konstructor` missing during instantiation of ' + this);
        }
        // @ts-ignore
        this.instancePrototype.$meta = this;
    }
    get initializer() {
        if (this.$initializer !== undefined)
            return this.$initializer;
        let body = Array.from(new Set(this.properties)).map(property => property.getInitString('config')).join('');
        return this.$initializer = new Function('config', body);
    }
    get superclass() {
        return Object.getPrototypeOf(this.konstructor.prototype).constructor;
    }
    get instancePrototype() {
        return this.konstructor.prototype;
    }
    addProperty(property) {
        this.properties.push(property);
        property.apply(this.konstructor);
    }
}
export const MetaClassC = (config) => MetaClass.new(config);
//---------------------------------------------------------------------------------------------------------------------
export class BaseManaged extends Mixin([], (base) => {
    class BaseManaged extends base {
        constructor(...args) {
            super(...args);
            this.meta.initializer.call(this);
        }
        get meta() {
            // @ts-ignore
            return this.constructor.meta;
        }
        static get mixinsForMetaClass() {
            return [MetaClass];
        }
        static get meta() {
            const proto = this.prototype;
            if (proto.hasOwnProperty('$meta'))
                return proto.$meta;
            // @ts-ignore
            const metaClass = Mixin(this.mixinsForMetaClass, base => base);
            // @ts-ignore
            return proto.$meta = metaClass.new({ konstructor: this });
        }
    }
    return BaseManaged;
}) {
}
