module.exports = {
	zippit : zippit,
	unzip : unzip
};
var archiver = require('archiver');
var fs = require('fs');
var path = require('path');
var unzip = require('adm-zip');
var logger = require('../logger/logger');

function zippit (input_files, zip_file, callback){
	var archive = archiver.create('zip', {});
	var output = fs.createWriteStream(zip_file);
	output.on('close', function(){
		logger.log('File ' + zip_file + ' processed successfully');
		if (callback != null){
			callback();
		}
	});
	archive.pipe(output);
	input_files.forEach(function(file){
		var basename = path.basename(file);
		if (fs.lstatSync(file).isDirectory()){
			archive.directory(file, basename );
		} else {
			archive.file(file, { name: basename });
		}
	});
	archive.finalize();
}

function unzip(zip_file, target_path){
	logger.log('Deploying ' + zip_file + ' into ' + target_path);
	//fs.createReadStream(zip_file).pipe(unzip.Extract({ path: target_path}));
	var zip = new unzip(zip_file);
	zip.extractAllTo(target_path, true);
}
