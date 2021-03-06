var assert = require('assert');
var reader = require('../src/config_reader/config_reader'); 
var zipper = require('../src/zipper/zipper');
var processor = require('../src/processor/processor');
var shell = require('shelljs/global');
var fs = require('fs');

function delete_temp_files(files){
	if (typeof files.forEach === 'function'){
		files.forEach(function(file){
			fs.unlink(file);
		});
	} else if (files != null && typeof files === 'string'){
		fs.unlink(files);
	}
}
function create_temp_conf_file(filename, config_entries, separator){
	if (config_entries == null){
		exec('echo ==tmp=file==  > ' + filename);
		if (separator != null){
			exec('echo separator' + separator + ' >> ' + filename);
		} else {
			separator = ":";
		}
		exec('echo file' + separator + '/home/db/temp/test' + separator + 'goes_into' + separator + '/h.zip >> ' + filename);
		exec('echo file' + separator + '/home/db/temp/test1' + separator + 'goes_into' + separator + '/h.zip >> ' + filename);
	} else {
		exec('echo  >  ' + filename);
		config_entries.forEach(function(entry){
			output = 'echo file:' + entry.in_file + ':goes_into:' + entry.raw_out_file + ' >> ' + filename;
			exec(output);
		});
	}
}

describe('Ability to change separator', function(){
	create_temp_conf_file('__sep.conf', null, ",");
	it('shouild have processed the configuration', function(done){
		reader.read_config('__sep.conf', function(config_entries){
			assert.equal(2, config_entries.length);
			var entry_1 = config_entries[0];
			var entry_2 = config_entries[1];
			assert.equal('/home/db/temp/test', entry_1.in_file);
			assert.equal('/home/db/temp/test1', entry_2.in_file);
			assert.equal('h.zip', entry_1.out_file);
			delete_temp_files('__sep.conf');
			done();
		});
	});
});

describe('Input file read line by line', function(){
	create_temp_conf_file('__sep2.conf');
	it('should have executed', function(done){
		reader.read_config('__sep2.conf', function(config_entries){
			assert.equal(2, config_entries.length);
			var entry_1 = config_entries[0];
			var entry_2 = config_entries[1];
			assert.equal('/home/db/temp/test', entry_1.in_file);
			assert.equal('/home/db/temp/test1', entry_2.in_file);
			assert.equal('h.zip', entry_1.out_file);
			delete_temp_files('__sep2.conf');
			done();
		});
	});
});

describe('Zipping the input into a single file', function(){
	exec('echo test > __tst.txt');
	exec('echo test > __tst1.txt');
	exec('echo test > __tst2.txt');
	var files = ["__tst.txt", "__tst1.txt", "__tst2.txt"];
	var zipfile =  "__tstzip.zip";
	it("zip should exist", function(done){
		zipper.zippit(files, zipfile, function(){
			assert.equal(exists(zipfile), true);
			delete_temp_files(files);
			delete_temp_files(zipfile);
			done();
		});
	});
});

describe('Grouping config entries by output', function(){
	var arr = [];
	arr.push({
		name: "test",
		raw_out_file: "/home/o1"
	});

	arr.push({
		name: "test2",
		raw_out_file: "/home/o2"
	});
	arr.push({
		name: "test3",
		raw_out_file: "/home/o1"
	});
	var grouped = processor.group_by_output(arr);
	it('should have been grouped correctly', function(){
		var in_o1 = grouped["/home/o1"];
		var in_o2 = grouped["/home/o2"];
		assert.equal(in_o1.length, 2);
		assert.equal(in_o2.length, 1);
	});
	it('should be possible to loop over properties', function(){
		var i = 0;
		for (var key in grouped){
			console.log(key);
			if (key === "/home/o1" || key === "/home/o2"){
				i++;
			}
		}
		assert.equal(i, 2);
	});
});

function exists(file) {
	try {
		return fs.statSync(file).isFile();
	}
	catch (err) {
		return false;
	}
}
