module.exports = {
	process: process,
	group_by_output: group_by_output
};

var zipper = require('../zipper/zipper');
var logger = require('../logger/logger');
var linq = require('linqnode');

function process(config_entries){
	linq.linqify(config_entries);
	if (config_entries == null || config_entries.length == 0){
		logger.log('No config entries found');
		return;
	}
	var prepare_entries = config_entries
							.where(function(entry) { return entry.type === 'prepare'; })
							.to_list();
	var grouped_by_output = group_by_output(prepare_entries);
	for(var out_file in grouped_by_output){
		logger.log('Creating output file ' + out_file);
		var input_entries_for_this_output = grouped_by_output[out_file];
		linq.linqify(input_entries_for_this_output);
		var input_files = input_entries_for_this_output
							.select(function(entry) { return entry.in_file; })
							.to_list();
		process_files(input_files, out_file);
	}

	var deploy_entries = config_entries
							.where(function(entry) { return entry.type === 'deploy' })
							.to_list();
	deploy_entries.forEach(function(entry){
		zipper.unzip(entry.zip_file, entry.out_directory);
	});
}

function process_files(input_files_for_this_output, out_file){
	logger.log('Processing output file ' + out_file);
	zipper.zippit(input_files_for_this_output, out_file);
}

function group_by_output(config_entries){
	var result = {};
	config_entries.forEach(function(entry){
		if (result[entry.raw_out_file] == null){
			result[entry.raw_out_file] = [];
		}
		result[entry.raw_out_file].push(entry);
	});
	return result;
}
