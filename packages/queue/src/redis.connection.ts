import { ConnectionOptions } from "bullmq";

export type RedisConfig = {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  tls?: boolean;
  redisUrl?: string;
};

let cached: ConnectionOptions | null = null;

export function getRedisConnection(cfg: RedisConfig = {}): ConnectionOptions {
  if (cached) return cached;

  if (cfg.redisUrl) {
    cached = cfg.redisUrl as ConnectionOptions;
    return cached;
  }

  cached = {
    host: cfg.host ?? "127.0.0.1",
    port: cfg.port ?? 6379,
    username: cfg.username,
    password: cfg.password,
    tls: cfg.tls ? {} : undefined,
  };

  return cached;
}

