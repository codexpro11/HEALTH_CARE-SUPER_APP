package com.healthconnect.android;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Versioned encryption. A valid blob can only be opened under its original logical name. */
final class VaultCipher {
    private static final byte[] MAGIC = "HCVAULT2".getBytes(StandardCharsets.US_ASCII);
    private static final int IV_LENGTH = 12;
    static final int MAX_PLAINTEXT = (int) Rules.MAX_FILE + 2 * 1024 * 1024;
    static final int MAX_ENCRYPTED = MAX_PLAINTEXT + MAGIC.length + IV_LENGTH + 16;

    private VaultCipher() {}

    static byte[] encrypt(SecretKey key, String name, byte[] data) throws GeneralSecurityException {
        Rules.require(data != null && data.length <= MAX_PLAINTEXT, "Secure data exceeds the allowed size.");
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        cipher.updateAAD(identity(name));
        byte[] encrypted = cipher.doFinal(data);
        byte[] iv = cipher.getIV();
        Rules.require(iv.length == IV_LENGTH, "Secure storage returned an unsupported nonce.");
        byte[] result = Arrays.copyOf(MAGIC, MAGIC.length + IV_LENGTH + encrypted.length);
        System.arraycopy(iv, 0, result, MAGIC.length, IV_LENGTH);
        System.arraycopy(encrypted, 0, result, MAGIC.length + IV_LENGTH, encrypted.length);
        return result;
    }

    static byte[] decrypt(SecretKey key, String name, byte[] data) throws GeneralSecurityException, IOException {
        if (data == null || data.length < MAGIC.length + IV_LENGTH + 16 || data.length > MAX_ENCRYPTED
                || !Arrays.equals(MAGIC, Arrays.copyOf(data, MAGIC.length))) {
            throw new IOException("Secure data uses an unsupported or legacy format. It has not been overwritten. See the Phase 7 upgrade notes.");
        }
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, data, MAGIC.length, IV_LENGTH));
        cipher.updateAAD(identity(name));
        int offset = MAGIC.length + IV_LENGTH;
        return cipher.doFinal(data, offset, data.length - offset);
    }

    private static byte[] identity(String name) {
        Rules.require(name != null && !name.isEmpty() && name.length() <= 1024, "Invalid secure file identity.");
        return ("HealthConnect:v2:" + name).getBytes(StandardCharsets.UTF_8);
    }
}
