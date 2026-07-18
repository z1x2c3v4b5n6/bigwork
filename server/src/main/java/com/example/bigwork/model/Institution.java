package com.example.bigwork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "institutions")
public class Institution {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=120) private String name;
    @Column(length=80) private String level;
    @Column(length=80) private String region;
    @Column(name="reference_score") private Integer referenceScore;
    @Column(name="score_year") private Integer scoreYear;
    @Column(name="score_label", length=180) private String scoreLabel;
    @Column(columnDefinition="TEXT") private String majors;
    @Column(columnDefinition="TEXT") private String requirement;
    @Column(name="source_url", length=500) private String sourceUrl;
    @Column(name="created_at") private LocalDateTime createdAt;
    @Column(name="updated_at") private LocalDateTime updatedAt;
    public Long getId(){return id;} public void setId(Long v){id=v;}
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getLevel(){return level;} public void setLevel(String v){level=v;}
    public String getRegion(){return region;} public void setRegion(String v){region=v;}
    public Integer getReferenceScore(){return referenceScore;} public void setReferenceScore(Integer v){referenceScore=v;}
    public Integer getScoreYear(){return scoreYear;} public void setScoreYear(Integer v){scoreYear=v;}
    public String getScoreLabel(){return scoreLabel;} public void setScoreLabel(String v){scoreLabel=v;}
    public String getMajors(){return majors;} public void setMajors(String v){majors=v;}
    public String getRequirement(){return requirement;} public void setRequirement(String v){requirement=v;}
    public String getSourceUrl(){return sourceUrl;} public void setSourceUrl(String v){sourceUrl=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
    public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){updatedAt=v;}
}
