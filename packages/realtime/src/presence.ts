/**
 * Tracks user presence via Redis.
 * Users heartbeat their presence; stale entries are cleaned up.
 */
export class PresenceManager {
  private readonly ttlSeconds = 30;

  async setPresent(_userId: string, _location: string) {
    // TODO: Redis SETEX with TTL for presence heartbeat
  }

  async getPresent(_location: string): Promise<string[]> {
    // TODO: Redis SMEMBERS or scan for presence keys
    return [];
  }

  async removePresent(_userId: string, _location: string) {
    // TODO: Redis DEL presence key
  }
}
