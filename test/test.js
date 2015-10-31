var assert = require('assert');
var reader = require('../src/config_reader/config_reader'); 
var zipper = require('../src/zipper/zipper');
var processor = require('../src/processor/processor');
var shell = require('shelljs/global');
var fs = require('fs');

function create_temp_conf_file(config_entries){
	if (config_entries == null){
		exec('echo file:/home/db/temp/test:goes_into:/h.zip > __test_prep.conf');
		exec('echo file:/home/db/temp/test1:goes_into:/h.zip >> __test_prep.conf');
	} else {
		exec('touch __test_prep.conf');
		config_entries.forEach(function(entry){
			output = 'echo file:' + entry.in_file + ':goes_into:' + entry.raw_out_file + ' >> __test_prep.conf';
			exec(output);
		});
	}
}

describe('Input file read line by line', function(){
	create_temp_conf_file();
	it('should have executed', function(done){
		reader.read_config('__test_prep.conf', function(config_entries){
			assert.equal(2, config_entries.length);
			var entry_1 = config_entries[0];
			var entry_2 = config_entries[1];
			assert.equal('/home/db/temp/test', entry_1.in_file);
			assert.equal('/home/db/temp/test1', entry_2.in_file);
			assert.equal('h.zip', entry_1.out_file);
			done();
		});
	});
});

describe('Zpiiing the input into a single file', function(){
	exec('echo test > /tmp/tst.txt');
	exec('echo test > /tmp/tst1.txt');
	exec('echo test > /tmp/tst2.txt');
	var files = ["/tmp/tst.txt", "/tmp/tst1.txt", "/tmp/tst2.txt"];
	var zipfile =  "/tmp/tstzip.zip";
	it("zip should exist", function(done){
		zipper.zippit(files, zipfile, function(){
			assert.equal(exists(zipfile), true);
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
			if (grouped[key] != null){
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
