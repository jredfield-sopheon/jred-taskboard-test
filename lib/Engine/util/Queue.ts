export default class Queue {
    ongoing     : Promise<any> = Promise.resolve()

    handleReject : (error : Error | any) => any = () => {}

    queue (fn : () => Promise<any>, handleReject = this.handleReject) : Promise<any> {
        const result = this.ongoing.then(fn)

        this.ongoing = result.catch(handleReject)

        return result
    }
}
