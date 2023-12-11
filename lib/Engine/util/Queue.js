export default class Queue {
    constructor() {
        this.ongoing = Promise.resolve();
        this.handleReject = () => { };
    }
    queue(fn, handleReject = this.handleReject) {
        const result = this.ongoing.then(fn);
        this.ongoing = result.catch(handleReject);
        return result;
    }
}
