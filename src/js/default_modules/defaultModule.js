module.exports = {
    api: {
        default: require('./default').api
    },
    parser: {
        default: require('./default').parser
    },
    datatype: {},
    storage: {
        indexdb: require('./indexdb'),
        localstorage: require('./localstorage'),
        ram: require('./ram')
    }
};
