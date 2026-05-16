class InProcessEventBus {
  #target = new EventTarget();
  #handlers = new WeakMap();

  publish(event) {
    this.#target.dispatchEvent(
      new CustomEvent(event.type, { detail: event })
    );
  }

  subscribe(eventType, handler) {
    const wrapped = (e) => handler(e.detail);
    this.#handlers.set(handler, wrapped);
    this.#target.addEventListener(eventType, wrapped);
  }

  unsubscribe(eventType, handler) {
    const wrapped = this.#handlers.get(handler);
    if (wrapped) this.#target.removeEventListener(eventType, wrapped);
  }
}

export const eventBus = new InProcessEventBus();
