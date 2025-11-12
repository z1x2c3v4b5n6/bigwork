"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var analytics_1 = require("../../data/analytics");
Page({
    data: {
        highlights: analytics_1.analyticsHighlights,
        subjects: analytics_1.subjectMasterySeed.map(function (subject) { return (__assign(__assign({}, subject), { masteryText: "".concat(Math.round(subject.mastery * 100), "%") })); }),
        knowledgeGraph: analytics_1.knowledgeGraphSeed,
    },
});
