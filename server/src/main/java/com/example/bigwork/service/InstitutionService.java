package com.example.bigwork.service;

import com.example.bigwork.dto.InstitutionRequest;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.Institution;
import com.example.bigwork.repository.InstitutionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class InstitutionService {
    private final InstitutionRepository repository;
    public InstitutionService(InstitutionRepository repository){this.repository=repository;}
    public List<Institution> list(){return repository.findAll();}
    @Transactional public Institution create(InstitutionRequest r){Institution i=new Institution();apply(i,r);i.setCreatedAt(LocalDateTime.now());return repository.save(i);}
    @Transactional public Institution update(Long id,InstitutionRequest r){Institution i=repository.findById(id).orElseThrow(()->new BusinessException(HttpStatus.NOT_FOUND,"院校不存在"));apply(i,r);return repository.save(i);}
    @Transactional public void delete(Long id){if(!repository.existsById(id))throw new BusinessException(HttpStatus.NOT_FOUND,"院校不存在");repository.deleteById(id);}
    private void apply(Institution i,InstitutionRequest r){i.setName(r.name().trim());i.setLevel(r.level());i.setRegion(r.region());i.setReferenceScore(r.referenceScore());i.setScoreYear(r.scoreYear());i.setScoreLabel(r.scoreLabel());i.setMajors(r.majors());i.setRequirement(r.requirement());i.setSourceUrl(r.sourceUrl());i.setUpdatedAt(LocalDateTime.now());}
    public List<String> majors(Institution i){return i.getMajors()==null?List.of():Arrays.stream(i.getMajors().split("[,，|]" )).map(String::trim).filter(s->!s.isBlank()).toList();}
}
