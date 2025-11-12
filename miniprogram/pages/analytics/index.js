"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var analytics_1 = require("../../data/analytics");
var toMasteryText = function (value) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return '0%';
    }
    var percentage = Math.max(0, Math.min(1, numeric));
    return "".concat(Math.round(percentage * 100), "%");
};
var normalizeSubjects = function () {
    return analytics_1.subjectMasterySeed.map(function (item) { return ({
        name: item.name,
        mastery: item.mastery,
        masteryText: toMasteryText(item.mastery),
        trend: item.trend,
        focus: item.focus,
    }); });
};
var normalizeHighlights = function () { return analytics_1.analyticsHighlights.map(function (item) { return ({
    id: item.id,
    title: item.title,
    description: item.description,
}); }); };
var normalizeKnowledgeGraph = function () { return analytics_1.knowledgeGraphSeed.map(function (item) { return ({
    id: item.id,
    topic: item.topic,
    errorRate: item.errorRate,
    action: item.action,
}); }); };
Page({
    data: {
        highlights: normalizeHighlights(),
        subjects: normalizeSubjects(),
        knowledgeGraph: normalizeKnowledgeGraph(),
    },
});
