//---------------------------------------------------------------------------------------------------------------------
export class Hook {
    constructor() {
        this.hooks = [];
    }
    on(listener) {
        this.hooks.push(listener);
        return () => this.un(listener);
    }
    un(listener) {
        const index = this.hooks.indexOf(listener);
        if (index !== -1)
            this.hooks.splice(index, 1);
    }
    trigger(...payload) {
        const listeners = this.hooks.slice();
        for (let i = 0; i < listeners.length; ++i) {
            listeners[i](...payload);
        }
    }
}
