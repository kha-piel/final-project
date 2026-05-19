package org.example.ui;

import javafx.application.Application;

/**
 * Launcher - diem vao dung cho ung dung JavaFX.
 *
 * Khong chay MainApp truc tiep. Hay chay Launcher hoac org.example.Main
 * de JavaFX runtime duoc khoi dong dung cach.
 */
public class Launcher {

    public static void main(String[] args) {
        Application.launch(MainApp.class, args);
    }
}
