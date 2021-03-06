var _ = require('lodash');
var UserSchema = require('./schemas/User');
var User;
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');


module.exports = {
	// Schemas
	Schema: require('./libs/Schema'),

	// Schema of a user
	UserSchema: UserSchema,

	// Actual mongoose model of a user
	User: User,

	// Order in which plugins are executed
	executionOrder: -1000,

	// Main function that sinaps execute
	initialize: function () {

		sinaps.once('initialized', function () {

			// Setup user model based on schema
			User = sinaps.db.model('User', UserSchema.finalizedSchema());

			// Setup session / login / logout
			{
				sinaps.app.use(passport.initialize());
				sinaps.app.use(passport.session());

				passport.use(new LocalStrategy(function (username, password, done) {
					User.findOne({email: username}, function (err, user) {
						if (err)
							return done(err);
						if (!user || !user.verifyPassword(password))
							return done(null, false);
						return done(null, user);
					});
				}));
				passport.serializeUser(function (user, done) {
					done(null, user.id);
				});
				passport.deserializeUser(function (id, done) {
					User.findById(id, function (err, user) {
						done(err, user);
					});
				});

				// If user present in request (logged)
				sinaps.router.use(function (req, res, next) {
					// FIXME locale in url
					req.locale = sinaps.config.languages[0];
					req.l10n = function (input, locale) {
						locale == locale || res.locals.locale;
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
						return input;
					};

					res.locals.locale = req.locale;

					res.locals.messages = req.session.messages || [];
					res.locals.user = req.user || null;

					// Messages consumed, empty out messages
					req.session.messages = [];

					next();
				});
			}


		});
	}
};
