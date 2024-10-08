import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RequestHandler } from "express";
import httpStatus from "http-status-codes";
import createError from "http-errors";
import handler from "express-async-handler";

/**
 * Validate the request body
 * Data Transfer Object: DTO
 * @param type The DTO object, defining the shape of the body
 * @throws 400 - Bad request | If at least one constraint is not respected
 *
 * @example
 * import validate from 'middlewares/validationMiddleware'
 *
 * class UserSignupDto {
 *  @IsEmail()
 *  email!: string;
 *
 *  @IsString()
 *  @IsOptional()
 *  name!: string;
 *
 *  @IsString()
 *  @MinLength(8)
 *  @MaxLength(64)
 *  password!: string;
 * }
 * router.post('/users/signup', validate(UserSignupDto), ...);
 */
function validation<T extends object>(type: ClassConstructor<T>): RequestHandler {
	return handler(async (req, res, next) => {
		const parsedBody = plainToInstance(type, req.body);
		const errors = await validate(parsedBody);
		if (errors.length !== 0) {
			const message = errors.map((error) => Object.values(error.constraints)).join(", ");
			next(createError(httpStatus.BAD_REQUEST, message));
		} else {
			req.body = parsedBody;
			next();
		}
	});
}

export { validation };
export default validation;
