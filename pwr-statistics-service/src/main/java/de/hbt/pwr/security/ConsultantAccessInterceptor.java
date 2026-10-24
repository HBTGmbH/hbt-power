package de.hbt.pwr.security;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

/**
 * Checks the consultant a path names (the variable <code>{initials}</code>) before the controller runs (#255), so
 * every endpoint with initials in its path is covered, also a new one. Data found by an id is checked where it is
 * loaded, with {@link ConsultantAccess#check(String)}.
 */
public class ConsultantAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        @SuppressWarnings("unchecked")
        Map<String, String> variables =
                (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (variables != null && variables.containsKey("initials")) {
            ConsultantAccess.check(variables.get("initials"));
        }
        return true;
    }
}
