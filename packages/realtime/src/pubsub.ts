/**
 * Redis pub/sub for real-time fanout.
 * Publishes events that SSE streams subscribe to.
 */
export class PubSub {
  async publish(_channel: string, _message: unknown) {
    // TODO: Redis PUBLISH
  }

  async subscribe(_channel: string, _callback: (message: unknown) => void) {
    // TODO: Redis SUBSCRIBE
  }

  async unsubscribe(_channel: string) {
    // TODO: Redis UNSUBSCRIBE
  }
}
