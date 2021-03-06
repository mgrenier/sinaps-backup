var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var pluginAdmin = sinaps.require('sinaps.admin');
var Schema = sinaps.require('sinaps.core').Schema;
var SectionSchema = require('./schemas/Section');
var SectionModel;
var mongoose = require('mongoose');
var unidecode = require('unidecode');

module.exports = _.extend({}, EventEmitter.prototype, {

	// Schemas
	SectionSchema: SectionSchema,

	// Models
	SectionModel: SectionModel,

	// Sections collection
	sections: [],

	// Get schema by section handle
	schema: function (handle) {
		for (var i = this.sections.length; --i >= 0;) {
			if (this.sections[i].schema.handle == handle)
				return this.sections[i].schema;
		}
		return undefined;
	},

	// Get list of loaded schemas
	schemas: function () {
		return this.sections.map(function (section) {
			return section.schema;
		});
	},

	// Get model by section handle
	model: function (handle) {
		for (var i = this.sections.length; --i >= 0;) {
			if (this.sections[i].schema.handle == handle)
				return this.sections[i].model;
		}
		return undefined;
	},

	// Get list of loaded models
	models: function () {
		return this.sections.map(function (section) {
			return section.model;
		});
	},

	//
	addSchema: function (schema, model) {
		this.sections.push({
			model: model || null,
			schema: schema,
			entryModel: undefined,
			entrySchema: undefined
		});
	},

	// Order in which plugins are executed
	executionOrder: -400,

	// Main function that sinaps execute
	initialize: function () {

		sinaps.once('initialized', function () {

			// Setup user model based on schema
			this.SectionModel = sinaps.db.model('section', SectionSchema.finalizedSchema());

			// Load section from database
			this.SectionModel.find({}, function (err, models) {
				if (err)
					return;

				// Build schema, nav
				models.forEach(function (model) {

					this.addSchema(model.getLayoutSchema(), model);

				}.bind(this));

				// Let others extend sections
				this.emit('loaded');

				pluginAdmin.sidebar.navigation.addItem({
					title: 'Sections',
					href: '/admin/sections/',
					icon: 'fa fa-newspaper-o'
				});

				// Admin sidebar nav group
				pluginAdmin.settings.navigation.addItem({
					weight: 0,
					title: 'Sections',
					href: '/admin/settings/sections/',
					icon: 'fa fa-server'
				});

				// Build model after everyone messed with the schemas
				_.sortBy(this.sections, function (section) {
					return section.schema.handle;
				}).forEach(function (section, i) {

					/*pluginAdmin.sidebar.navigation.addItem({
						weight: 5000 + i,
						title: section.schema.label,
						href: '/admin/sections/' + section.schema.handle + '/',
						icon: 'fa fa-newspaper-o'
					});*/

					section.entrySchema = section.schema.finalizedSchema();

					switch (section.model.layout.toLowerCase()) {
						case 'channel':
							section.entrySchema.add({
								postDate: {
									type: Date,
									index: true,
									required: true,
									set: pluginAdmin.fieldTypes['date'].setter
								},
								expireDate: {
									type: Date,
									index: true,
									set: pluginAdmin.fieldTypes['date'].setter
								}
							});
							break;
						case 'structure':
							// FIXME static method to retrieve full structure
							// FIXME method to retrieve children
							section.entrySchema.add({
								parentId: {
									//type: mongoose.Schema.Types.ObjectId,
									type: String,
									index: true
								},
								order: {
									type: Number,
									index: true,
									required: true,
									default: 0
								}
							});
							break;
						case 'page':
							// Nothing special...
							break;
					}


					section.entrySchema.add({
						url: _.mapValues(_.invert(sinaps.config.languages), function (i, lang) {
							return {
								type: String,
								index: true
							};
						}),
						state: {
							type: String,
							index: true,
							required: true,
							default: 'published'
						},
					});

					section.entrySchema.methods['getTitle'] = function () {
						return _.map(sinaps.config.languages, function (lang) {
							try {
								return { locale: lang, value: sinaps.nunjucks.renderString(section.model.get('titleFormat'), this.localized(lang)) };
							} catch (e) {}
							return { locale: lang, value: '' };
						}.bind(this));
					};
					section.entrySchema.pre('save', function (next) {
						var url = {}, urlFormat = section.model.get('urlFormat') || [];
						for (var a = urlFormat.length; --a >= 0;) {
							url[urlFormat[a].locale] = '';
							try {
								url[urlFormat[a].locale] = unidecode(sinaps.nunjucks.renderString(urlFormat[a].value, this.localized(urlFormat[a].locale)))
										.replace(/[^a-z0-9_\/]/gi, '-')
										.replace(/[-]+/g, '-')
										.replace(/^-/, '')
										.replace(/-$/, '')
										.toLowerCase();
							} catch (e) { }
						}
						this.url = url;
						next();
					});

					section.entryModel = sinaps.db.model('section_' + section.schema.handle, section.entrySchema);
				});

				// Let others know models are ready
				this.emit('ready');

			}.bind(this));

		}.bind(this));

		// Initialize admin
		//require('./admin-section.js')();
		//require('./admin-model.js')();
		require('./admin.js')();
		require('./settings.js')();

		// All plugin have initalized
		sinaps.once('idle', function () {

			sinaps.app.use(function (req, res, next) {
				console.log('Is ' + req.originalUrl + ' a section?');
				next();
				/*res.status(404).render('404', {
					requested: req.originalUrl
				});*/
			});

		});

	}

});
