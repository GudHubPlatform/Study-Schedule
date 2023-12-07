export default class ScopeSingleton {
    static #instance;

    static #scope;
    static #controller;
    static #rd;
    static #data;
    static #enableGenerateButtons;

    constructor() {
        this.scope = ScopeSingleton.#scope;
        this.controller = ScopeSingleton.#controller;
        this.rd = ScopeSingleton.#rd;
        this.data = ScopeSingleton.#data;
        this.enableGenerateButtons = ScopeSingleton.#enableGenerateButtons;
    }

    static getInstance(scope, controller, data) {
        if (!ScopeSingleton.#instance) {
            ScopeSingleton.#scope = scope;
            ScopeSingleton.#controller = controller;
            ScopeSingleton.#data = data;
            ScopeSingleton.#instance = new ScopeSingleton();
        }
        return ScopeSingleton.#instance;
    }

    static reset() {
        ScopeSingleton.#instance = null;
        ScopeSingleton.#scope = null;
        ScopeSingleton.#controller = null;
        ScopeSingleton.#rd = null;
        ScopeSingleton.#data = null;
        ScopeSingleton.#enableGenerateButtons = null;
    }

    setRD(rd) {
        if (!this.rd) {
            this.rd = rd;
        }
    }

    setEnableGenerateButtons(func) {
        if (!this.enableGenerateButtons) {
            this.enableGenerateButtons = func;
        }
    }

    getScope() {
        return this.scope;
    }
    getData() {
        return this.data;
    }
    getController() {
        return this.controller;
    }
    getRD() {
        return this.rd;
    }
    getEnableGenerateButtons() {
        return this.enableGenerateButtons;
    }
}
