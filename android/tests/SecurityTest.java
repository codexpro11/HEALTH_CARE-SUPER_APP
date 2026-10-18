package com.healthconnect.android;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import static com.healthconnect.android.TestSupport.*;

public final class SecurityTest {
    public static void main(String[] args) throws Exception {
        KeyGenerator generator = KeyGenerator.getInstance("AES");
        generator.init(256);
        SecretKey key = generator.generateKey();
        String patientA = "file:patient-a:record-1", patientB = "file:patient-b:record-1";
        byte[] medical = "synthetic record".getBytes(StandardCharsets.UTF_8);
        byte[] encrypted = VaultCipher.encrypt(key, patientA, medical);
        check(Arrays.equals(medical, VaultCipher.decrypt(key, patientA, encrypted)), "same identity round trip");
        check(!Arrays.equals(encrypted, VaultCipher.encrypt(key, patientA, medical)), "fresh nonce per write");
        rejects(GeneralSecurityException.class, () -> VaultCipher.decrypt(key, patientB, encrypted), "cross-account blob swap");
        rejects(GeneralSecurityException.class, () -> VaultCipher.decrypt(key, "file:patient-a:record-2", encrypted), "cross-record blob swap");
        rejects(GeneralSecurityException.class, () -> VaultCipher.decrypt(generator.generateKey(), patientA, encrypted), "wrong key");
        for (int index = 0; index < encrypted.length; index++) {
            byte[] tampered = encrypted.clone();
            tampered[index] ^= 1;
            rejects(Exception.class, () -> VaultCipher.decrypt(key, patientA, tampered), "tampered byte " + index);
        }
        for (int length : new int[]{0, 1, 12, 28, 35}) {
            rejects(IOException.class, () -> VaultCipher.decrypt(key, patientA, new byte[length]), "legacy/truncated blob");
        }
        check(VaultCipher.decrypt(key, patientA, VaultCipher.encrypt(key, patientA, new byte[0])).length == 0, "empty document state round trip");
        rejects(IllegalArgumentException.class, () -> VaultCipher.encrypt(key, "", medical), "empty identity");
        rejects(IllegalArgumentException.class, () -> VaultCipher.encrypt(key, patientA, new byte[VaultCipher.MAX_PLAINTEXT + 1]), "oversized plaintext");

        long now = 1_700_000_000_000L;
        SessionTokens tokens = new SessionTokens("patient-a", "old-access", "refresh-1", now + 3600_000);
        rejects(IllegalArgumentException.class, () -> tokens.install("refresh-1", "patient-b", "foreign", "foreign-refresh", 3600, now), "foreign refreshed identity");
        check("old-access".equals(tokens.current(now)), "rejected refresh preserves access");
        check("refresh-1".equals(tokens.refreshToken()), "rejected refresh preserves refresh token");
        for (long ttl : new long[]{-1, 0, 60, 86401, Long.MAX_VALUE}) {
            rejects(IllegalArgumentException.class, () -> tokens.install("refresh-1", "patient-a", "new", "next", ttl, now), "invalid expiry");
        }
        rejects(IllegalArgumentException.class, () -> tokens.install("refresh-1", "patient-a", "", "next", 3600, now), "blank access token");
        rejects(IllegalArgumentException.class, () -> tokens.install("stale", "patient-a", "new", "next", 3600, now), "stale refresh result");
        rejects(ArithmeticException.class, () -> tokens.install("refresh-1", "patient-a", "overflow", "next", 3600, Long.MAX_VALUE - 10), "expiry overflow");
        check("old-access".equals(tokens.current(now)), "malformed refreshes preserve old state");
        tokens.install("refresh-1", "patient-a", "new-access", "refresh-2", 3600, now);
        check("new-access".equals(tokens.current(now)), "valid refresh committed");
        check(tokens.current(now + 3540_000) == null, "refresh margin at expiry boundary");
        AtomicBoolean saved = new AtomicBoolean();
        tokens.remember(value -> saved.set("refresh-2".equals(value)));
        check(saved.get(), "remember uses rotated refresh token");
        tokens.close();
        rejects(IllegalArgumentException.class, () -> tokens.current(now), "closed access");
        rejects(IllegalArgumentException.class, tokens::refreshToken, "closed refresh");
        rejects(IllegalArgumentException.class, () -> tokens.remember(value -> { throw new AssertionError("late persistence"); }), "closed persistence");

        SessionTokens racing = new SessionTokens("patient-a", "", "refresh", now);
        CountDownLatch started = new CountDownLatch(1), finish = new CountDownLatch(1);
        ExecutorService worker = Executors.newSingleThreadExecutor();
        try {
            Future<Boolean> late = worker.submit(() -> {
                String requested = racing.refreshToken();
                started.countDown();
                if (!finish.await(5, TimeUnit.SECONDS)) throw new AssertionError("refresh race timed out");
                try { racing.install(requested, "patient-a", "late-token", "late-refresh", 3600, now); return false; }
                catch (IllegalArgumentException expected) { return true; }
            });
            check(started.await(5, TimeUnit.SECONDS), "refresh started");
            racing.close();
            finish.countDown();
            check(late.get(5, TimeUnit.SECONDS), "sign out rejects a late refresh");
        } finally { finish.countDown(); worker.shutdownNow(); }
        done("Security");
    }
}
