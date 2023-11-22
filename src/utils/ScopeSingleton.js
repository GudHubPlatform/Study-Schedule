export default class ScopeSingleton {
    static #instance;
    
    static #scope;
    static #controller;
    static #rd;
    static #data;
  
    constructor() {
      this.scope = ScopeSingleton.#scope;
      this.controller = ScopeSingleton.#controller;
      this.rd = ScopeSingleton.#rd;
      this.data = ScopeSingleton.#data;
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

    setRD(rd) {
      this.rd = rd;
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
  }