import * as Sentry from '@sentry/node';

export function sentryError(err: Error) {
    Sentry.init({
        dsn: "https://2a84c6712afa463595fd2555a4eff2cb@o4505358567211008.ingest.sentry.io/4505358569439232",

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    Sentry.captureException(err);
}

export function startTransaction(operation: string, message: string, user: string, tag: string): Sentry.Transaction {

    Sentry.init({
        dsn: "https://2a84c6712afa463595fd2555a4eff2cb@o4505358567211008.ingest.sentry.io/4505358569439232",

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
        dsn: "https://2a84c6712afa463595fd2555a4eff2cb@o4505358567211008.ingest.sentry.io/4505358569439232",

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });

    return transaction.finish();
}