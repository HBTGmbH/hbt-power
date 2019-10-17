package de.hbt.controller;

import redis.embedded.RedisServer;

public class RedisEmbedded {

    public static void main(String... args) throws Exception {
        RedisServer redisServer = new RedisServer(6379);
        redisServer.start();
    }
}
