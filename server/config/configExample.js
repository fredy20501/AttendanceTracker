const config = {
    app : {
        port : 5000
    },
    db : {
        username : "your_username",
        password : "your_password",
        //"Production" = production DB, "Athena" = development DB
        name     : "Production"
    }
};
module.exports = config;