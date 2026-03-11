class ApiController {
    index(req, res) {
        res.json({
            status: 200,
            message: 'Welcome to the API System!'
        });
    }
}

module.exports = new ApiController();