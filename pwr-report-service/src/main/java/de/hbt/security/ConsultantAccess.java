package de.hbt.security;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.http.HttpStatus.FORBIDDEN;

/**
 * Who may read and change the data of a consultant (#255): a <code>Power.User</code> only the own, a
 * <code>Power.Admin</code> everyone's. The edge says who is logged in and whether the account is an admin, from the
 * verified token. It sets the admin header on every request, so a request without it did not come through the edge:
 * a call of another service, or local development without the edge. Both may access everything.
 */
public final class ConsultantAccess {

    public static final String USER_INITIALS_HEADER = "X-Pwr-User-Initials";
    public static final String USER_ADMIN_HEADER = "X-Pwr-User-Admin";

    private ConsultantAccess() {
    }

    /**
     * Whether the request may access the data of the consultant with these initials, compared ignoring case
     */
    public static boolean mayAccess(HttpServletRequest request, String initials) {
        String admin = request.getHeader(USER_ADMIN_HEADER);
        if (admin == null || Boolean.parseBoolean(admin)) {
            return true;
        }
        String user = request.getHeader(USER_INITIALS_HEADER);
        return user != null && !user.isBlank() && initials != null && user.trim().equalsIgnoreCase(initials.trim());
    }

    /**
     * Answers <code>403</code> unless the current request may access the data of the consultant with these initials;
     * <code>null</code> for data that belongs to no consultant, which only admins may access
     */
    public static void check(String initials) {
        HttpServletRequest request = currentRequest();
        if (request != null && !mayAccess(request, initials)) {
            throw new ResponseStatusException(FORBIDDEN, "Not your data");
        }
    }

    /**
     * Answers <code>403</code> unless the current request comes from an admin (or not through the edge)
     */
    public static void checkAdmin() {
        HttpServletRequest request = currentRequest();
        if (request != null && !mayAccess(request, null)) {
            throw new ResponseStatusException(FORBIDDEN, "Admins only");
        }
    }

    /**
     * The request being handled; null outside of one (a scheduled job), which is no request through the edge
     */
    private static HttpServletRequest currentRequest() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        return attributes instanceof ServletRequestAttributes
                ? ((ServletRequestAttributes) attributes).getRequest()
                : null;
    }
}
