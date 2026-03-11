const Language = require('../models/Language');
const systemLogger = require('./logger');

class I18nService {
    constructor() {
        this.cache = {}; // { 'en': { ... }, 'tr': { ... } }
        this.defaultLanguage = 'en';
        this.loaded = false;
    }

    /**
     * Initialize the i18n service by loading languages from the DB.
     */
    async init() {
        try {
            const languages = await Language.find({}).lean(); // Use lean() for performance

            if (languages.length === 0) {
                systemLogger.warn('i18n: No languages found in database. Please run seeding.');
                return;
            }

            this.cache = {}; // Reset cache
            let loadedCount = 0;

            languages.forEach(lang => {
                this.cache[lang.code] = lang.strings || {};
                if (lang.isDefault) {
                    this.defaultLanguage = lang.code;
                }
                loadedCount++;
            });

            this.loaded = true;
            // systemLogger.success(`i18n Service Initialized. Languages loaded: ${loadedCount}. Default: ${this.defaultLanguage}`);
        } catch (error) {
            systemLogger.error(`i18n Initialization Failed: ${error.message}`);
            console.error(error);
        }
    }

    /**
     * Middleware to attach helper functions to req and res.
     */
    getMiddleware() {
        return async (req, res, next) => {
            try {
                // Fetch fresh translations from MongoDB on every request
                const languages = await Language.find({}).lean();
                const translations = {};
                let defaultLang = this.defaultLanguage;

                languages.forEach(lang => {
                    translations[lang.code] = lang.strings || {};
                    if (lang.isDefault) {
                        defaultLang = lang.code;
                    }
                });

                // Determine language priority: Query > Cookie > Header > Default
                let lang = req.query.lang || req.cookies?.lang || req.acceptsLanguages(Object.keys(translations)) || defaultLang;

                // Validate language availability
                if (!translations[lang]) {
                    lang = defaultLang;
                }

                // Persist language decision in cookie (if changed or explicit)
                if (req.query.lang && translations[req.query.lang]) {
                    res.cookie('lang', lang, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // 1 day
                }

                // Attach to request
                req.lang = lang;

                // Define the translate function
                const t = (key, params = {}) => {
                    const getNested = (obj, path) => {
                        if (!obj) return undefined;
                        return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
                    };

                    // 1. Try current language
                    let translation = getNested(translations[lang], key);

                    // 2. Try default language (Fallback)
                    if (translation === undefined) {
                        translation = getNested(translations[defaultLang], key);
                    }

                    // 3. Return key if still missing, or if value is not a string
                    if (translation === undefined || typeof translation !== 'string') {
                        return key;
                    }

                    // 4. Parameter interpolation: "Hello {name}" -> "Hello World"
                    Object.keys(params).forEach(param => {
                        translation = translation.replace(new RegExp(`{${param}}`, 'g'), params[param]);
                    });

                    return translation;
                };

                // Expose to Request and Response (for Views)
                req.t = t;
                res.locals.t = t;
                res.locals.lang = lang;
                res.locals.currentPath = req.path;

                next();
            } catch (error) {
                systemLogger.error(`i18n Middleware Error: ${error.message}`);
                next();
            }
        };
    }

    /**
     * Hot-reload translations without restarting server
     */
    async reload() {
        await this.init();
    }
}

const i18nService = new I18nService();
module.exports = i18nService;