class ApiError extends Error {
    constructor(status, title, detail, type, code) {
        super(detail);
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.type = type;
        this.code = code;
    }
}

module.exports = ApiError;
