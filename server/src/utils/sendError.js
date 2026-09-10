// Central place to turn a caught error into an HTTP response.
//
// Route handlers used to do `.catch((err) => res.status(403).send(err))`,
// which serializes the raw pg/knex error object (message, table, column,
// constraint, detail - sometimes literal row values) straight into the
// response body. That's an information-disclosure bug independent of
// NODE_ENV: it happens in development AND production. Fix: log the real
// error server-side only, send the client a fixed, generic message.
function sendError(res, err, status = 500) {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(status).json({ error: "Internal server error" });
}

export { sendError };
