package com.healthcare.security.firebase;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.healthcare.common.exception.UnauthorizedException;
import org.springframework.stereotype.Component;

@Component
public class FirebaseTokenVerifier {

    public FirebaseToken verifyToken(String idToken) {
        try {
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            throw new UnauthorizedException("Invalid or expired Firebase token");
        } catch (Exception e) {
            throw new UnauthorizedException("Error verifying Firebase token");
        }
    }
}
