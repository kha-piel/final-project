package org.example.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import org.example.dao.BookmarkDAO;
import org.example.model.BookmarkedQuestionDTO;

import java.util.List;

public class BookmarkedQuestionsView extends BorderPane {

    private final Stage stage;
    private final Runnable backAction;
    private final BookmarkDAO bookmarkDAO;
    private final int currentUserId;
    private final VBox contentBox = new VBox(14);

    public BookmarkedQuestionsView(Stage stage,
                                   Runnable backAction,
                                   BookmarkDAO bookmarkDAO,
                                   int currentUserId) {
        this.stage = stage;
        this.backAction = backAction;
        this.bookmarkDAO = bookmarkDAO;
        this.currentUserId = currentUserId;
        buildUi();
        loadBookmarks();
    }

    private void buildUi() {
        setPadding(new Insets(24));
        setStyle("-fx-background-color: linear-gradient(to bottom right, #f8fbff, #eef4ff);");

        Button backButton = new Button("Quay lai Trang chu");
        backButton.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-text-fill: #1d4ed8;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 16 10 16;" +
                        "-fx-background-radius: 10;" +
                        "-fx-border-radius: 10;" +
                        "-fx-border-color: #bfdbfe;"
        );
        backButton.setOnAction(event -> backAction.run());

        Label title = new Label("Cau hoi da danh dau");
        title.setStyle("-fx-font-size: 28px; -fx-font-weight: bold; -fx-text-fill: #12304a;");

        Label subtitle = new Label("Tap trung vao nhung cau can xem lai de on tap co chu dich.");
        subtitle.setStyle("-fx-font-size: 14px; -fx-text-fill: #5f7287;");

        VBox headerText = new VBox(6, title, subtitle);
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        HBox header = new HBox(16, backButton, spacer, headerText);
        header.setAlignment(Pos.CENTER_LEFT);

        contentBox.setPadding(new Insets(4));
        ScrollPane scrollPane = new ScrollPane(contentBox);
        scrollPane.setFitToWidth(true);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setStyle("-fx-background-color: transparent; -fx-background: transparent;");

        setTop(header);
        setCenter(scrollPane);
    }

    private void loadBookmarks() {
        contentBox.getChildren().clear();

        List<BookmarkedQuestionDTO> bookmarks = bookmarkDAO.getBookmarkedQuestionsByUserId(currentUserId);
        if (bookmarks.isEmpty()) {
            Label emptyTitle = new Label("Ban chua danh dau cau hoi nao.");
            emptyTitle.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1f2937;");

            Label emptySubtitle = new Label("Sau khi nop bai, ban co the bam 'Danh dau cau hoi' o man review de luu lai.");
            emptySubtitle.setWrapText(true);
            emptySubtitle.setStyle("-fx-font-size: 14px; -fx-text-fill: #64748b;");

            VBox emptyCard = new VBox(8, emptyTitle, emptySubtitle);
            emptyCard.setPadding(new Insets(24));
            emptyCard.setStyle(
                    "-fx-background-color: #ffffff;" +
                            "-fx-background-radius: 18;" +
                            "-fx-border-color: #d9e3ef;" +
                            "-fx-border-radius: 18;"
            );
            contentBox.getChildren().add(emptyCard);
            return;
        }

        for (int i = 0; i < bookmarks.size(); i++) {
            contentBox.getChildren().add(buildBookmarkCard(i + 1, bookmarks.get(i)));
        }
    }

    private VBox buildBookmarkCard(int index, BookmarkedQuestionDTO item) {
        Label orderLabel = new Label("Cau danh dau #" + index);
        orderLabel.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: #2563eb;");

        Label topicLabel = new Label("Chuyen de: " + item.getTopicLabel());
        topicLabel.setWrapText(true);
        topicLabel.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: #0f766e;");

        Label questionLabel = new Label(item.getQuestionContent());
        questionLabel.setWrapText(true);
        questionLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1f2937;");

        String bookmarkedAt = item.getBookmarkedAt() != null && !item.getBookmarkedAt().isBlank()
                ? item.getBookmarkedAt()
                : "Khong ro thoi gian";
        Label timeLabel = new Label("Da danh dau luc: " + bookmarkedAt);
        timeLabel.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748b;");

        Button removeButton = new Button("Bo danh dau");
        removeButton.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-text-fill: #b91c1c;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 16 10 16;" +
                        "-fx-background-radius: 12;" +
                        "-fx-border-color: #f5b4b4;" +
                        "-fx-border-radius: 12;"
        );
        removeButton.setOnAction(event -> handleRemoveBookmark(item.getQuestionId()));

        HBox actions = new HBox(removeButton);
        actions.setAlignment(Pos.CENTER_LEFT);

        VBox card = new VBox(10, orderLabel, topicLabel, questionLabel, timeLabel, actions);
        card.setPadding(new Insets(18));
        card.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-background-radius: 18;" +
                        "-fx-border-color: #d9e3ef;" +
                        "-fx-border-radius: 18;"
        );
        return card;
    }

    private void handleRemoveBookmark(int questionId) {
        boolean removed = bookmarkDAO.removeBookmark(currentUserId, questionId);
        if (!removed) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.initOwner(stage);
            alert.setTitle("Loi");
            alert.setHeaderText(null);
            alert.setContentText("Khong the bo danh dau cau hoi nay.");
            alert.showAndWait();
            return;
        }

        loadBookmarks();
    }
}
