'use strict';

define(['src/util/api'], function (API) {

    async function exercisesManager(action, allExercises, options) {
        switch (action) {
            case 'init':
                await loadExercises(allExercises, options);
                break;
            case 'clear':
                var state = loadState(options.cookieName);
                state.myResults = {};
                saveState(options.cookieName, state);
                await loadExercises(allExercises, options);
                break;
            case 'regenerate':
                var state = loadState(options.cookieName);
                state.selectedExercises = [];
                saveState(options.cookieName, state);
                await loadExercises(allExercises, options);
                break;
        }


        function loadState(cookieName) {
            console.log('Loading state', cookieName, window.localStorage.getItem(cookieName))
            return JSON.parse(window.localStorage.getItem(cookieName)
                || '{"selectedExercises":[],"myResults":{}}');
        }

        function saveState(cookieName, state) {
            console.log('Saving state', cookieName, JSON.stringify(state))
            window.localStorage.setItem(cookieName, JSON.stringify(state));
        }

        /**
         * This objects allows to manage exercises
         */
        function loadExercises(allExercises, options = {}) {
            // need to check is we have some cookie that contains the existing exercises
            var state = loadState(options.cookieName);

            var myResults = state.myResults;
            if (state.selectedExercises.length !== options.numberExercises) {
                // need to recreate a serie
                console.log('create new serie');
                allExercises.sort(() => Math.random() - 0.5);
                var selectedExercises = allExercises.slice(0, options.numberExercises);
            } else {
                // we need to reload the exercises based on the cookie
                var selectedExercises = allExercises.filter(a => state.selectedExercises.includes(a.id));
                selectedExercises.forEach(a => {
                    if (state.myResults[a.id]) a.myResult = state.myResults[a.id]
                });
            }

            state.selectedExercises = selectedExercises.map(a => a.id);

            saveState(options.cookieName, state);

            return API.createData('exercises', selectedExercises).then(function (exercises) {


                exercises.onChange(function (evt) {
                    console.log('CHANGE')
                    switch (evt.target.__name) {
                        case 'myResult':
                            var target = evt.target.__parent;
                            if (target) {
                                myResults[target.id] = target.myResult;
                            }
                            saveState(options.cookieName, state);
                            break;
                    }
                });
                return exercises;
            })
        }
    }

    return exercisesManager;
})