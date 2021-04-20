module.exports = {
    api: {
        default: require('./default').api
    },
    parser: {
        default: require('./default').parser
    },
    datatype: {
        string: function () {
            return {
                isDatatype: function (value) {
                    return typeof value === 'string';
                },
                serialize: function (value) {
                    return value;
                },
                deserialize: function (value) {
                    return value;
                }
            };
        },
        number: function () {
            return {
                isDatatype: function (value) {
                    return typeof value === 'number';
                },
                serialize: function (value) {
                    return value.toString();
                },
                deserialize: function (value) {
                    return Number(value);
                }
            };
        },
        boolean: function () {
            return {
                isDatatype: function (value) {
                    return typeof value === 'boolean';
                },
                serialize: function (value) {
                    return value.toString();
                },
                deserialize: function (value) {
                    return value === 'true';
                }
            };
        },
        function: function () {
            return {
                isDatatype: function (value) {
                    return value instanceof Function;
                },
                serialize: function (value) {
                    return value.toString();
                },
                deserialize: function (value) {
                    return new Function('return ' + value)();
                }
            };
        }
    },
    storage: {
        indexdb: require('./indexdb'),
        localstorage: require('./localstorage'),
        ram: require('./ram')
    }
};
