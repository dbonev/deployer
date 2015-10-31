var logger = require('./logger/logger');

var argv = process.argv;

if (argv.length <= 2){
	print_help();
	return;	
}

var reader = require('./config_reader/config_reader'); 
var processor = require('./processor/processor'); 

function ends_with(source, token){
	var re = new RegExp(token + "$");
	return re.test(source);
}

var command = argv[2];
var filename = command;
if (!ends_with(command, '.conf')){
	filename = command + '.conf';
} 

logger.log('Processing entries in ' + filename);

reader.read_config(filename, function(config_entries){
	processor.process(config_entries);
});

function print_help(){
	logger.log('Usage:\n$ node main.js prepare');
}
