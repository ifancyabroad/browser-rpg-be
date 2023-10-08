import { AuxiliaryStat, DamageType, PropertyType, Stat } from "@common/utils/enums";

export interface IStatProperty {
	type: PropertyType.Stat;
	name: Stat;
	value: number;
}

export interface IAuxiliaryStatProperty {
	type: PropertyType.AuxiliaryStat;
	name: AuxiliaryStat;
	value: number;
}

export interface IResistanceProperty {
	type: PropertyType.Resistance;
	name: DamageType;
	value: number;
}

export interface IDamageProperty {
	type: PropertyType.Damage;
	name: DamageType;
	value: number;
}

export type TProperty = IStatProperty | IAuxiliaryStatProperty | IResistanceProperty | IDamageProperty;
