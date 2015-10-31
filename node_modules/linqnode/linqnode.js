module.exports = {
	where: _where,
	select: _select,
	order_by: _order_by,
	order_by_desc: _order_by_desc,
	then_by: _then_by,
	then_by_desc: _then_by_desc,
	to_list: _to_list,
	take: _take,
	skip: _skip,
	linqify: _linqify
}

function _linqify(sequence){
	sequence.where = function(filter){ return _where(sequence, filter); };
	sequence.select = function(transform) { return _select(sequence, transform); };
	sequence.order_by = function(selector) { return _order_by(sequence, selector); };
	sequence.order_by_desc = function(selector) { return _order_by_desc(sequence, selector); };
	sequence.then_by = function(selector) { return _then_by(sequence, selector); };
	sequence.then_by_desc = function(selector) { return _then_by_desc(sequence, selector); };
	sequence.to_list = function() { return _to_list(sequence); };
	sequence.take = function(number) { return _take(sequence, number); };
	sequence.skip = function(number) { return _skip(sequence, number); };
	sequence.first = function(filter) { return _first(sequence, filter); };
}

function _where(sequence, filter){
	var result = new IEnumerableFilter(sequence, filter);
	return result;
}

function _select(sequence, transform){
	var result = new IEnumerableTransform(sequence, transform);
	return result;
}

function _order_by(sequence, selector){
	var result = new IEnumerableOrderBy(sequence, selector, false);
	return result;
}

function _then_by(sequence, selector){
	var result = new IEnumerableThenBy(sequence, selector, false);
	return result;
}

function _then_by_desc(sequence, selector){
	var result = new IEnumerableThenBy(sequence, selector, true);
	return result;
}

function _order_by_desc(sequence, selector){
	var result = new IEnumerableOrderBy(sequence, selector, true);
	return result;
}

function _take(sequence, number){
	var result = new IEnumerableTake(sequence, number);
	return result;
}

function _skip(sequence, number){
	var result = new IEnumerableSkip(sequence, number);
	return result;
}

function _first(sequence, filter){
	sequence = _where(sequence, filter);
	var first_seq = _take(sequence, 1);
	var arr = first_seq.to_list();
	return arr.length > 0 ? arr[0] : undefined;
}

function _to_list(sequence){
	var result = [];
	sequence.forEach(function(item){
		result.push(item);
	});
	_linqify(result);
	return result;
}

function IEnumerableTransform(sequence, transform){
	this.forEach = function(action){
		sequence.forEach(function(item){
			var transformed = transform(item);
			action(transformed);
		});
	};
	_linqify(this);
}

function IEnumerableFilter(sequence, filter){
	this.forEach = function(action){
		sequence.forEach(function(item){
			if (filter(item)){
				action(item);
			}
		});
	};
	_linqify(this);
}

// not the most efficient way possible, but good enough for now
function IEnumerableThenBy(sequence, selector, desc){
	if (sequence._selectors == null || sequence._selectors.length == 0){
		throw { Error: "then_by should only used after order_by" };
	}

	this.forEach = function(action){
		var result = [];
		sequence.forEach(function(item){
			result.push(item);
		});
		result.sort(function(a, b){
			for (var i = 0; i < sequence._selectors.length - 1; i++){
				var meta = sequence._selectors[i];
				var sel = meta.selector;
				var is_desc = meta.desc;
				var sel_comp = __compare_by_selector(a, b, sel, is_desc);
				if (sel_comp != 0){
					return sel_comp;
				}
			}
			return __compare_by_selector(a, b, selector, desc);
		});
		result.forEach(action);

	};
	this._selectors = sequence._selectors;
	this._selectors.push({ selector: selector, desc: desc });
	_linqify(this);
}

function IEnumerableOrderBy(sequence, selector, desc){
	this.forEach = function(action){
		var result = [];
		sequence.forEach(function(item){
			result.push(item);
		});
		result.sort(function(a, b){
			return __compare_by_selector(a, b, selector, desc);
		});
		result.forEach(action);
	};
	this._selectors = [{ selector: selector, desc: desc }];
	_linqify(this);
}

function IEnumerableTake(sequence, number){
	this.forEach = function(action){
		var i = 0;
		sequence.forEach(function(item){
			if (i++ <= number){
				action(item);
			} 
		});
	};
	_linqify(this);
}
function IEnumerableSkip(sequence, number){
	this.forEach = function(action){
		var i = 0;
		sequence.forEach(function(item){
			if (i++ >= number){
				action(item);
			}
		});
	};
	_linqify(this);
}

function __compare_by_selector(a, b, selector, desc){
	var val_a = selector(a);
	var val_b = selector(b);
	var multiplier = desc ? -1 : 1;

	if (val_a < val_b){
		return -1 * multiplier;
	} else if (val_a === val_b){
		return 0;
	} else {
		return 1 * multiplier;
	}
}
