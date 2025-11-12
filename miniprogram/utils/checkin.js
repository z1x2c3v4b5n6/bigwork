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
exports.reloadDailyTask = exports.markTaskCompletedToday = exports.initializeDailyTask = void 0;
var checkin_1 = require("../data/checkin");
var api_1 = require("./api");
var storage_1 = require("./storage");
var CHECKIN_STATE_KEY = 'studyCheckinState';
var CHECKIN_TASK_KEY = 'studyCheckinTask';
var formatDate = function (date) {
    var year = date.getFullYear();
    var month = "".concat(date.getMonth() + 1).padStart(2, '0');
    var day = "".concat(date.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
};
var getToday = function () { return formatDate(new Date()); };
var getYesterday = function () {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
};
var normalizeTask = function (task) { return ({
    id: task.id,
    title: task.title,
    description: task.description,
    targetText: task.targetText,
    estimatedMinutes: task.estimatedMinutes,
}); };
var getStoredState = function () {
    return (0, storage_1.loadFromStorage)(CHECKIN_STATE_KEY, {
        lastCompletedDate: null,
        lastEvaluatedDate: null,
        streak: 0,
    });
};
var setStoredState = function (state) { return (0, storage_1.saveToStorage)(CHECKIN_STATE_KEY, state); };
var ensureEvaluatedState = function (state, today) {
    if (state.lastEvaluatedDate === today) {
        return state;
    }
    var yesterday = getYesterday();
    var shouldKeepStreak = state.lastCompletedDate === yesterday;
    var nextState = {
        lastCompletedDate: state.lastCompletedDate,
        lastEvaluatedDate: today,
        streak: shouldKeepStreak ? state.streak : state.lastCompletedDate === today ? state.streak : 0,
    };
    if (!shouldKeepStreak && state.lastCompletedDate !== today) {
        nextState.streak = 0;
    }
    setStoredState(nextState);
    return nextState;
};
var loadCachedTask = function (today) {
    var cached = (0, storage_1.loadFromStorage)(CHECKIN_TASK_KEY, null);
    if (!cached || cached.date !== today) {
        return null;
    }
    return cached.task;
};
var saveCachedTask = function (task, today) {
    var cache = { date: today, task: task };
    (0, storage_1.saveToStorage)(CHECKIN_TASK_KEY, cache);
};
var syncStateFromServer = function (today, payload, fallbackState) {
    if (!payload) {
        return fallbackState;
    }
    var nextState = {
        lastCompletedDate: fallbackState.lastCompletedDate,
        lastEvaluatedDate: today,
        streak: fallbackState.streak,
    };
    var streakFromServer = typeof payload.streak === 'number' && Number.isFinite(payload.streak)
        ? Math.max(0, Math.floor(payload.streak))
        : null;
    var completedToday = Boolean(payload.completedToday);
    var serverLastDate = typeof payload.lastCompletedDate === 'string' && payload.lastCompletedDate.length === 10
        ? payload.lastCompletedDate
        : null;
    if (streakFromServer !== null) {
        nextState.streak = streakFromServer;
    }
    if (completedToday) {
        nextState.lastCompletedDate = today;
    }
    else if (serverLastDate) {
        nextState.lastCompletedDate = serverLastDate;
    }
    setStoredState(nextState);
    return nextState;
};
var fetchTaskFromApi = function (today) { return __awaiter(void 0, void 0, void 0, function () {
    var stateBeforeSync, response, task, syncedState, error_1, apiError, fallbackTask;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                stateBeforeSync = ensureEvaluatedState(getStoredState(), today);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, api_1.apiRequest)({
                        path: '/learning/daily-task',
                    })];
            case 2:
                response = _b.sent();
                task = (response === null || response === void 0 ? void 0 : response.task) ? normalizeTask(response.task) : normalizeTask(checkin_1.dailyTaskSeed);
                syncedState = syncStateFromServer(today, response !== null && response !== void 0 ? response : null, stateBeforeSync);
                return [2 /*return*/, { task: task, state: syncedState }];
            case 3:
                error_1 = _b.sent();
                apiError = error_1;
                console.warn('[checkin] 获取今日任务失败，将使用本地兜底数据。', (_a = apiError === null || apiError === void 0 ? void 0 : apiError.message) !== null && _a !== void 0 ? _a : error_1);
                fallbackTask = normalizeTask(checkin_1.dailyTaskSeed);
                return [2 /*return*/, { task: fallbackTask, state: stateBeforeSync }];
            case 4: return [2 /*return*/];
        }
    });
}); };
var initializeDailyTask = function () { return __awaiter(void 0, void 0, void 0, function () {
    var today, state, task, remote;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                today = getToday();
                state = ensureEvaluatedState(getStoredState(), today);
                task = loadCachedTask(today);
                if (!!task) return [3 /*break*/, 2];
                return [4 /*yield*/, fetchTaskFromApi(today)];
            case 1:
                remote = _a.sent();
                task = remote.task;
                state = remote.state;
                saveCachedTask(task, today);
                _a.label = 2;
            case 2: return [2 /*return*/, {
                    task: task,
                    streak: state.streak,
                    completedToday: state.lastCompletedDate === today,
                }];
        }
    });
}); };
exports.initializeDailyTask = initializeDailyTask;
var markTaskCompletedToday = function (task, overrideStreak) {
    var today = getToday();
    var yesterday = getYesterday();
    var state = getStoredState();
    if (state.lastCompletedDate === today && overrideStreak === undefined) {
        return state;
    }
    var streak = state.streak;
    if (typeof overrideStreak === 'number' && Number.isFinite(overrideStreak)) {
        streak = Math.max(0, Math.floor(overrideStreak));
    }
    else if (state.lastCompletedDate === yesterday) {
        streak += 1;
    }
    else {
        streak = 1;
    }
    var nextState = {
        lastCompletedDate: today,
        lastEvaluatedDate: today,
        streak: streak,
    };
    setStoredState(nextState);
    saveCachedTask(task, today);
    return nextState;
};
exports.markTaskCompletedToday = markTaskCompletedToday;
var reloadDailyTask = function () { return __awaiter(void 0, void 0, void 0, function () {
    var today, remote, state, task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                today = getToday();
                return [4 /*yield*/, fetchTaskFromApi(today)];
            case 1:
                remote = _a.sent();
                state = remote.state;
                task = remote.task;
                saveCachedTask(task, today);
                return [2 /*return*/, {
                        task: task,
                        streak: state.streak,
                        completedToday: state.lastCompletedDate === today,
                    }];
        }
    });
}); };
exports.reloadDailyTask = reloadDailyTask;
