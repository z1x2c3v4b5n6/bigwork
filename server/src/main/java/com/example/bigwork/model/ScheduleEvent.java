package com.example.bigwork.model;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="schedule_events")
public class ScheduleEvent {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="user_id",nullable=false) private Long userId;
 @Column(nullable=false,length=150) private String title;
 @Column(name="event_date",nullable=false) private LocalDate eventDate;
 @Column(length=20,nullable=false) private String type="study";
 public Long getId(){return id;} public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;} public LocalDate getEventDate(){return eventDate;}
 public void setEventDate(LocalDate v){eventDate=v;} public String getType(){return type;} public void setType(String v){type=v;}
}
