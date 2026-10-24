import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? "local",
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  beforeSend(event) {
    event.user = undefined;
    if (event.request) {
      delete event.request.headers;
      delete event.request.cookies;
      delete event.request.data;
      delete event.request.query_string;
      delete event.request.url;
    }
    return event;
  },
});
