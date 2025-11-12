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
var universityAdvisor_1 = require("../../utils/universityAdvisor");
var matchLevelClassMap = {
    稳妥: 'stable',
    冲刺: 'sprint',
    保底: 'safe',
    高风险: 'risky',
};
Page({
    data: {
        scoreInput: '',
        majorInput: '',
        mathOptions: ['不限', '数学一', '数学二', '数学三', '不考数学'],
        englishOptions: ['不限', '英语一', '英语二'],
        mathIndex: 0,
        englishIndex: 0,
        loading: false,
        errorMessage: '',
        recommendation: null,
        focusPreview: [],
    },
    onScoreInput: function (event) {
        var _a;
        this.setData({ scoreInput: (_a = event.detail.value) !== null && _a !== void 0 ? _a : '' });
    },
    onMajorInput: function (event) {
        var _a;
        this.setData({ majorInput: (_a = event.detail.value) !== null && _a !== void 0 ? _a : '' });
    },
    onMathChange: function (event) {
        var value = Number(event.detail.value);
        this.setData({ mathIndex: Number.isNaN(value) ? 0 : value });
    },
    onEnglishChange: function (event) {
        var value = Number(event.detail.value);
        this.setData({ englishIndex: Number.isNaN(value) ? 0 : value });
    },
    onGenerate: function () {
        if (this.data.loading) {
            return;
        }
        var parsedScore = Number(this.data.scoreInput);
        if (!Number.isFinite(parsedScore) || parsedScore <= 0) {
            this.setData({
                errorMessage: '请输入有效的初试总分（大于 0 的数字）。',
                recommendation: null,
            });
            return;
        }
        var payload = {
            totalScore: parsedScore,
        };
        var trimmedMajor = this.data.majorInput.trim();
        if (trimmedMajor) {
            payload.targetMajor = trimmedMajor;
        }
        var examPreferences = {};
        var mathValue = this.data.mathOptions[this.data.mathIndex];
        var englishValue = this.data.englishOptions[this.data.englishIndex];
        if (this.data.mathIndex > 0 && mathValue) {
            examPreferences.math = mathValue;
        }
        if (this.data.englishIndex > 0 && englishValue) {
            examPreferences.english = englishValue;
        }
        if (examPreferences.math || examPreferences.english) {
            payload.examPreferences = examPreferences;
        }
        this.setData({
            loading: true,
            errorMessage: '',
            recommendation: null,
            focusPreview: [],
        });
        try {
            var recommendation = (0, universityAdvisor_1.buildRecommendationResponse)(payload);
            var focusPreview = recommendation.interviewPreparation.focusTopics.slice(0, 3);
            var sanitizedRecommendation = __assign(__assign({}, recommendation), { recommendedUniversities: recommendation.recommendedUniversities.map(function (item) { return (__assign(__assign({}, item), { matchLevelClass: matchLevelClassMap[item.matchLevel] || 'stable' })); }) });
            this.setData({
                recommendation: sanitizedRecommendation,
                loading: false,
                focusPreview: focusPreview,
            });
        }
        catch (error) {
            var message = (error === null || error === void 0 ? void 0 : error.message) || '暂时无法生成推荐，请稍后再试。';
            this.setData({
                loading: false,
                errorMessage: message,
            });
        }
    },
});
