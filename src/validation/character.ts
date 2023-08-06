import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
	IsString,
	Length,
	IsAlpha,
	IsEnum,
} from "class-validator";
import { CharacterClass } from "src/enums";
import Filter from "bad-words";

export function IsNotProfane(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
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

export class CharacterCreateDto {
	@IsString()
	@Length(3, 10)
	@IsAlpha()
	@IsNotProfane()
	name: string;

	@IsEnum(CharacterClass)
	characterClass: CharacterClass;
}
