"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var checkin_1 = require("../../data/checkin");
var api_1 = require("../../utils/api");
var checkin_2 = require("../../utils/checkin");
var session_1 = require("../../utils/session");
var createInitialState = function () { return ({
    task: checkin_1.dailyTaskSeed,
    streak: 0,
    completedToday: false,
}); };
Page({
    data: {
        loading: false,
        completing: false,
        generatingPoster: false,
        errorMessage: '',
        posterTempPath: '',
        sessionRequired: false,
        status: createInitialState(),
    },
    onShow: function () {
        void this.refreshTask(false);
    },
    refreshTask: function () {
        return __awaiter(this, arguments, void 0, function (forceReload) {
            var pendingMessage, requireLogin, error_1, apiError, status_1, _a, error_2, apiError, message;
            if (forceReload === void 0) { forceReload = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.data.loading) {
                            return [2 /*return*/];
                        }
                        this.setData({ loading: true, errorMessage: '' });
                        pendingMessage = '';
                        requireLogin = false;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        apiError = error_1;
                        if ((apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401) {
                            requireLogin = true;
                            pendingMessage = '请先完成登录后再查看打卡任务，可在“我的”页使用账号密码登录。';
                        }
                        else {
                            pendingMessage = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '登录状态校验失败，请稍后再试。';
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        if (!requireLogin) return [3 /*break*/, 5];
                        this.setData({
                            status: createInitialState(),
                            posterTempPath: '',
                            sessionRequired: true,
                        });
                        if (pendingMessage) {
                            this.setData({ errorMessage: pendingMessage });
                        }
                        return [3 /*break*/, 11];
                    case 5:
                        _b.trys.push([5, 10, , 11]);
                        if (!forceReload) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, checkin_2.reloadDailyTask)()];
                    case 6:
                        _a = _b.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, (0, checkin_2.initializeDailyTask)()];
                    case 8:
                        _a = _b.sent();
                        _b.label = 9;
                    case 9:
                        status_1 = _a;
                        this.setData({ status: status_1, posterTempPath: '', sessionRequired: false });
                        if (pendingMessage) {
                            this.setData({ errorMessage: pendingMessage });
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _b.sent();
                        apiError = error_2;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '加载今日任务失败，请稍后重试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 11];
                    case 11:
                        this.setData({ loading: false });
                        wx.stopPullDownRefresh();
                        return [2 /*return*/];
                }
            });
        });
    },
    onPullDownRefresh: function () {
        void this.refreshTask(true);
    },
    handleRefreshTap: function (event) {
        var _a, _b;
        var force = Boolean((_b = (_a = event === null || event === void 0 ? void 0 : event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.force);
        void this.refreshTask(force);
    },
    handleGoLogin: function () {
        wx.switchTab({ url: '/pages/profile/index' });
    },
    completeTask: function () {
        return __awaiter(this, void 0, void 0, function () {
            var task, response, overrideStreak, nextState, error_3, apiError, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.sessionRequired) {
                            this.setData({
                                errorMessage: '请先登录后再进行打卡，可在“我的”页使用账号密码登录。',
                            });
                            return [2 /*return*/];
                        }
                        if (this.data.completing || this.data.status.completedToday) {
                            return [2 /*return*/];
                        }
                        task = this.data.status.task;
                        if (!task) {
                            return [2 /*return*/];
                        }
                        this.setData({ completing: true, errorMessage: '' });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, session_1.ensureSession)()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, api_1.apiRequest)({
                                path: '/learning/daily-task/complete',
                                method: 'POST',
                                data: { taskId: task.id },
                            })];
                    case 3:
                        response = _a.sent();
                        overrideStreak = typeof (response === null || response === void 0 ? void 0 : response.streak) === 'number' && Number.isFinite(response.streak)
                            ? Math.max(0, Math.floor(response.streak))
                            : undefined;
                        nextState = (0, checkin_2.markTaskCompletedToday)(task, overrideStreak);
                        this.setData({
                            status: { task: task, completedToday: true, streak: nextState.streak },
                            posterTempPath: '',
                        });
                        wx.showToast({ title: '打卡成功', icon: 'success' });
                        return [3 /*break*/, 6];
                    case 4:
                        error_3 = _a.sent();
                        apiError = error_3;
                        message = (apiError === null || apiError === void 0 ? void 0 : apiError.message) || '打卡上报失败，请稍后再试。';
                        this.setData({ errorMessage: message });
                        return [3 /*break*/, 6];
                    case 5:
                        this.setData({ completing: false });
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    sharePoster: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.data.generatingPoster) {
                            return [2 /*return*/];
                        }
                        if (this.data.posterTempPath) {
                            this.previewPoster();
                            return [2 /*return*/];
                        }
                        this.setData({ generatingPoster: true, errorMessage: '' });
                        return [4 /*yield*/, this.drawPoster()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    drawPoster: function () {
        var _this = this;
        return new Promise(function (resolve) {
            var query = wx.createSelectorQuery();
            query
                .in(_this)
                .select('#daily-share-canvas')
                .fields({ node: true, size: true })
                .exec(function (res) {
                var _a;
                var canvasNode = (_a = res === null || res === void 0 ? void 0 : res[0]) === null || _a === void 0 ? void 0 : _a.node;
                var size = res === null || res === void 0 ? void 0 : res[0];
                if (!canvasNode || !size) {
                    _this.setData({
                        generatingPoster: false,
                        errorMessage: '无法初始化海报画布，请稍后重试。',
                    });
                    resolve();
                    return;
                }
                var windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
                var dpr = windowInfo.pixelRatio || 2;
                canvasNode.width = size.width * dpr;
                canvasNode.height = size.height * dpr;
                var context = canvasNode.getContext('2d');
                context.scale(dpr, dpr);
                _this.renderPoster(context, size.width, size.height);
                wx.canvasToTempFilePath({
                    canvas: canvasNode,
                    success: function (fileResult) {
                        _this.setData({ posterTempPath: fileResult.tempFilePath, generatingPoster: false });
                        _this.previewPoster();
                        resolve();
                    },
                    fail: function () {
                        _this.setData({
                            generatingPoster: false,
                            errorMessage: '生成分享海报失败，请稍后再试。',
                        });
                        resolve();
                    },
                }, _this);
            });
        });
    },
    renderPoster: function (context, width, height) {
        var padding = 24;
        var radius = 20;
        var gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0C4A6E');
        gradient.addColorStop(1, '#0891B2');
        var drawRoundedRect = function (x, y, w, h, r) {
            context.beginPath();
            context.moveTo(x + r, y);
            context.lineTo(x + w - r, y);
            context.quadraticCurveTo(x + w, y, x + w, y + r);
            context.lineTo(x + w, y + h - r);
            context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            context.lineTo(x + r, y + h);
            context.quadraticCurveTo(x, y + h, x, y + h - r);
            context.lineTo(x, y + r);
            context.quadraticCurveTo(x, y, x + r, y);
            context.closePath();
        };
        context.fillStyle = '#0F172A';
        drawRoundedRect(0, 0, width, height, radius);
        context.fill();
        context.fillStyle = gradient;
        drawRoundedRect(padding, padding, width - padding * 2, height - padding * 2, radius);
        context.fill();
        context.fillStyle = '#E2E8F0';
        context.font = '20px sans-serif';
        context.fillText('今日学习打卡', padding + 24, padding + 48);
        var _a = this.data.status, task = _a.task, streak = _a.streak;
        context.fillStyle = '#F8FAFC';
        context.font = '28px sans-serif';
        context.fillText(task.title, padding + 24, padding + 96);
        context.fillStyle = '#F1F5F9';
        context.font = '18px sans-serif';
        context.fillText(task.description, padding + 24, padding + 130, width - padding * 2 - 48);
        context.fillStyle = '#FACC15';
        context.font = '22px sans-serif';
        context.fillText("\u76EE\u6807\uFF1A".concat(task.targetText), padding + 24, padding + 170);
        context.fillStyle = '#F1F5F9';
        context.font = '18px sans-serif';
        context.fillText("\u8FDE\u7EED\u6253\u5361 ".concat(streak, " \u5929"), padding + 24, padding + 205);
        var date = new Date();
        var dateText = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'), "-").concat(String(date.getDate()).padStart(2, '0'));
        context.fillStyle = 'rgba(15, 23, 42, 0.36)';
        context.font = '16px sans-serif';
        context.fillText(dateText, padding + 24, height - padding - 32);
    },
    previewPoster: function () {
        if (!this.data.posterTempPath) {
            return;
        }
        wx.previewImage({ urls: [this.data.posterTempPath] });
    },
});
