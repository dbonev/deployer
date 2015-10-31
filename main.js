var logger = require('./src/logger/logger');
var reader = require('./src/config_reader/config_reader'); 

var argv = process.argv;

if (argv.length <= 2){
	print_help();
	return;	
}

var processor = require('./src/processor/processor'); 

var command = argv[2];
var filename = command;
if (!reader.ends_with(command, '.conf')){
	filename = command + '.conf';
} 

logger.log('Processing entries in ' + filename);

reader.read_config(filename, function(config_entries){
	processor.process(config_entries);
});

function print_help(){
	logger.log('Usage:\n$ node main.js prepare');
}
