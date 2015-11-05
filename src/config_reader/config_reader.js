module.exports  = {
	read_config: _read_conf,
	starts_with: starts_with,
	ends_with: ends_with
}

var readline = require('readline');
var fs = require('fs');
var path = require('path');
var separator;

function _read_conf(filename, callback){
	separator = ":";
	var input = fs.createReadStream(filename);
	var result = [];
	rl_interface = readline.createInterface({
		input: input
	});
	rl_interface.on('line', function(line){
		if(line == null || line.length == 0){
			return;
		}
		if (starts_with(line, "separator")){
			separator = line.slice(-1);
			return;
		}
		var info = create_config_info(line);
		if (info != null){
			result.push(info);
		}
	});
	rl_interface.on('close', function(){
		callback(result);
	});
}

function PrepareConfigInfo(parsed_array){
	this.in_file = parsed_array[1];
	this.raw_out_file = parsed_array[3];
	this.out_directory = path.dirname(this.raw_out_file);
	this.out_file = path.basename(this.raw_out_file);
	this.is_output_zipped = true;
	this.is_input_folder = false;
	this.type = 'prepare';
}

function DeployConfigInfo(parsed_array){
	this.zip_file = parsed_array[1];
	this.out_directory = parsed_array[3];
	this.type = 'deploy';
}

function create_config_info(raw_line){
	parsed_array = split(raw_line);
	if (parsed_array.length == 4
		&& parsed_array[0] === 'file'
		&& parsed_array[2] === 'goes_into'){
		return new PrepareConfigInfo(parsed_array);
	} else if (parsed_array.length == 4
		&& parsed_array[0] === 'unzip'
		&& parsed_array[2] === 'into'){
		return new DeployConfigInfo(parsed_array);
	} else {
		return null;
	}
}

function starts_with(source, pattern){
	var re = new RegExp("^" + pattern);
	return re.test(source);
}

function ends_with(source, pattern){
	var re = new RegExp(pattern + "$");
	return re.test(source);
}


function split(string){
	return string.split(separator);
}
