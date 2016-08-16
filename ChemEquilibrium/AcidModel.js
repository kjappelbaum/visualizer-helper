'use strict';

define(['lodash'], function (_) {
    class AcidBase {
        constructor(pkas) {
            this.pkas = pkas;
            this.components = [];
        }

        addComponent(label, total) {
            if(!total) total = 0;
            var comp = this.components.find(c => c.label === label);
            if(comp) comp.total += total;
            else {
                this.components.push({
                    label, total
                });
            }
        }

        setTotal(componentLabel, total) {
            var c = this.components.find(c => c.label === componentLabel);
            c.total = total;
            c.atEquilibrium = undefined;
        }

        setAtEquilibrium(componentLabel, atEquilibrium) {
            var c = this.components.find(c => c.label === componentLabel);
            c.atEquilibrium = atEquilibrium;
            c.total = undefined;
        }

        getModel() {
            // Get all involved pkas
            var pkas = this.pkas.filter(pka => {
                return this.components.find(function (c) {
                    return String(c.label) === String(pka.specie.label);
                });
            });

            // group pkas by component
            var grouped = _.groupBy(pkas, function(pka) {
                return String(pka.specie.label);
            });


            var keys = Object.keys(grouped);
            var nbComponents = this.components.length + 1;


            //
            var model = {};
            var options = {
                volume: 1
            };

            // Model components
            // First component always proton
            model.components = new Array(nbComponents);
            model.components[0] = {
                label: 'H+'
            };

            for(i = 0; i<this.components.length; i++) {
                model.components[i+1] = this.components[i];
            }

            model.formedSpecies = [{
                label: 'OH-',
                beta: Math.pow(10, -14),
                components: new Array(nbComponents).fill(0)
            }];

            model.formedSpecies[0].components[0] = -1;



            for(var i=0; i<keys.length; i++) {
                var group = grouped[keys[i]];
                for(var j=0; j<group.length; j++) {
                    var el = group[j];
                    model.formedSpecies.push({
                        label: String(el.ha),
                        beta: Math.pow(10, Number(el.specie.pka)),
                        components: new Array(nbComponents).fill(0)
                    });
                    model.formedSpecies[model.formedSpecies.length -1].components[i+1] = 1;
                    model.formedSpecies[model.formedSpecies.length -1].components[0] = Number(el.specie.number);
                }
            }

            return model;
        }
    }
    return AcidBase;
});
