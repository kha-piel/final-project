package org.example.dao;

import org.example.model.Topic;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class TopicDAO {

    public List<Topic> getTopicsBySubjectId(int subjectId) {
        List<Topic> topics = new ArrayList<>();

        try {
            Connection connection = DatabaseConnection.getInstance();
            String idColumn = hasColumn(connection, "topics", "id") ? "id" : "topic_id";
            String subjectIdColumn = hasColumn(connection, "topics", "subject_id") ? "subject_id" : "subjectId";
            String nameColumn = hasColumn(connection, "topics", "name") ? "name" : "topic_name";
            String parentColumn = hasColumn(connection, "topics", "parent_topic_id") ? "parent_topic_id" : null;
            String orderColumn = hasColumn(connection, "topics", "topic_order") ? "topic_order" : null;
            String descriptionColumn = hasColumn(connection, "topics", "description") ? "description" : null;
            String activeColumn = hasColumn(connection, "topics", "is_active") ? "is_active" : null;

            StringBuilder sqlBuilder = new StringBuilder("SELECT ")
                    .append(idColumn)
                    .append(", ")
                    .append(subjectIdColumn)
                    .append(", ")
                    .append(nameColumn);

            if (parentColumn != null) {
                sqlBuilder.append(", ").append(parentColumn);
            }
            if (orderColumn != null) {
                sqlBuilder.append(", ").append(orderColumn);
            }
            if (descriptionColumn != null) {
                sqlBuilder.append(", ").append(descriptionColumn);
            }
            if (activeColumn != null) {
                sqlBuilder.append(", ").append(activeColumn);
            }

            sqlBuilder.append(" FROM topics WHERE ").append(subjectIdColumn).append(" = ?");
            if (orderColumn != null) {
                sqlBuilder.append(" ORDER BY ").append(orderColumn).append(", ").append(nameColumn);
            } else {
                sqlBuilder.append(" ORDER BY ").append(nameColumn);
            }

            try (PreparedStatement stmt = connection.prepareStatement(sqlBuilder.toString())) {
                stmt.setInt(1, subjectId);

                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Topic topic = new Topic();
                        topic.setTopicId(rs.getInt(idColumn));
                        topic.setSubjectId(rs.getInt(subjectIdColumn));
                        topic.setTopicName(rs.getString(nameColumn));

                        if (parentColumn != null) {
                            int parentTopicId = rs.getInt(parentColumn);
                            topic.setParentTopicId(rs.wasNull() ? null : parentTopicId);
                        }
                        if (orderColumn != null) {
                            topic.setTopicOrder(rs.getInt(orderColumn));
                        }
                        if (descriptionColumn != null) {
                            topic.setDescription(rs.getString(descriptionColumn));
                        }
                        if (activeColumn != null) {
                            topic.setActive(rs.getInt(activeColumn) == 1);
                        }

                        topics.add(topic);
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi khi lay danh sach chuyen de theo mon hoc: " + e.getMessage());
            e.printStackTrace();
        }

        return topics;
    }

    private boolean hasColumn(Connection connection, String tableName, String columnName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getColumns(null, null, tableName, columnName)) {
            return rs.next();
        }
    }
}
