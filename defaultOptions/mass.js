define(function () {
    return {
        "monoisotopicMass": 300.123,
        "groups1":"(H+).(H+)2.(H+)3.K+.Na+",
        "groups2":"",
        "groups3":"",
        "groups4":"",
        "groups5":"",
        "sequence":"",
        "sequence2":"",
        "mfPattern":"Br2",
        "options": {
            "protonate": false,
            "protonationPH": 0,
            "minimalHeight": 0,
            "widthTop": 0.1,
            "widthBottom": 0.2,
            "widthFunction":"// var widthBottom = 0.01 + mass / 8000;\r\n// var widthTop = widthBottom / 2;",
            "zone": {
                "low": -0.5,
                "high": 4.5
            },
            "mfRange":"C0-100 H0-200 N0-10 O0-10 S0-5 F0-5 Cl0-5 Br0-5",
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
