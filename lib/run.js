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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var got_1 = require("got");
var googleapis_1 = require("googleapis");
require('dotenv').config();
var fs = require('fs');
if (!process.env.USER || !process.env.WAKATIME_API || !process.env.SHEET_ID) {
    console.log("NO " + (!process.env.user && 'USER') + "\n \n      " + (!process.env.WAKATIME_API && 'WAKATIME_API') + "\n\n      " + (!process.env.GOOGLE_APLICATION_CREDENTIALS &&
        'GOOGLE_APLICATION_CREDENTIALS') + "\n\n      " + (!process.env.SHEET_ID && 'SHEET_ID') + "\n\n      ");
    process.exit(1);
}
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var date, body, data, programmingSeconds, _i, data_1, row, programmingHours, year, month, isLeapYear, daysPreviousMonth, dayOfYear, requestBody, range, injectedJSON, auth, sheets;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                date = new Date();
                process.env.NODE_ENV === 'production' && date.setDate(date.getDate() - 1);
                return [4 /*yield*/, (0, got_1["default"])("https://wakatime.com/api/v1/users/" + process.env.USER + "/durations?date=" + date
                        .toISOString()
                        .slice(0, 10), {
                        headers: {
                            Authorization: "Basic " + process.env.WAKATIME_API
                        }
                    })];
            case 1:
                body = (_c.sent()).body;
                data = (_a = JSON.parse(body)) === null || _a === void 0 ? void 0 : _a.data;
                programmingSeconds = 0;
                for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                    row = data_1[_i];
                    programmingSeconds += row.duration;
                }
                programmingHours = programmingSeconds / 3600;
                year = date.getFullYear();
                month = date.getMonth();
                isLeapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
                daysPreviousMonth = [
                    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365,
                ];
                dayOfYear = daysPreviousMonth[month] +
                    date.getDate() +
                    (month > 1 && isLeapYear ? 1 : 0);
                requestBody = {
                    majorDimension: 'ROWS',
                    values: [
                        [
                            date.toLocaleDateString('en-US'),
                            programmingHours,
                            JSON.stringify(data),
                        ],
                    ]
                };
                range = date.getFullYear() + "!A" + dayOfYear + ":C" + dayOfYear;
                injectedJSON = (_b = process.env.GOOGLE_CREDENTIALS) !== null && _b !== void 0 ? _b : '';
                fs.writeFileSync('./secrets.json', injectedJSON);
                return [4 /*yield*/, googleapis_1.google.auth.getClient({
                        scopes: ['https://www.googleapis.com/auth/spreadsheets']
                    })];
            case 2:
                auth = _c.sent();
                sheets = googleapis_1.google.sheets({ version: 'v4', auth: auth });
                return [4 /*yield*/, sheets.spreadsheets.values
                        .update({
                        spreadsheetId: process.env.SHEET_ID,
                        range: range,
                        requestBody: requestBody,
                        valueInputOption: 'USER_ENTERED'
                    })
                        .then(function () {
                        console.log("Wrote successfully to Row " + dayOfYear + " (Day: " + date.toLocaleDateString('en-US') + ") with hours recorded: " + programmingHours);
                    })["catch"](function () {
                        console.log('Something went wrong...');
                    })];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
run();
