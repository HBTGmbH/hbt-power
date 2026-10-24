package de.hbt.power.security;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static org.springframework.http.HttpStatus.FORBIDDEN;

/**
 * Lets only admins reach the endpoints under <code>/admin</code> (#260), as a second layer behind the edge. It goes by
 * the mapping Spring MVC chose, not by the text of the path, so no way of writing the path gets past it. The edge sets
 * <code>X-Pwr-User-Admin</code> on every request; a request without it did not come through the edge (a call of
 * another service, or local development without the edge) and may access everything.
 */
public class AdminAccessInterceptor implements HandlerInterceptor {

    public static final String USER_ADMIN_HEADER = "X-Pwr-User-Admin";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (isAdminMapping(request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE))) {
            String admin = request.getHeader(USER_ADMIN_HEADER);
            if (admin != null && !Boolean.parseBoolean(admin)) {
                throw new ResponseStatusException(FORBIDDEN, "Admins only");
            }
        }
        return true;
    }

    static boolean isAdminMapping(Object pattern) {
        if (pattern == null) {
            return false;
        }
        String mapping = pattern.toString();
        return mapping.equals("/admin") || mapping.startsWith("/admin/");
    }
}
