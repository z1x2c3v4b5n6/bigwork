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
exports.logout = exports.login = exports.ensureSession = exports.fetchSession = exports.saveSession = exports.getStoredSession = void 0;
var api_1 = require("./api");
var authToken_1 = require("./authToken");
var storage_1 = require("./storage");
var SESSION_STORAGE_KEY = 'sessionUser';
var normalizeSessionUser = function (value) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    var record = value;
    var id = record.id != null ? String(record.id) : '';
    if (!id) {
        return null;
    }
    return {
        id: id,
        name: typeof record.name === 'string' && record.name.trim()
            ? record.name.trim()
            : '未命名用户',
        role: record.role === 'admin' ? 'admin' : 'student',
        email: typeof record.email === 'string' && record.email ? record.email : null,
        phone: typeof record.phone === 'string' && record.phone ? record.phone : null,
        organization: typeof record.organization === 'string' && record.organization
            ? record.organization
            : null,
        goal: typeof record.goal === 'string' && record.goal ? record.goal : null,
        majorId: record.majorId != null ? String(record.majorId) : null,
        majorName: typeof record.majorName === 'string' && record.majorName
            ? record.majorName
            : null,
        avatar: typeof record.avatar === 'string' && record.avatar ? record.avatar : null,
        bio: typeof record.bio === 'string' && record.bio ? record.bio : null,
    };
};
var getStoredSession = function () {
    var stored = (0, storage_1.loadFromStorage)(SESSION_STORAGE_KEY, null);
    var normalized = normalizeSessionUser(stored);
    if (!normalized && stored) {
        (0, storage_1.resetStorageKey)(SESSION_STORAGE_KEY);
    }
    return normalized;
};
exports.getStoredSession = getStoredSession;
var saveSession = function (user) {
    if (user) {
        (0, storage_1.saveToStorage)(SESSION_STORAGE_KEY, user);
    }
    else {
        (0, storage_1.resetStorageKey)(SESSION_STORAGE_KEY);
        (0, authToken_1.clearStoredToken)();
    }
};
exports.saveSession = saveSession;
var extractSessionUser = function (payload) {
    if (payload && typeof payload === 'object' && 'user' in payload) {
        return normalizeSessionUser(payload.user);
    }
    return normalizeSessionUser(payload);
};
var createUnauthorizedError = function (message) {
    var error = new Error(message);
    error.statusCode = 401;
    return error;
};
var fetchSession = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, sessionUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/auth/session' })];
            case 1:
                response = _a.sent();
                sessionUser = extractSessionUser(response);
                if (!sessionUser) {
                    (0, authToken_1.clearStoredToken)();
                    throw createUnauthorizedError('登录状态无效，请重新登录。');
                }
                (0, exports.saveSession)(sessionUser);
                return [2 /*return*/, sessionUser];
        }
    });
}); };
exports.fetchSession = fetchSession;
var ensureSession = function () { return __awaiter(void 0, void 0, void 0, function () {
    var stored, error_1, apiError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stored = (0, exports.getStoredSession)();
                if (stored) {
                    return [2 /*return*/, stored];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, exports.fetchSession)()];
            case 2: return [2 /*return*/, _a.sent()];
            case 3:
                error_1 = _a.sent();
                apiError = error_1;
                if ((apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 401 || (apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) === 404) {
                    (0, exports.saveSession)(null);
                    (0, authToken_1.clearStoredToken)();
                    throw createUnauthorizedError('请先登录后再进行操作。');
                }
                throw error_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.ensureSession = ensureSession;
var login = function (username, password) { return __awaiter(void 0, void 0, void 0, function () {
    var response, payload, sessionUser, token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, api_1.apiRequest)({
                    path: '/auth/login',
                    method: 'POST',
                    data: { username: username, password: password },
                })];
            case 1:
                response = _a.sent();
                payload = response;
                sessionUser = extractSessionUser(payload);
                if (!sessionUser) {
                    throw new Error('登录响应格式不正确，请稍后重试。');
                }
                token = payload.token;
                if (typeof token === 'string' && token.trim()) {
                    (0, authToken_1.saveToken)(token);
                }
                else {
                    (0, authToken_1.clearStoredToken)();
                    throw new Error('登录响应缺少访问令牌，请稍后重试。');
                }
                (0, exports.saveSession)(sessionUser);
                return [2 /*return*/, sessionUser];
        }
    });
}); };
exports.login = login;
var logout = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_2, apiError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, api_1.apiRequest)({ path: '/auth/logout', method: 'POST' })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                apiError = error_2;
                if ((apiError === null || apiError === void 0 ? void 0 : apiError.statusCode) && apiError.statusCode >= 500) {
                    console.warn('注销失败', apiError.message);
                }
                return [3 /*break*/, 3];
            case 3:
                (0, exports.saveSession)(null);
                (0, authToken_1.clearStoredToken)();
                return [2 /*return*/];
        }
    });
}); };
exports.logout = logout;
