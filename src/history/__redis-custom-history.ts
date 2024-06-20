import type { RedisConfigNodejs } from "@upstash/redis";
import { Redis } from "@upstash/redis";
import type { UpstashMessage } from "../types";
import type { BaseMessageHistory, HistoryAddMessage } from "./__chat-history";
import { DEFAULT_CHAT_SESSION_ID, DEFAULT_HISTORY_LENGTH } from "../constants";

export type UpstashRedisHistoryConfig = {
  config?: RedisConfigNodejs;
  client?: Redis;
  metadata?: Record<string, unknown>;
};

export class __UpstashRedisHistory implements BaseMessageHistory {
  public client: Redis;

  constructor(_config: UpstashRedisHistoryConfig) {
    const { config, client } = _config;

    if (client) {
      this.client = client;
    } else if (config) {
      this.client = new Redis(config);
    } else {
      throw new Error(
        `Upstash Redis message stores require either a config object or a pre-configured client.`
      );
    }
  }

  async addMessage({
    message,
    sessionId = DEFAULT_CHAT_SESSION_ID,
    sessionTTL,
  }: HistoryAddMessage): Promise<void> {
    await this.client.lpush(sessionId, JSON.stringify(message));

    if (sessionTTL) {
      await this.client.expire(sessionId, sessionTTL);
    }
  }

  async clear(): Promise<void> {
    // to be implemented
  }

  async getMessages({
    sessionId = DEFAULT_CHAT_SESSION_ID,
    amount: _amount = DEFAULT_HISTORY_LENGTH,
  }): Promise<UpstashMessage[]> {
    const amount = _amount;

    const storedMessages: UpstashMessage[] = await this.client.lrange<UpstashMessage>(
      sessionId,
      typeof amount === "number" ? 0 : amount[0],
      typeof amount === "number" ? amount : amount[1]
    );

    return storedMessages;
  }
}
