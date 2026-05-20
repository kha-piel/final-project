package org.example.util;

import java.sql.Connection;

/**
 * Tien ich chay tay de dam bao schema + du lieu mau da duoc tao.
 */
public class DataSeeder {

    public static void main(String[] args) {
        try (Connection connection = DatabaseConnection.getInstance()) {
            DatabaseInitializer.initialize(connection);
            System.out.println("Da khoi tao schema va du lieu mau tai: " + DatabaseConnection.getDatabasePath());
        } catch (Exception e) {
            System.err.println("Loi khi khoi tao du lieu: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
