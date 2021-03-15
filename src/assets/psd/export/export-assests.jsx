// Export layers to properly named files

var destination = Folder.selectDialog('Select a folder to save the export files');
var docs = app.documents;
var cntD = docs.length;
var baseName;
var layers;

var pngOptions = new ExportOptionsSaveForWeb();
pngOptions.format = SaveDocumentType.PNG;
pngOptions.PNG8 = true;


function getDestination(layerName) { 
    return destination + '/' + baseName + '-' + layerName + '.png';
}

function hideLayers(layers) {
    var i = layers.length;
    while(i--){
        layers[i].visible = false;
    }
}

while (cntD--){
    app.activeDocument = docs[cntD];
    baseName = app.activeDocument.name.slice(0, app.activeDocument.name.lastIndexOf('.'));
    layers = app.activeDocument.artLayers;
    var cntL = layers.length;
    
    while(cntL--){
        hideLayers(layers);
        layers[cntL].visible = true;
        app.activeDocument.exportDocument(
            new File(getDestination(layers[cntL].name)),
            ExportType.SAVEFORWEB,
            pngOptions
        );
    }
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

alert('Files have been exported to ' + destination);