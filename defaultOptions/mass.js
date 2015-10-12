define(function () {
    return {
        "options": {
            "minimalHeight": 0,
            "widthTop": 0.1,
            "widthBottom": 0.2,
            "zone": {
                "low": -0.5,
                "high": 4.5
            },
            "mfRange":"C0-30 H0-60 N0-5 O0-10 F0-3 Cl0-3",
            "maxResults": 200,
            "bestOf": 0,
            "minSimilarity": 50,
            "minUnsaturation":-5,
            "maxUnsaturation": 50,
            "useUnsaturation": false,
            "integerUnsaturation": false,
            "massRange": 0.1,
            "decimalsPPM":4,
            "decimalsMass": 4,
            "addExperimentalExtract":true
        }
    }
});
