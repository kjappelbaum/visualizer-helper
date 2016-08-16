'use strict';
var pkas = [{"ha":"HIO3","a":"IO3-","pka":0.8},{"ha":"H3PO4","a":"H2PO4-","pka":2.16},{"ha":"H2PO4-","a":"HPO4--","pka":7.21},{"ha":"HPO4--","a":"PO4---","pka":12.32},{"ha":"HF","a":"F-","pka":3.2},{"ha":"HNO2","a":"NO2-","pka":3.25},{"ha":"HOCN","a":"OCN-","pka":3.48},{"ha":"H2CO3","a":"HCO3-","pka":6.35},{"ha":"HCO3-","a":"CO3--","pka":10.33},{"ha":"H2S","a":"HS-","pka":7.05},{"ha":"HS-","a":"S--","pka":12.09},{"ha":"HClO","a":"ClO-","pka":7.4},{"ha":"HBrO","a":"BrO-","pka":8.6},{"ha":"HCN","a":"CN-","pka":9.21},{"ha":"NH4+","a":"NH3","pka":9.25},{"ha":"CH2ClCOOH","a":"CH2ClCOO-","pka":2.89},{"ha":"HCOOH","a":"HCOO-","pka":3.75},{"ha":"C6H5COOH","a":"C6H5COO-","pka":4.2},{"ha":"C66H5NH3+","a":"C66H5NH2","pka":4.6},{"ha":"CH3COOH","a":"CH3COO-","pka":4.75},{"ha":"C2H5COOH","a":"C2H5COO-","pka":4.87},{"ha":"C5H5NH+","a":"C5H5N","pka":5.25},{"ha":"CH3NH3+","a":"CH3NH2","pka":10.66},{"ha":"(C2H5)3NH+","a":"(C2H5)3N","pka":10.75},{"ha":"C2H5NH3+","a":"C2H5NH2","pka":10.8}];

define(['lodash'], function (_) {
    class AcidBase {
        constructor(customPkas) {
            this.pkas = customPkas || pkas;
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
