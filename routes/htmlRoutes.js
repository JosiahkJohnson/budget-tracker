//creating our home page for our PWA
const path = require("path");

function webPath(app){
    app.get("*", function(req, res){
        res.sendFile(path.join(__dirname, "../public/index.html"));
    });
};

module.exports = webPath;