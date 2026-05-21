package org.example.model;

public class Topic {

    private int topicId;
    private int subjectId;
    private Integer parentTopicId;
    private String topicName;
    private int topicOrder;
    private String description;
    private boolean active;

    public Topic() {
    }

    public int getTopicId() {
        return topicId;
    }

    public void setTopicId(int topicId) {
        this.topicId = topicId;
    }

    public int getId() {
        return topicId;
    }

    public void setId(int id) {
        this.topicId = id;
    }

    public int getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(int subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getParentTopicId() {
        return parentTopicId;
    }

    public void setParentTopicId(Integer parentTopicId) {
        this.parentTopicId = parentTopicId;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public String getName() {
        return topicName;
    }

    public void setName(String name) {
        this.topicName = name;
    }

    public int getTopicOrder() {
        return topicOrder;
    }

    public void setTopicOrder(int topicOrder) {
        this.topicOrder = topicOrder;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public String toString() {
        return topicName != null ? topicName : "";
    }
}
