import { APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { ConfigService } from "./ConfigService";
import { LoggerService } from "./LoggerService";
import { SecurityService } from "./SecurityService";
import TwitterApi from "twitter-api-v2";
import { TweetCreateEvent } from "./types/twitter-types";
import { HttpStatus } from "aws-sdk/clients/lambda";
import { LogLevel } from "./types/LogLevel";
import { KudosApiClient } from "./KudosApiClient";

interface createApiResultOptions {
  logLevel?: LogLevel;
  stringify?: boolean;
}

const logger = LoggerService.createLogger();

export async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> {
  const httpMethod = event.httpMethod;

  try {
    const configService = await ConfigService.build();

    // FIXME - Remove this test
    const kudosApiClient = await KudosApiClient.build(configService.kudosGraphQLConfig);
    await kudosApiClient.listKudos();

    if (httpMethod === "GET") {
      logger.info("Received GET request.");
      const crc_token = event?.queryStringParameters?.crc_token;

      if (crc_token) {
        logger.info("Creating challenge response check (crc) hash.");
        const hash = SecurityService.get_challenge_response(configService.twitterConfig.appSecret, crc_token);

        const body = JSON.stringify({
          response_token: "sha256=" + hash,
        });
        return createApiResult(body, 200, { stringify: false });
      } else {
        return createApiResult("crc_token missing from request.", 400);
      }
    } else if (httpMethod === "POST") {
      // https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/examples.md
      logger.info("Received a POST request.");
      logger.verbose(`Request Body: ${event.body}`);

      const tweetCreateEvent = JSON.parse(event.body) as TweetCreateEvent;
      if (!tweetCreateEvent || !tweetCreateEvent.tweet_create_events || tweetCreateEvent.user_has_blocked == undefined) {
        return createApiResult("Tweet is not a @mention. Exiting.", 200);
      }

      const client = new TwitterApi(configService.twitterConfig);
      const appUser = await client.currentUser();
      const appUserMentionStr = `@${appUser.screen_name}`;
      const tweet = tweetCreateEvent.tweet_create_events[0];

      // Skip if the tweet is a reply, or not for the app user, or doesn't start with @appUser
      if (!tweet.text.startsWith(appUserMentionStr) || tweetCreateEvent.for_user_id !== appUser.id_str || tweet.in_reply_to_status_id) {
        return createApiResult("Tweet is not someone giving someone Kudos. Exiting", 200);
      }

      const mentions = tweet.entities.user_mentions.filter((mention) => mention.id !== appUser.id);

      for (const mention of mentions) {
        const tweetResponse = `🎉 Congrats @${mention.screen_name}! You received Kudos from @${tweet.user.screen_name}! 💖`;
        logger.info(`Replying to tweet (${tweet.id_str}) with "${tweetResponse}"`);
        await client.v1.reply(tweetResponse, tweet.id_str, { auto_populate_reply_metadata: true });
      }
      return createApiResult("Recorded Kudos and responded in a 🧵 on Twitter 🐦", 200);
    }
  } catch (error) {
    logger.error(error.message || error);
    throw error;
  }

  const message = `Received an unhandled ${httpMethod} request.
  Request Body: ${event.body}`;

  return createApiResult(message, 404);
}

function createApiResult(body: string, statusCode: HttpStatus, options?: createApiResultOptions): APIGatewayProxyResultV2 {
  logger.verbose(`Entering createApiResult`);
  const defaultOptions = { logLevel: "warn", stringify: true };
  const mergedOptions = options ? { ...defaultOptions, ...options } : defaultOptions;
  logger.debug(`createApiResult options: ${JSON.stringify(mergedOptions)}`);
  logger.log(mergedOptions.logLevel, body);
  return {
    statusCode: statusCode,
    body: mergedOptions.stringify ? JSON.stringify(body) : body,
  };
}
