define([
    './libs',
    'src/util/api',
    'uri/URI',
    'src/util/versioning'
], function(libs, API, URI, Versioning) {
    var Roc = libs.Roc;
    var Sample = libs.Sample;
    var OCLE = libs.OCLE;

    if (typeof IframeBridge != 'undefined') {
        IframeBridge.onMessage(onMessage);
        IframeBridge.ready();
        function onMessage(data) {
            if (data.type === 'tab.data') {
                if (data.message && data.message.uuid) {
                    var roc = new Roc(data.message.couchDB);
                    var sample = new Sample(roc, data.message.uuid, data.message.couchDB.kind, {track:false});   
                } else {
                    fromCookie();
                }
            }
            if (data.type === 'tab.focus') {};
        }
    } else {
        fromCookie();
    }
});

function fromCookie() {
    // we retrieve the cache if it exists
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
