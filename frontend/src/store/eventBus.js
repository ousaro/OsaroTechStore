/**
 * INFRASTRUCTURE — In-process Event Bus
 *
 * Frontend mirror of the backend's inprocess event bus provider.
 * Uses the browser EventTarget API as the underlying mechanism.
 * Satisfies EventBusPort.
 *
 * Modules never import each other directly.
 * Cross-module workflows go through events + translators wired by the
 * composition root — exactly like the backend.
 */

class InProcessEventBus {
  #target = new EventTarget();
  #handlers = new WeakMap(); // keeps original fn → wrapped fn for cleanup

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

// Singleton — one bus per app instance
export const eventBus = new InProcessEventBus();
