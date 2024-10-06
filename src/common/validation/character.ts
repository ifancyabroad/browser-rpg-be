import { registerDecorator, ValidationOptions, ValidationArguments, IsString, Length, IsAlpha } from "class-validator";
import Filter from "bad-words";

export function IsNotProfane(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "isNotProfane",
			target: object.constructor,
			propertyName: propertyName,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					const filter = new Filter();
					return !filter.isProfane(value);
				},
			},
		});
	};
}

export function IsUnicode(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "isUnicode",
			target: object.constructor,
			propertyName: propertyName,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					return /^[\p{L}]+$/u.test(value);
				},
			},
		});
	};
}

export class CharacterCreateDto {
	@IsString()
	@Length(3, 10, { message: "Name must be between 3 and 10 characters" })
	@IsUnicode({ message: "Name must only contain alphabetic characters" })
	@IsNotProfane({ message: "Please use appropriate language!" })
	name: string;

	@IsString()
	characterClass: string;
}
