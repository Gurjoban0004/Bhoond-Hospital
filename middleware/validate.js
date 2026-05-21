const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// checks that all required fields exist and aren't empty
function requireFields(fields) {
    return (req, res, next) => {
        const missing = fields.filter(f => !req.body[f] || String(req.body[f]).trim() === '');
        if (missing.length > 0) {
            const err = new Error(`Missing required fields: ${missing.join(', ')}`);
            err.status = 400;
            return next(err);
        }
        next();
    };
}

function validateEmail(req, res, next) {
    const { email } = req.body;
    if (email && !EMAIL_REGEX.test(email)) {
        const err = new Error('Invalid email address.');
        err.status = 400;
        return next(err);
    }
    next();
}

function validatePassword(minLength = 8) {
    return (req, res, next) => {
        const { password } = req.body;
        if (password && password.length < minLength) {
            const err = new Error(`Password must be at least ${minLength} characters.`);
            err.status = 400;
            return next(err);
        }
        next();
    };
}

module.exports = { requireFields, validateEmail, validatePassword };
