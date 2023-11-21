export default class ScopeSingleton {
    static #instance;
    
    static #scope;
    static #controller;
    static #data;
  
    constructor() {
      this.scope = ScopeSingleton.#scope;
      this.controller = ScopeSingleton.#controller;
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

    getScope() {
      return this.scope;
    }
    getData() {
      return this.data;
    }
    getController() {
      return this.controller;
    }
  }