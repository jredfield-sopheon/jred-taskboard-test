//---------------------------------------------------------------------------------------------------------------------
import { MIN_SMI } from "../util/Helpers.js";
import { compact } from "../util/Uniqable.js";
//---------------------------------------------------------------------------------------------------------------------
export class Event {
    constructor() {
        this.compacted = false;
        this.listeners = [];
    }
    on(listener) {
        // @ts-ignore
        listener.uniqable = MIN_SMI;
        this.listeners.push(listener);
        this.compacted = false;
        return () => this.un(listener);
    }
    un(listener) {
        if (!this.compacted)
            this.compact();
        const index = this.listeners.indexOf(listener);
        if (index !== -1)
            this.listeners.splice(index, 1);
    }
    trigger(...payload) {
        if (!this.compacted)
            this.compact();
        const listeners = this.listeners.slice();
        for (let i = 0; i < listeners.length; ++i) {
            listeners[i](...payload);
        }
    }
    compact() {
        compact(this.listeners);
    }
}
