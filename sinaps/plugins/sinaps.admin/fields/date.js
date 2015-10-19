var _ = require('lodash');
var moment = require('moment');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Date
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'date',
		label: 'Date',
		type: Date,
		setter: function (v) {
			var m = moment(v)
			return m.isValid() ? m.toDate() : '';
		},
		settings: {
			format: {
				type: 'text',
				label: 'Format',
				value: 'YYYY-MM-DD'
			}
		},

		getInputTemplate: function () {
			return '<div class="input-group input-medium date date-picker" data-date-format="{{ field.format|default("yyyy-mm-dd") }}">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control") }}"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.value %} value="{{ field.value }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-btn">\
		<button class="btn default" type="button"><i class="fa fa-calendar"></i></button>\
	</span>\
</div>';
		},

		getValueTemplate: function () {
			return '{% if field.value %}{{ field.value|date(field.format|default("YYYY-MM-DD")) }}{% endif %}';
		},

		getIncludedJS: function () {
			return '$(".date-picker:not([data-field-discovered])").attr("data-field-discovered", "").datepicker({orientation: "left", autoclose: true});';
		}
	}));
};