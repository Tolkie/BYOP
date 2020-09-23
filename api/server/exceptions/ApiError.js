class ApiError extends Error {
    constructor(status, message) {
        super(message);

        this.name = this.constructor.name;
        this.status = status;
    }
    statusCode() {
        return this.status;
    }
}

module.exports = ApiError;
