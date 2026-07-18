package com.example.bigwork.model;
import jakarta.persistence.*;
@Entity @Table(name="forum_interactions",uniqueConstraints=@UniqueConstraint(columnNames={"topic_id","user_id"}))
public class ForumInteraction {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="topic_id",nullable=false) private Long topicId;
 @Column(name="user_id",nullable=false) private Long userId;
 private boolean liked; private boolean favorited;
 public Long getId(){return id;} public Long getTopicId(){return topicId;} public void setTopicId(Long v){topicId=v;} public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;} public boolean isLiked(){return liked;} public void setLiked(boolean v){liked=v;} public boolean isFavorited(){return favorited;} public void setFavorited(boolean v){favorited=v;}
}
