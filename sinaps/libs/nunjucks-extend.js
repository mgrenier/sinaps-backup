var _ = require('lodash');
var util = require('util');
var moment = require('moment');

module.exports = function (env) {

	env.addGlobal('max', Math.max);
	env.addGlobal('min', Math.min);
	env.addGlobal('floor', Math.floor);
	env.addGlobal('ceil', Math.ceil);
	env.addGlobal('round', Math.round);

	env.addFilter('merge', function (input, obj) {
		if (_.isArray(input))
			return input.concat(obj);
		return _.extend({}, input, obj);
	});

	env.addFilter('split', function (input, char) {
		return (input + '').split(char);
	});

	env.addFilter('json', function (input) {
		return JSON.stringify(input);
	});

	env.addFilter('inspect', function (input, depth) {
		if (input && typeof input.toJSON == 'function') {
			input = input.toJSON();
		}
		return util.inspect(input, {
			depth: parseInt(depth, 10) || 1
		});
	});

	env.addFilter('date', function (input, format) {
		var m = moment(input)
		return m.isValid() ? m.format(format || 'YYYY-MM-DD') : '';
	});

	env.addFilter('format', function () {
		var args = Array.prototype.slice.call(arguments),
			input = args.shift();
		return input.replace(/%s/g, function () {
			return args.length > 0 ? args.shift() : '';
		});
	});

	env.addFilter('l10n', function (input, locale) {
		locale = locale || this.ctx.locale;
		if (!locale) {
			throw new Error("No locale in context, provide locale to filter");
		}
		if (_.isArray(input)) {
			for (var a = input.length; --a >= 0;) {
				if (typeof input[a].locale !== 'undefined' && input[a].locale == locale) {
					return input[a].value;
				}
			}
		}
		if (_.isObject(input) && typeof input[locale] !== 'undefined') {
			return input[locale];
		}
		if (typeof input === 'string') {
			return input;
		}
		return null;
	});
};
