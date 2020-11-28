const config = {
    app : {
        port : 5000
    },
    db : {
        username : "your_username",
        password : "your_password",
        //"Production" = production DB, "Athena" = development DB
        name     : "Athena"
    }
};
module.exports = config;
