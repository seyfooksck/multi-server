const systemLogger = require('../../utils/logger');

class HomeController {
    index(req, res) {
        // systemLogger.info('[HomeController] Locals keys: ' + Object.keys(res.locals).join(', '));
        const title = res.locals.t ? res.locals.t('WELCOME') : 'Welcome';

        res.render('index', {
            title: title,
            message: 'Welcome to the Main System'
        });
    }
}

module.exports = new HomeController();
