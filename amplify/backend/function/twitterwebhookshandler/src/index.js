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
exports.handler = void 0;
var ConfigService_1 = require("./ConfigService");
var LoggerService_1 = require("./LoggerService");
var SecurityService_1 = require("./SecurityService");
var twitter_api_v2_1 = require("twitter-api-v2");
// ANY http method to /webhooks will come here
// See issue: https://github.com/aws-amplify/amplify-cli/issues/1232
// API Gateway Event format: https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html#apigateway-example-event
// Twitter Activity API objects: https://developer.twitter.com/en/docs/twitter-api/premium/account-activity-api/guides/account-activity-data-objects
function handler(event) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var httpMethod, logger, configService, crc_token, hash, message_1, message_2, tweetCreateEvent, message_3, tweet, message_4, client, appUser_1, mentions, _i, mentions_1, mention, tweetResponse, message_5, error_1, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    httpMethod = event.httpMethod;
                    logger = LoggerService_1.LoggerService.createLogger();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, ConfigService_1.ConfigService.build()];
                case 2:
                    configService = _b.sent();
                    if (!(httpMethod === "GET")) return [3 /*break*/, 3];
                    logger.info("Received GET request.\nWill return challenge response check (crc) token.");
                    crc_token = (_a = event === null || event === void 0 ? void 0 : event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.crc_token;
                    if (crc_token) {
                        hash = SecurityService_1.SecurityService.get_challenge_response(configService.twitterOAuth.appSecret, crc_token);
                        message_1 = JSON.stringify({
                            response_token: "sha256=" + hash
                        });
                        logger.warn(message_1);
                        return [2 /*return*/, {
                                statusCode: 200,
                                body: message_1
                            }];
                    }
                    else {
                        message_2 = "crc_token missing from request.";
                        logger.warn(message_2);
                        return [2 /*return*/, {
                                statusCode: 400,
                                body: JSON.stringify(message_2)
                            }];
                    }
                    return [3 /*break*/, 9];
                case 3:
                    if (!(httpMethod === "POST")) return [3 /*break*/, 9];
                    // https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/examples.md
                    logger.info("Received a POST request.");
                    logger.verbose("Request Body: ".concat(event.body));
                    tweetCreateEvent = JSON.parse(event.body);
                    if (!tweetCreateEvent || !tweetCreateEvent.tweet_create_events || tweetCreateEvent.user_has_blocked == undefined) {
                        message_3 = "Tweet is not a @mention. Exiting.";
                        logger.warn(message_3);
                        return [2 /*return*/, {
                                statusCode: 200,
                                body: JSON.stringify(message_3)
                            }];
                    }
                    tweet = tweetCreateEvent.tweet_create_events[0];
                    if (!tweet.text.startsWith("/@slashkudos")) {
                        message_4 = "Tweet is not someone giving someone Kudos. Exiting";
                        logger.warn(message_4);
                        return [2 /*return*/, {
                                statusCode: 200,
                                body: JSON.stringify(message_4)
                            }];
                    }
                    client = new twitter_api_v2_1["default"](configService.twitterOAuth);
                    return [4 /*yield*/, client.currentUser()];
                case 4:
                    appUser_1 = _b.sent();
                    mentions = tweet.entities.user_mentions.filter(function (mention) { return mention.id !== appUser_1.id; });
                    _i = 0, mentions_1 = mentions;
                    _b.label = 5;
                case 5:
                    if (!(_i < mentions_1.length)) return [3 /*break*/, 8];
                    mention = mentions_1[_i];
                    tweetResponse = "\uD83C\uDF89 Congrats @".concat(mention.screen_name, "! You received Kudos from @").concat(tweet.user.screen_name, "! \uD83D\uDC96");
                    logger.info("Replying to tweet (".concat(tweet.id_str, ") with \"").concat(tweetResponse, "\""));
                    return [4 /*yield*/, client.v1.reply(tweetResponse, tweet.id_str)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    message_5 = "Recorded Kudos and responded in a 🧵 on Twitter";
                    logger.warn(message_5);
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: JSON.stringify(message_5)
                        }];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    logger.error(error_1.message || error_1);
                    throw error_1;
                case 11:
                    message = "Received an unhandled ".concat(httpMethod, " request.\n  Request Body: ").concat(event.body);
                    logger.warn(message);
                    return [2 /*return*/, {
                            statusCode: 404,
                            body: JSON.stringify(message)
                        }];
            }
        });
    });
}
exports.handler = handler;
