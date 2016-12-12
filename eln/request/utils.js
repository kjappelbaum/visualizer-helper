'use strict';

export function convertParametersToSchema(parameters) {
    var props = {};

    for (var i = 0; i < parameters.length; i++) {
        var param = parameters[i];
        if (param.variable) {
            var def = {
                type: 'string',
                name: String(param.variable)
            };
            props[param.variable] = def;
            if (param.label) {
                def.label = String(param.label);
            }
            if (param.description) {
                def.title = String(param.description);
            }
            if (param.required) {
                def.required = DataBoolean.cast(param.required);
            }
            if (param.readonly) {
                def.readonly = DataBoolean.cast(param.readonly);
            }
            var type = (param.type ? param.type + '' : 'string').toLowerCase();
            def.type = type;
            var converter = getConverter(type);
            if (param.default) {
                def.default = converter(String(param.default));
            }
            if (param.enum && String(param.enum)) {
                def.enum = String(param.enum).split(';');
            }
        }
    }

    return {
        type: 'object',
        properties: props
    };
}

function getConverter(type) {
    switch(type) {
        case 'number':
            return Number;
        case 'boolean':
            return castBool;
        default:
            return String;
    }
}

function castBool(val) {
    if (!val) return false;
    if (val === '0' || val === 'f' || val === 'false') return false;
    return true;
}
