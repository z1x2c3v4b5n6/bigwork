package com.example.bigwork.controller;

import com.example.bigwork.dto.InstitutionRequest;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.Institution;
import com.example.bigwork.model.User;
import com.example.bigwork.repository.UserRepository;
import com.example.bigwork.service.InstitutionService;
import com.example.bigwork.support.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class InstitutionController {
    private static final String KEY="AUTH_USER";
    private final InstitutionService service; private final UserRepository users;
    public InstitutionController(InstitutionService service,UserRepository users){this.service=service;this.users=users;}
    private SessionUser user(HttpSession s){SessionUser u=(SessionUser)s.getAttribute(KEY);if(u==null)throw new BusinessException(HttpStatus.UNAUTHORIZED,"请先登录");return u;}
    private void admin(HttpSession s){if(!"admin".equalsIgnoreCase(user(s).getRole()))throw new BusinessException(HttpStatus.FORBIDDEN,"仅管理员可操作");}

    @GetMapping("/api/portal/institutions-v2")
    public Map<String,Object> recommend(@RequestParam(required=false)String region,@RequestParam(required=false)String level,
                                        @RequestParam(required=false)Integer minScore,@RequestParam(required=false)Integer maxScore,HttpSession session){
        User profile=users.findById(user(session).getId()).orElseThrow();int score=profile.getExamScore()==null?0:profile.getExamScore();
        String major=profile.getTargetMajor()==null||profile.getTargetMajor().isBlank()?"未设置":profile.getTargetMajor();
        List<Map<String,Object>> rows=service.list().stream().filter(i->"未设置".equals(major)||service.majors(i).contains(major))
                .filter(i->region==null||region.isBlank()||region.equals(i.getRegion())).filter(i->level==null||level.isBlank()||(i.getLevel()!=null&&i.getLevel().contains(level)))
                .filter(i->minScore==null||Optional.ofNullable(i.getReferenceScore()).orElse(0)>=minScore).filter(i->maxScore==null||Optional.ofNullable(i.getReferenceScore()).orElse(500)<=maxScore)
                .map(i->row(i,major,score)).sorted((a,b)->Integer.compare((int)b.get("match"),(int)a.get("match"))).toList();
        Set<String> regions=new TreeSet<>();service.list().forEach(i->{if(i.getRegion()!=null)regions.add(i.getRegion());});
        String note=rows.isEmpty()?"当前院校库暂无与“"+major+"”完全匹配的记录，不会使用无关专业代替推荐。":"仅展示院校库中明确包含“"+major+"”的院校；分数线仅供初筛。";
        return Map.of("institutions",rows,"profile",Map.of("score",score,"major",major),"dataNote",note,"regions",regions);
    }
    private Map<String,Object> row(Institution i,String major,int score){int line=Optional.ofNullable(i.getReferenceScore()).orElse(0);Map<String,Object> r=new LinkedHashMap<>();r.put("id",i.getId());r.put("name",i.getName());r.put("level",or(i.getLevel(),"普通院校"));r.put("region",or(i.getRegion(),"未设置"));r.put("referenceScore",line);r.put("scoreYear",i.getScoreYear());r.put("scoreLabel",or(i.getScoreLabel(),"往年参考线"));r.put("direction","未设置".equals(major)?service.majors(i).stream().findFirst().orElse("未设置"):major);r.put("majors",service.majors(i));r.put("requirement",or(i.getRequirement(),"以当年招生简章为准"));r.put("sourceUrl",or(i.getSourceUrl(),""));r.put("majorMatched",!"未设置".equals(major));r.put("match",score==0?78:Math.max(50,Math.min(98,88+(score-line)/4)));r.put("chance",score==0?"待填写成绩":score>=line+20?"较稳":score>=line?"可冲":"需提升");return r;}
    private String or(String v,String fallback){return v==null||v.isBlank()?fallback:v;}

    @GetMapping("/api/admin/institutions") public Map<String,Object> list(HttpSession s){admin(s);return Map.of("institutions",service.list());}
    @PostMapping("/api/admin/institutions") @ResponseStatus(HttpStatus.CREATED) public Institution create(@Valid @RequestBody InstitutionRequest r,HttpSession s){admin(s);return service.create(r);}
    @PutMapping("/api/admin/institutions/{id}") public Institution update(@PathVariable Long id,@Valid @RequestBody InstitutionRequest r,HttpSession s){admin(s);return service.update(id,r);}
    @DeleteMapping("/api/admin/institutions/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,HttpSession s){admin(s);service.delete(id);}
}
