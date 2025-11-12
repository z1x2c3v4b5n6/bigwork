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
var config_1 = require("./config");
var session_1 = require("./utils/session");
var checkin_1 = require("./utils/checkin");
var globalData = {
    sessionUser: (0, session_1.getStoredSession)(),
};
var redirectToLoginPage = function () {
    wx.nextTick(function () {
        wx.switchTab({
            url: '/pages/profile/index',
            fail: function (error) {
                console.warn('初始化跳转至登录页失败', error);
            },
        });
    });
};
var showDailyTaskModal = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1, status_1, task, streak, completedToday, content, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, session_1.ensureSession)()];
            case 1:
                globalData.sessionUser = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                globalData.sessionUser = null;
                if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.statusCode) === 401) {
                    console.log('跳过打卡任务弹窗：当前未登录或会话已过期。');
                    redirectToLoginPage();
                }
                else {
                    console.warn('校验登录状态失败，跳过打卡任务弹窗。', (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || error_1);
                }
                return [2 /*return*/];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, (0, checkin_1.initializeDailyTask)()];
            case 4:
                status_1 = _a.sent();
                task = status_1.task, streak = status_1.streak, completedToday = status_1.completedToday;
                content = "\u4ECA\u65E5\u4EFB\u52A1\uFF1A".concat(task.targetText, "\n").concat(task.description, "\n\u5F53\u524D\u8FDE\u7EED\u6253\u5361 ").concat(streak, " \u5929");
                wx.showModal({
                    title: '今日学习任务',
                    content: content,
                    confirmText: completedToday ? '查看打卡' : '去完成',
                    cancelText: '稍后',
                    success: function (result) {
                        if (result.confirm) {
                            wx.navigateTo({ url: '/pages/checkin/index' }).catch(function (error) {
                                console.warn('跳转打卡页失败', error);
                            });
                        }
                    },
                });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.warn('展示打卡任务失败', error_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
App({
    globalData: globalData,
    onLaunch: function () {
        var apiConfig = (0, config_1.getApiConfig)();
        var session = globalData.sessionUser;
        console.log('复试资料小程序已启动，当前 API 基地址：', apiConfig.baseUrl);
        if (session) {
            console.log('检测到已登录用户：', session.name, "(".concat(session.role, ")"));
            void showDailyTaskModal();
            return;
        }
        console.log('未检测到登录用户，跳转至登录页。');
        redirectToLoginPage();
    },
    setSessionUser: function (user) {
        this.globalData.sessionUser = user;
        globalData.sessionUser = user;
    },
});
