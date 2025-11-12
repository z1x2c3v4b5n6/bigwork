"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecommendationResponse = void 0;
var universityProfiles_1 = require("../data/universityProfiles");
var matchLevelOrder = {
    稳妥: 0,
    冲刺: 1,
    保底: 2,
    高风险: 3,
};
var normalizeMajor = function (major) {
    if (!major) {
        return '';
    }
    return String(major).trim().toLowerCase();
};
var normalizeMathSubject = function (value) {
    if (!value) {
        return '';
    }
    var normalized = String(value).replace(/\s+/g, '').toLowerCase();
    if (/(数学|数)[一1]/.test(normalized)) {
        return 'math1';
    }
    if (/(数学|数)[二2]/.test(normalized)) {
        return 'math2';
    }
    if (/(数学|数)[三3]/.test(normalized)) {
        return 'math3';
    }
    if (/不考|无数学|免数学/.test(normalized)) {
        return 'mathNone';
    }
    return normalized;
};
var normalizeEnglishSubject = function (value) {
    if (!value) {
        return '';
    }
    var normalized = String(value).replace(/\s+/g, '').toLowerCase();
    if (/(英语|英)[一1]/.test(normalized)) {
        return 'eng1';
    }
    if (/(英语|英)[二2]/.test(normalized)) {
        return 'eng2';
    }
    return normalized;
};
var formatExamSubjects = function (subjects) {
    if (subjects === void 0) { subjects = {}; }
    var items = [];
    if (subjects.math) {
        items.push("\u6570\u5B66\uFF1A".concat(subjects.math));
    }
    if (subjects.english) {
        items.push("\u82F1\u8BED\uFF1A".concat(subjects.english));
    }
    if (subjects.professional) {
        items.push("\u4E13\u4E1A\u8BFE\uFF1A".concat(subjects.professional));
    }
    if (subjects.politics) {
        items.push("\u653F\u6CBB\uFF1A".concat(subjects.politics));
    }
    return items.join(' · ');
};
var buildSubjectAdvice = function (subjects, preferences, matches) {
    if (preferences === void 0) { preferences = {}; }
    var preferenceValues = [];
    if (preferences === null || preferences === void 0 ? void 0 : preferences.math) {
        preferenceValues.push(preferences.math);
    }
    if (preferences === null || preferences === void 0 ? void 0 : preferences.english) {
        preferenceValues.push(preferences.english);
    }
    var preferenceText = preferenceValues.length > 0 ? preferenceValues.join(' / ') : '';
    var baseRequirement = formatExamSubjects(subjects);
    if (!preferenceText) {
        return baseRequirement ? "\u521D\u8BD5\u79D1\u76EE\u8981\u6C42\uFF1A".concat(baseRequirement, "\u3002") : '初试科目以院校最新简章为准。';
    }
    var requirementText = baseRequirement ? "\u521D\u8BD5\u79D1\u76EE\u8981\u6C42\uFF1A".concat(baseRequirement, "\u3002") : '';
    if (matches.math && matches.english) {
        return "".concat(requirementText, "\u4E0E\u4F60\u9009\u62E9\u7684\u79D1\u76EE\uFF08").concat(preferenceText, "\uFF09\u5B8C\u5168\u5339\u914D\uFF0C\u53EF\u76F4\u63A5\u53C2\u8003\u8BE5\u9662\u6821\u7684\u5907\u8003\u89C4\u5212\u3002").trim();
    }
    var mismatchReasons = [];
    if (!matches.math && (preferences === null || preferences === void 0 ? void 0 : preferences.math)) {
        mismatchReasons.push("\u6570\u5B66\u79D1\u76EE\u8981\u6C42\u4E3A ".concat(subjects.math || '院校自定'));
    }
    if (!matches.english && (preferences === null || preferences === void 0 ? void 0 : preferences.english)) {
        mismatchReasons.push("\u82F1\u8BED\u79D1\u76EE\u8981\u6C42\u4E3A ".concat(subjects.english || '院校自定'));
    }
    var mismatchText = mismatchReasons.join('，');
    var message = "".concat(requirementText, "\u4E0E\u4F60\u9009\u62E9\u7684\u79D1\u76EE\uFF08").concat(preferenceText, "\uFF09\u5B58\u5728\u5DEE\u5F02\uFF0C").concat(mismatchText, "\uFF0C\u8BF7\u8BC4\u4F30\u662F\u5426\u8865\u5145\u5907\u8003\u6216\u8C03\u6574\u5FD7\u613F\u3002");
    return message.trim();
};
var getScoreBand = function (score) {
    if (score >= 420) {
        return '420+ 卓越冲刺档：具备冲击顶尖院校的硬实力';
    }
    if (score >= 400) {
        return '400-419 稳固优势档：大部分985/热门专业具备竞争力';
    }
    if (score >= 380) {
        return '380-399 综合提升档：兼顾冲刺与稳妥院校的黄金分段';
    }
    if (score >= 360) {
        return '360-379 重点强化档：重点院校需突出亮点，建议搭配保底';
    }
    return '360 以下夯实基础档：建议选择稳妥与保底院校组合，同时提升复试竞争力';
};
var buildMatchReason = function (score, university) {
    var diff = score - university.score.recommended;
    var diffAbs = Math.abs(diff);
    var base = "\u8FD1\u5E74\u62DF\u5F55\u53D6\u7EBF\u7EA6 ".concat(university.score.recommended, " \u5206");
    if (diff >= 15) {
        return "".concat(base, "\uFF0C\u4F60\u7684\u5206\u6570\u9AD8\u51FA ").concat(diff, " \u5206\uFF0C\u590D\u8BD5\u53D1\u6325\u6B63\u5E38\u5373\u53EF\u7A33\u59A5\u5F55\u53D6\u3002");
    }
    if (diff >= 5) {
        return "".concat(base, "\uFF0C\u4F60\u7684\u5206\u6570\u9886\u5148 ").concat(diff, " \u5206\uFF0C\u4FDD\u6301\u590D\u8BD5\u7A33\u5B9A\u8F93\u51FA\u5373\u53EF\u3002");
    }
    if (diff >= -10) {
        return "".concat(base, "\uFF0C\u4F60\u7684\u5206\u6570\u53EA\u4F4E\u4E8E ").concat(diffAbs, " \u5206\uFF0C\u590D\u8BD5\u7A81\u51FA\u4F18\u52BF\u6709\u671B\u9006\u88AD\u3002");
    }
    return "".concat(base, "\uFF0C\u5F53\u524D\u5206\u5DEE ").concat(diffAbs, " \u5206\uFF0C\u5EFA\u8BAE\u7A81\u51FA\u79D1\u7814/\u5B9E\u8DF5\u4EAE\u70B9\u6216\u51C6\u5907\u8C03\u5242\u65B9\u6848\u3002");
};
var evaluateMatchLevel = function (score, university) {
    var diff = score - university.score.recommended;
    if (diff >= 15) {
        return '保底';
    }
    if (diff >= 5) {
        return '稳妥';
    }
    if (diff >= -10) {
        return '冲刺';
    }
    return '高风险';
};
var buildRecommendations = function (totalScore, major, examPreferences) {
    if (examPreferences === void 0) { examPreferences = {}; }
    var normalizedMajor = normalizeMajor(major);
    var normalizedPreferences = {
        math: normalizeMathSubject(examPreferences === null || examPreferences === void 0 ? void 0 : examPreferences.math),
        english: normalizeEnglishSubject(examPreferences === null || examPreferences === void 0 ? void 0 : examPreferences.english),
    };
    var results = universityProfiles_1.universityProfiles
        .map(function (university) {
        var _a;
        var matchLevel = evaluateMatchLevel(totalScore, university);
        var diff = totalScore - university.score.recommended;
        var majorMatched = normalizedMajor
            ? (_a = university.majors) === null || _a === void 0 ? void 0 : _a.some(function (item) { return normalizeMajor(item).includes(normalizedMajor); })
            : true;
        var majorBoost = majorMatched ? 8 : 0;
        var diffScore = diff >= 0 ? diff : diff * 0.6;
        var levelScore = (3 - matchLevelOrder[matchLevel]) * 12;
        var examSubjects = university.examSubjects || {};
        var mathRequirement = normalizeMathSubject(examSubjects.math);
        var englishRequirement = normalizeEnglishSubject(examSubjects.english);
        var mathMatches = !normalizedPreferences.math || !mathRequirement
            ? true
            : normalizedPreferences.math === mathRequirement;
        var englishMatches = !normalizedPreferences.english || !englishRequirement
            ? true
            : normalizedPreferences.english === englishRequirement;
        var subjectScore = (normalizedPreferences.math ? (mathMatches ? 8 : -12) : 0) +
            (normalizedPreferences.english ? (englishMatches ? 6 : -10) : 0);
        var compositeScore = levelScore * 2 + diffScore + majorBoost + subjectScore;
        return {
            id: university.id,
            name: university.name,
            province: university.province,
            level: university.level,
            category: university.category,
            tags: university.tags,
            scoreWindow: "\u56FD\u5BB6\u7EBF/\u6821\u7EBF ".concat(university.score.floor, " - ").concat(university.score.recommended, " \u5206"),
            highlights: university.strengths,
            matchLevel: matchLevel,
            matchReason: buildMatchReason(totalScore, university),
            interviewFocus: university.interviewFocus,
            examSubjects: university.examSubjects,
            subjectMatch: mathMatches && englishMatches,
            subjectAdvice: buildSubjectAdvice(university.examSubjects, examPreferences, { math: mathMatches, english: englishMatches }),
            scoreDelta: diff,
            compositeScore: compositeScore,
        };
    })
        .filter(function (item) { return item.scoreDelta >= -25 || item.matchLevel !== '高风险'; })
        .sort(function (a, b) {
        var levelDiff = matchLevelOrder[a.matchLevel] - matchLevelOrder[b.matchLevel];
        if (levelDiff !== 0) {
            return levelDiff;
        }
        if (b.compositeScore !== a.compositeScore) {
            return b.compositeScore - a.compositeScore;
        }
        return b.scoreDelta - a.scoreDelta;
    });
    var recommendedUniversities = results.slice(0, 6).map(function (item) {
        var scoreDelta = item.scoreDelta, compositeScore = item.compositeScore, rest = __rest(item, ["scoreDelta", "compositeScore"]);
        return rest;
    });
    var focusTopics = Array.from(new Set(recommendedUniversities
        .flatMap(function (item) { return item.interviewFocus || []; })
        .filter(function (topic) { return Boolean(topic); }))).slice(0, 8);
    return {
        recommendedUniversities: recommendedUniversities,
        focusTopics: focusTopics,
    };
};
var buildInterviewPreparation = function (focusTopics) {
    var timeline = [
        {
            stage: '出分当周',
            items: [
                '完成成绩复盘，整理各科优势与短板，明确想要冲刺/稳妥的院校组合。',
                '收集目标院校复试方案、近三年真题与面试常见问题。',
            ],
        },
        {
            stage: '复试准备期（D-21 ~ D-7）',
            items: [
                '针对专业课热点整理答题框架，准备 2-3 个代表性项目或科研案例。',
                '每天至少 30 分钟英文口语训练，覆盖自我介绍与问答过渡。',
                '准备综合素质问题（职业规划、团队协作、抗压经历）的 STAR 结构回答。',
            ],
        },
        {
            stage: '复试冲刺周',
            items: [
                '按照目标院校复试流程进行至少 2 次全真模拟，邀请同伴或导师点评。',
                '完善复试材料（简历、成绩单、获奖证明等）并提前打印备份。',
                '保持作息与心态稳定，复盘常见问题关键词和英文口语表达。',
            ],
        },
    ];
    var suggestions = [
        '构建“冲刺 + 稳妥 + 保底”三层院校池，避免复试节点临时被动调剂。',
        '将科研/实践经历按照背景-任务-行动-结果（STAR）结构输出，突出个人贡献。',
        '准备一段 1.5 分钟左右的中文与英文自我介绍，呼应报考动机与未来规划。',
    ];
    if (focusTopics.length > 0) {
        suggestions.push("\u91CD\u70B9\u5173\u6CE8 ".concat(focusTopics.slice(0, 3).join('、'), " \u7B49\u9AD8\u9891\u590D\u8BD5\u4E3B\u9898\uFF0C\u51C6\u5907\u5DEE\u5F02\u5316\u4EAE\u70B9\u3002"));
    }
    var resources = [
        {
            name: '复试自我介绍模板（含中英文）',
            url: 'https://yz.chsi.com.cn/kyzx/jyzl/202212/20221220/2235205777.html',
            description: '提供结构化自我介绍范式，可快速替换成个人经历。',
        },
        {
            name: '复试专业课高频题整理表',
            url: 'https://www.chinakaoyan.com/info/article/id/344359.shtml',
            description: '覆盖近三年热门院校专业课考察要点与答题思路。',
        },
    ];
    return {
        timeline: timeline,
        suggestions: suggestions,
        focusTopics: focusTopics,
        resources: resources,
    };
};
var buildStrategy = function (totalScore, recommended) {
    var topMatch = recommended[0];
    var hasStable = recommended.some(function (item) { return item.matchLevel === '稳妥'; });
    var hasSprint = recommended.some(function (item) { return item.matchLevel === '冲刺'; });
    var hasSafe = recommended.some(function (item) { return item.matchLevel === '保底'; });
    var strategy = [];
    if (topMatch) {
        var focusPreview = (topMatch.interviewFocus || []).slice(0, 2).join('、') || '综合素质';
        strategy.push("\u4F18\u5148\u9501\u5B9A ".concat(topMatch.name, " \u7B49 ").concat(topMatch.matchLevel, " \u9662\u6821\uFF0C\u56F4\u7ED5\u5176\u590D\u8BD5\u4FA7\u91CD\u70B9\uFF08").concat(focusPreview, "\uFF09\u5236\u5B9A\u4E13\u9879\u51C6\u5907\u3002"));
    }
    if (!hasStable || !hasSprint) {
        strategy.push('建议同时保留至少 1 所稳妥院校和 1 所冲刺院校，增强选择余地。');
    }
    if (!hasSafe) {
        strategy.push('如缺少保底院校，可补充 1-2 所对口专业、复试难度适中的学校。');
    }
    strategy.push('提前整理复试材料与调剂意向，关键时间节点保持信息畅通。');
    return strategy;
};
var buildRecommendationResponse = function (payload) {
    var totalScore = payload.totalScore, targetMajor = payload.targetMajor, examPreferences = payload.examPreferences;
    var _a = buildRecommendations(totalScore, targetMajor, examPreferences), recommendedUniversities = _a.recommendedUniversities, focusTopics = _a.focusTopics;
    var interviewPreparation = buildInterviewPreparation(focusTopics);
    var strategy = buildStrategy(totalScore, recommendedUniversities);
    var summary = totalScore >= 400
        ? '分数段具备冲击985热门专业的竞争力，复试环节需突出综合素质与项目深度。'
        : totalScore >= 370
            ? '核心分数段适合冲击优质211及部分985，建议在复试中强化实践与表达。'
            : '建议优先确保稳妥与保底院校的复试通过率，同时准备调剂方案。';
    return {
        totalScore: totalScore,
        scoreBand: getScoreBand(totalScore),
        summary: summary,
        strategy: strategy,
        recommendedUniversities: recommendedUniversities,
        interviewPreparation: interviewPreparation,
    };
};
exports.buildRecommendationResponse = buildRecommendationResponse;
