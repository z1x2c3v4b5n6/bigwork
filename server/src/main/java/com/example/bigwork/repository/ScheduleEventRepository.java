package com.example.bigwork.repository;
import com.example.bigwork.model.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent,Long>{List<ScheduleEvent> findByUserIdOrderByEventDateAsc(Long userId);}
