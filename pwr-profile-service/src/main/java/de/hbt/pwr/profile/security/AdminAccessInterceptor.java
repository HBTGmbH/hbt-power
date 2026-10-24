package de.hbt.pwr.profile.security;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Lets only admins reach the endpoints under <code>/admin</code> (#260), as a second layer behind the edge. It goes by
 * the mapping Spring MVC chose, not by the text of the path, so no way of writing the path gets past it.
 */
public class AdminAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (isAdminMapping(request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE))) {
            ConsultantAccess.checkAdmin();
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
