
package com.healthcare.security.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.healthcare.common.exception.UnauthorizedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class FirebaseTokenVerifier {

    public FirebaseToken verifyToken(String idToken) {

        if (!StringUtils.hasText(idToken)) {
            throw new UnauthorizedException("Firebase token is missing");
        }

        try {
            return FirebaseAuth.getInstance().verifyIdToken(idToken, true);

        } catch (FirebaseAuthException e) {
            throw new UnauthorizedException(
                    "Invalid, expired, or revoked Firebase token"
            );
        }
    }
}
