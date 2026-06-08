import { isPlainObject } from 'lodash-es';

export const stateMerge = function(state: any, value: any, propName?: string, ignoreNull?: boolean) {
	if (isPlainObject(state) && (propName == null || propName in state)) {
		const o = propName == null ? state : state[propName];
		if (o != null && isPlainObject(value)) {
			for (const prop in value) {
				stateMerge(o, value[prop], prop, ignoreNull);
			}
			return;
		}
	}
	if (!ignoreNull || value !== null) {
		if (propName != null) {
			state[propName] = value;
		}
	}

  return state;
};

export default stateMerge;
