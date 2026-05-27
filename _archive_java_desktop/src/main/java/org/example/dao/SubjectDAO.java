package org.example.dao;

import org.example.model.Subject;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class SubjectDAO {

    public List<Subject> getAllSubjects() {
        List<Subject> subjects = new ArrayList<>();

        try {
            Connection connection = DatabaseConnection.getInstance();
            String idColumn = hasColumn(connection, "subjects", "id") ? "id" : "subject_id";
            String nameColumn = hasColumn(connection, "subjects", "name") ? "name" : "subject_name";
            String codeColumn = hasColumn(connection, "subjects", "subject_code") ? "subject_code" : null;
            String activeColumn = hasColumn(connection, "subjects", "is_active") ? "is_active" : null;

            StringBuilder sqlBuilder = new StringBuilder("SELECT ")
                    .append(idColumn)
                    .append(", ")
                    .append(nameColumn);

            if (codeColumn != null) {
                sqlBuilder.append(", ").append(codeColumn);
            }
            if (activeColumn != null) {
                sqlBuilder.append(", ").append(activeColumn);
            }
            sqlBuilder.append(" FROM subjects");

            try (Statement stmt = connection.createStatement();
                 ResultSet rs = stmt.executeQuery(sqlBuilder.toString())) {
                while (rs.next()) {
                    Subject subject = new Subject();
                    subject.setSubjectId(rs.getInt(idColumn));
                    subject.setSubjectName(rs.getString(nameColumn));

                    if (codeColumn != null) {
                        subject.setSubjectCode(rs.getString(codeColumn));
                    }
                    if (activeColumn != null) {
                        subject.setActive(rs.getInt(activeColumn) == 1);
                    }

                    subjects.add(subject);
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi khi lay danh sach mon hoc: " + e.getMessage());
            e.printStackTrace();
        }

        return subjects;
    }

    private boolean hasColumn(Connection connection, String tableName, String columnName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getColumns(null, null, tableName, columnName)) {
            return rs.next();
        }
    }
}
