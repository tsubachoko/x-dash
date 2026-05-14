type Handler<T = unknown> = (payload: T) => void;

class EventBus {
  private handlers = new Map<string, Set<Handler<unknown>>>();

  on<T>(event: string, handler: Handler<T>): () => void {
    const set = this.handlers.get(event) ?? new Set<Handler<unknown>>();
    set.add(handler as Handler<unknown>);
    this.handlers.set(event, set);
    return () => this.off(event, handler);
  }

  off<T>(event: string, handler: Handler<T>): void {
    this.handlers.get(event)?.delete(handler as Handler<unknown>);
  }

  emit<T>(event: string, payload?: T): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const h of set) {
      (h as Handler<T | undefined>)(payload);
    }
  }
}

export const eventBus = new EventBus();
