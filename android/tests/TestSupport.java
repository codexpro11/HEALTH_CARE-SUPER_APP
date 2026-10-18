package com.healthconnect.android;

final class TestSupport {
    interface Action { void run() throws Exception; }
    private static int checks;
    static void check(boolean condition, String label) {
        checks++;
        if (!condition) throw new AssertionError(label);
    }
    static void rejects(Class<? extends Throwable> type, Action action, String label) throws Exception {
        checks++;
        try { action.run(); }
        catch (Throwable failure) {
            if (type.isInstance(failure)) return;
            throw new AssertionError(label + " returned " + failure.getClass().getSimpleName(), failure);
        }
        throw new AssertionError(label + " was accepted");
    }
    static void done(String suite) { System.out.println(suite + ": " + checks + " checks passed."); }
}
