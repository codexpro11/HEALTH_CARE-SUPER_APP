package com.healthconnect.android;

/** Small lock-protected credential state. Network refresh never holds this lock. */
final class SessionTokens {
    interface Remember { void save(String refreshToken) throws Exception; }
    private final String uid;
    private String access, refresh;
    private long expiresAt;
    private boolean closed;

    SessionTokens(String uid, String access, String refresh, long expiresAt) {
        Rules.require(uid != null && !uid.isEmpty(), "Authentication returned no account identity.");
        this.uid = uid;
        this.access = access;
        this.refresh = refresh;
        this.expiresAt = expiresAt;
    }

    synchronized void ensureActive() { Rules.require(!closed, "This session has ended. Sign in again."); }

    synchronized String current(long now) {
        ensureActive();
        return access != null && !access.isEmpty() && expiresAt > now + 60_000 ? access : null;
    }

    synchronized String refreshToken() {
        ensureActive();
        Rules.require(refresh != null && !refresh.isEmpty(), "Sign in again.");
        return refresh;
    }

    synchronized void install(String requestedRefresh, String refreshedUid, String nextAccess,
                              String nextRefresh, long expiresIn, long now) {
        ensureActive();
        Rules.require(uid.equals(refreshedUid), "The refreshed account does not match this session.");
        Rules.require(refresh.equals(requestedRefresh), "A newer refresh has already replaced this result.");
        Rules.require(nextAccess != null && !nextAccess.trim().isEmpty() && nextRefresh != null && !nextRefresh.trim().isEmpty(),
                "Authentication returned incomplete credentials.");
        Rules.require(expiresIn > 60 && expiresIn <= 86_400, "Authentication returned an invalid token lifetime.");
        // Commit only after every field is validated. Rejected responses cannot poison the session.
        long nextExpiry = Math.addExact(now, Math.multiplyExact(expiresIn, 1000));
        access = nextAccess;
        refresh = nextRefresh;
        expiresAt = nextExpiry;
    }

    synchronized void remember(Remember writer) throws Exception {
        ensureActive();
        writer.save(refresh);
    }

    synchronized void close() {
        closed = true;
        access = "";
        refresh = "";
        expiresAt = 0;
    }
}
