package org.example.util;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Bam mat khau theo PBKDF2, dong goi ket qua trong mot chuoi duy nhat.
 */
public final class PasswordHasher {

    private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 65_536;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordHasher() {
    }

    public static String hash(String password) {
        byte[] salt = new byte[SALT_LENGTH];
        RANDOM.nextBytes(salt);
        byte[] hash = derive(password, salt, ITERATIONS, KEY_LENGTH);
        return "pbkdf2$"
                + ITERATIONS
                + "$"
                + Base64.getEncoder().encodeToString(salt)
                + "$"
                + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean matches(String rawPassword, String storedValue) {
        if (rawPassword == null || storedValue == null || storedValue.isBlank()) {
            return false;
        }

        if (!storedValue.startsWith("pbkdf2$")) {
            return rawPassword.equals(storedValue);
        }

        String[] parts = storedValue.split("\\$");
        if (parts.length != 4) {
            return false;
        }

        int iterations = Integer.parseInt(parts[1]);
        byte[] salt = Base64.getDecoder().decode(parts[2]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[3]);
        byte[] actualHash = derive(rawPassword, salt, iterations, expectedHash.length * 8);

        if (actualHash.length != expectedHash.length) {
            return false;
        }

        int diff = 0;
        for (int i = 0; i < actualHash.length; i++) {
            diff |= actualHash[i] ^ expectedHash[i];
        }
        return diff == 0;
    }

    public static boolean isLegacyPlaintext(String storedValue) {
        return storedValue != null && !storedValue.startsWith("pbkdf2$");
    }

    private static byte[] derive(String password, byte[] salt, int iterations, int keyLength) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, keyLength);
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance(ALGORITHM);
            return factory.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            throw new IllegalStateException("Khong the bam mat khau bang " + ALGORITHM, ex);
        } finally {
            spec.clearPassword();
        }
    }
}
