
package com.healthcare.security.firebase;

import com.google.firebase.auth.FirebaseToken;
import com.healthcare.security.principal.AuthenticatedUser;
import com.healthcare.user.entity.User;
import com.healthcare.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final FirebaseTokenVerifier tokenVerifier;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (token != null) {
                FirebaseToken firebaseToken = tokenVerifier.verifyToken(token);
                String firebaseUid = firebaseToken.getUid();

                Optional<User> optionalUser = userService.findByFirebaseUid(firebaseUid);

                if (optionalUser.isPresent()) {
                    User localUser = optionalUser.get();
                    if (localUser.isActive()) {
                        AuthenticatedUser authenticatedUser = new AuthenticatedUser(localUser);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                authenticatedUser, null, authenticatedUser.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        log.warn("User account is disabled for UID: {}", firebaseUid);
                    }
                } else {
                    log.info("First login for Firebase UID: {}. Creating local PATIENT profile.", firebaseUid);
                    
                    String email = firebaseToken.getEmail();
                    String name = firebaseToken.getName();
                    if (name == null || name.isEmpty()) {
                        name = "New User";
                    }
                    if (email == null || email.isEmpty()) {
                        log.error("Firebase token does not contain an email for UID {}. Cannot create user.", firebaseUid);
                        // Can't create user without email, reject.
                    } else {
                        User newUser = User.builder()
                                .firebaseUid(firebaseUid)
                                .email(email)
                                .fullName(name)
                                .role(com.healthcare.user.entity.Role.PATIENT)
                                .active(true)
                                .build();
                        newUser = userService.saveUser(newUser);
                        
                        AuthenticatedUser authenticatedUser = new AuthenticatedUser(newUser);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                authenticatedUser, null, authenticatedUser.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Could not authenticate Firebase token", e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
