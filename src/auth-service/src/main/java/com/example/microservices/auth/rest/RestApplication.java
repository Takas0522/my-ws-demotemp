package com.example.microservices.auth.rest;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

/**
 * JAX-RS Application Configuration
 */
@ApplicationPath("/api")
public class RestApplication extends Application {
    // エンドポイント: /api/auth
}
