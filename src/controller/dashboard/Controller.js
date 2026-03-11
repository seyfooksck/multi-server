const Language = require('../../models/Language');

function flattenStrings(obj, prefix) {
    prefix = prefix || '';
    const result = {};
    if (!obj || typeof obj !== 'object') return result;
    for (const k of Object.keys(obj)) {
        const fullKey = prefix ? prefix + '.' + k : k;
        if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            Object.assign(result, flattenStrings(obj[k], fullKey));
        } else {
            result[fullKey] = obj[k] != null ? String(obj[k]) : '';
        }
    }
    return result;
}

function buildStringsObject(stringKeys, stringValues) {
    const keys = Array.isArray(stringKeys) ? stringKeys : (stringKeys ? [stringKeys] : []);
    const values = Array.isArray(stringValues) ? stringValues : (stringValues ? [stringValues] : []);
    const result = {};
    keys.forEach((key, i) => {
        if (key && key.trim()) {
            const k = key.trim();
            const v = (values[i] || '').trim();
            const parts = k.split('.');
            let current = result;
            for (let p = 0; p < parts.length - 1; p++) {
                if (!current[parts[p]] || typeof current[parts[p]] !== 'object') {
                    current[parts[p]] = {};
                }
                current = current[parts[p]];
            }
            current[parts[parts.length - 1]] = v;
        }
    });
    return result;
}

class DashboardController {
    async index(req, res) {
        const title = res.locals.t ? res.locals.t('WELCOME') : 'Welcome';
        res.render('pages/home', {
            title: title,
            message: 'Welcome to the Dashboard System',
            navigation: { main: 'Home', page: 'Dashboard', link: '/dashboard', },
        });
    }
    test(req, res) {
        const title = res.locals.t ? res.locals.t('WELCOME') : 'Welcome';

        res.render('pages/home2', {
            title: title,
            message: 'Welcome to the Dashboard System',
            navigation: { main: 'Home', page: 'Test', link: '/test', },
        });
    }
    async notifications(req, res) {
        const title = res.locals.t ? res.locals.t('NOTIFICATIONS') : 'Notifications';
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const filters = {
            category: req.query.category || 'all',
            search: req.query.search || ''
        };

        const { notifications, total, pages, currentPage } = await require('../../services/notificationService').getUserNotifications(req.user.id, page, limit, filters);

        res.render('pages/notifications', {
            title: title,
            notifications: notifications,
            currentPage: currentPage,
            pages: pages,
            total: total,
            limit: limit,
            filters: filters,
            navigation: { main: 'Dashboard', page: 'Notifications', link: '/notifications' }
        });
    }

    async underConstruction(req, res) {
        const title = res.locals.t ? res.locals.t('UNDER_CONSTRUCTION') : 'Under Construction';
        res.render('pages/utility/under-construction', {
            title: title,
            navigation: { main: 'Utility', page: 'Under Construction', link: '/under-construction' }
        });
    }
    async compose(req, res) {
        const title = res.locals.t ? res.locals.t('COMPOSE') : 'Compose';
        res.render('pages/utility/compose', {
            title: title,
            navigation: { main: 'Apps', page: 'Compose', link: '/compose' }
        });
    }

    // ==========================================
    // Language Management
    // ==========================================

    async languages(req, res) {
        const title = res.locals.t ? res.locals.t('LANGUAGES') : 'Languages';
        const languages = await Language.find().sort({ isDefault: -1, title: 1 });

        const flatLanguages = languages.map(lang => {
            const flat = flattenStrings(lang.strings || {});
            return {
                _id: lang._id,
                code: lang.code,
                title: lang.title,
                flag: lang.flag,
                isDefault: lang.isDefault,
                updatedAt: lang.updatedAt,
                flatStringCount: Object.keys(flat).length
            };
        });

        res.render('pages/languages', {
            title: title,
            languages: flatLanguages,
            navigation: { main: 'Settings', page: 'Languages', link: '/languages' },
            success: req.query.success || null,
            error: req.query.error || null
        });
    }

    async languageAdd(req, res) {
        const title = res.locals.t ? res.locals.t('ADD_LANGUAGE') : 'Add Language';
        res.render('pages/language_form', {
            title: title,
            language: null,
            isEdit: false,
            flatEntries: [],
            navigation: { main: 'Settings', page: 'Add Language', link: '/languages/add' },
            error: req.query.error || null
        });
    }

    async languageAddPost(req, res) {
        try {
            const { code, title, flag, isDefault } = req.body;
            const parsedStrings = buildStringsObject(req.body.stringKeys, req.body.stringValues);

            await Language.create({
                code: code,
                title: title,
                flag: flag || '',
                isDefault: isDefault === 'on' || isDefault === 'true',
                strings: parsedStrings
            });

            res.redirect('/languages?success=' + encodeURIComponent('Language added successfully'));
        } catch (error) {
            const systemLogger = require('../../utils/logger');
            systemLogger.error('Language Add Post Error', error);
            if (error.code === 11000) {
                return res.redirect('/languages/add?error=' + encodeURIComponent('A language with this code already exists'));
            }
            res.redirect('/languages/add?error=' + encodeURIComponent(error.message || 'Failed to add language'));
        }
    }

    async languageEdit(req, res) {
        const title = res.locals.t ? res.locals.t('EDIT_LANGUAGE') : 'Edit Language';
        const language = await Language.findById(req.params.id);

        if (!language) {
            return res.redirect('/languages?error=' + encodeURIComponent('Language not found'));
        }

        const flat = flattenStrings(language.strings || {});
        const flatEntries = Object.entries(flat);

        res.render('pages/language_form', {
            title: title,
            language: language,
            isEdit: true,
            flatEntries: flatEntries,
            navigation: { main: 'Settings', page: 'Edit Language', link: '/languages/edit/' + language._id },
            error: req.query.error || null
        });
    }

    async languageEditPost(req, res) {
        try {
            const { code, title, flag, isDefault } = req.body;
            const language = await Language.findById(req.params.id);

            if (!language) {
                return res.redirect('/languages?error=' + encodeURIComponent('Language not found'));
            }

            const parsedStrings = buildStringsObject(req.body.stringKeys, req.body.stringValues);

            language.code = code;
            language.title = title;
            language.flag = flag || '';
            language.isDefault = isDefault === 'on' || isDefault === 'true';
            language.strings = parsedStrings;
            language.markModified('strings');
            await language.save();

            res.redirect('/languages?success=' + encodeURIComponent('Language updated successfully'));
        } catch (error) {
            const systemLogger = require('../../utils/logger');
            systemLogger.error('Language Edit Post Error', error);
            if (error.code === 11000) {
                return res.redirect('/languages/edit/' + req.params.id + '?error=' + encodeURIComponent('A language with this code already exists'));
            }
            res.redirect('/languages/edit/' + req.params.id + '?error=' + encodeURIComponent(error.message || 'Failed to update language'));
        }
    }

    async languageDelete(req, res) {
        try {
            const language = await Language.findById(req.params.id);

            if (!language) {
                return res.redirect('/languages?error=' + encodeURIComponent('Language not found'));
            }

            if (language.isDefault) {
                return res.redirect('/languages?error=' + encodeURIComponent('Cannot delete the default language'));
            }

            await Language.findByIdAndDelete(req.params.id);
            res.redirect('/languages?success=' + encodeURIComponent('Language deleted successfully'));
        } catch (error) {
            const systemLogger = require('../../utils/logger');
            systemLogger.error('Language Delete Error', error);
            res.redirect('/languages?error=' + encodeURIComponent('Failed to delete language'));
        }
    }
}

module.exports = new DashboardController();
