import * as Sentry from '@sentry/node';

export function sentryError(err: Error) {
    Sentry.init({
        dsn: process.env.SENTRY_CDN,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    Sentry.captureException(err);
}

export function startTransaction(operation: string, message: string, user: string, tag: string): Sentry.Transaction {

    Sentry.init({
        dsn: process.env.SENTRY_CDN,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    Sentry.setUser({username: user});
    Sentry.setTag(tag, tag);

    return Sentry.startTransaction({
        op: operation,
        name: message,
    });
}

export function finishTransaction(transaction: Sentry.Transaction) {

    Sentry.init({
        dsn: process.env.SENTRY_CDN,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    return transaction.finish();
}