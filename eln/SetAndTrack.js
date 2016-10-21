define([
    'src/util/api',
], function (API) {
    var externalInfo = JSON.parse(window.localStorage.getItem('external_cache') || "{}");
    var smiles = externalInfo.smiles;
    var molfile = externalInfo.molfile;
    API.createData('nmr',[]);
    API.createData('mass',[]);
    API.createData('ir',[]);

    var uri = new URI(document.location.href);
    var search = uri.search(true);
    if (search.smiles) {
        smiles=search.smiles;
    }

    if (molfile) {
        var molecule=OCLE.Molecule.fromMolfile(molfile);
        API.createData('molfile', molecule.toMolfile());
    } else if(smiles) {
        var molecule=OCLE.Molecule.fromSmiles(smiles);
        API.createData('molfile', molecule.toMolfile());
    } else {
        molfile=window.localStorage.getItem('molfile');
        if (molfile) {
            API.createData('molfile', molfile);
        } else {
            API.createData('molfile', '');
        }
    }

    var data = Versioning.getData();
    data.onChange(function (evt) {
        if(evt.jpath.length==1 && evt.jpath[0]=='molfile') {
            localStorage.setItem('molfile', evt.target.get());
        }
    });
}
