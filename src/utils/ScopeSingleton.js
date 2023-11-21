export default class ScopeSingleton {
    static #instance;
    
    static #scope;
    static #data;
  
    constructor() {
      this.scope = ScopeSingleton.#scope;
      this.data = ScopeSingleton.#data;
    }

    static getInstance(scope, data) {
      if (!ScopeSingleton.#instance) {

        ScopeSingleton.#scope = scope;
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
  }