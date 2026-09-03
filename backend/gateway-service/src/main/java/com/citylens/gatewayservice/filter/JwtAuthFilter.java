package com.citylens.gatewayservice.filter;

import com.citylens.gatewayservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    private boolean isPublicRoute(String path) {
        if (path.startsWith("/api/auth/")) {
            return true;
        }

        return path.startsWith("/api/locations");
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();

        if (isPublicRoute(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        if(path.startsWith("/api/admin")){
            String role = jwtUtil.extractRole(token);
            if(role == null || !role.equals("ROLE_ADMIN")){
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }
        }

        String email = jwtUtil.extractEmail(token);
        ServerWebExchange modifiedExchange = exchange.mutate()
                .request(r -> r.header("X-User-Email", email))
                .build();
        return chain.filter(modifiedExchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}