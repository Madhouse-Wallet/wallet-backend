module.exports = {
    apps: [
        {
            name: "Store-API",
            script: "./server.js",
            watch: false,
            env_staging: {
                "PORT": process.env.PORT || 6379,
                "NODE_ENV": "development"
            },
            env_production: {
                "PORT": process.env.PORT || 6379,
                "NODE_ENV": "production",
            }
        }
    ]
}