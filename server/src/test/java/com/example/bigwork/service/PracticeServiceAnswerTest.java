package com.example.bigwork.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PracticeServiceAnswerTest {
    private final PracticeService service = new PracticeService(null, null, null, null);

    @Test
    void acceptsEquivalentInterviewAnswerWithDifferentPhrasing() {
        assertTrue(service.answerMatches(
                "进程是资源分配的基本单位，线程是CPU调度的基本单位",
                "进程主要负责资源分配，而线程才是处理器进行调度的基本单位"
        ));
    }

    @Test
    void acceptsMostMaintainedKeywords() {
        assertTrue(service.answerMatches(
                "封装|继承|多态",
                "面向对象的主要特征包括封装和继承，也支持多态"
        ));
    }

    @Test
    void rejectsUnrelatedAnswer() {
        assertFalse(service.answerMatches(
                "TCP通过三次握手建立连接",
                "数据库索引用于提高查询速度"
        ));
    }
}
