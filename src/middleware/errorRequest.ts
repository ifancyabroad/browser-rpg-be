import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status-codes";

import { ErrorRo } from "src/types/appRo";
import createHttpError from "http-errors";

/**
 * Error middleware
 * Every error thrown in a route ends up here to be sent to the user
 * They are formatted into a generic RO, to have uniform error replies
 *
 * Not wanted errors (for example, a crash in the route) are
 * converted into a 500 - Internal server errors
 */
const errorRequest: ErrorRequestHandler = (err, req, res, _) => {
	console.error(err.message);
	// If the error is not an HTTP error, the whole object is printed through console.error
	if (!createHttpError.isHttpError(err)) {
		console.error(err);
	}
	const status = err.status ?? httpStatus.INTERNAL_SERVER_ERROR;
	res.status(status).send(ErrorRo(status, err.message));
};

export { errorRequest };

export default errorRequest;
