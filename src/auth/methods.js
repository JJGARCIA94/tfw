const bcrypt = require('bcrypt-nodejs');

export const encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const comparePassword = function (passwordToCompare, password) {
    return bcrypt.compareSync(passwordToCompare, password);
};