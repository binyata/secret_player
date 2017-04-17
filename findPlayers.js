chrome.tabs.query({}, function(tabs) {
    getWebPlayers(tabs).then(function(getWebTabs) {
        generateDynamicWebPlayers(getWebTabs)
            .then(function(successfulfile) {
                console.log("yay");
            }, function(msg) {
                console.log("Not loading application properly.");
            });
    });
});

function getWebPlayers(tabs) {
    return new Promise(function(fulfill, reject) {
        var webplayerurl = [];
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf('https://www.youtube.com/watch?') >= 0) {
                webplayerurl.push(tabs[i]);
            }
        }
        var msg = "There were no YouTube webplayers found.";
        var response = webplayerurl;
        if (response.length < 1) {
            reject(msg);
            document.getElementById("players").innerHTML = msg;
        }
        fulfill(response);
    });
}

function generateDynamicWebPlayers(tabs) {
    generateYoutubePlayers(tabs);
}

function executeButton(passedtabid, actionTask, resetUrl) {
    inject_file_executescript(passedtabid, 'content_script.js').then(function(resp) {
        return inject_code_executescript(passedtabid, actionTask, resetUrl);
    }).then(function(successfulfile) {
        console.log("yay");
    }, function(msg) {
        console.log("Failing to click player button", msg);
    });
}

function inject_code_executescript(passedtabid, actionTask, resetUrl) {

    return new Promise(function(fulfill, reject) {
        var getText = Array();
        var code;
        if (actionTask === 'play') {
            code = {
                code: "document.getElementsByClassName('ytp-play-button ytp-button')[0].click();"
            };
        } else if (actionTask === 'reset') {
            code = {
                code: "window.location.href = '" + resetUrl + "&feature=youtu.be&t=0s';"
            };
            console.log(code);
        } else {
            console.log('cannot recognize button');
        }
        try {
            chrome.tabs.executeScript(passedtabid, code, function(result) {
                console.log(result);
                var successfulfile = 'Success';
                fulfill(successfulfile);
            });
        } catch (err) {
            reject(err.message);
        }

    });
}

function inject_file_executescript(passedtabid, codefile) {

    return new Promise(function(fulfill, reject) {
        var getText = Array();
        try {
            chrome.tabs.executeScript(passedtabid, {
                file: codefile
            }, function(result) {
                console.log(result);

                var successfulfile = 'Success';
                fulfill(successfulfile);

            });

        } catch (err) {
            reject(err.message);
        }

    });

}

function generateYoutubePlayers(tabs) {
    // role = menuitemcheckbox   aria-checked = true
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url.indexOf('&') > -1) {
            var resetUrl = tabs[i].url.split('&')[0];
        } else {
            var resetUrl = tabs[i].url;
        }

        var dynamicdiv = document.createElement("div");
        var buttondiv = document.createElement("div");
        var dynamicTitleName = document.createElement("span");
        var dynamicButtonPlay = document.createElement("input");
        var dynamicButtonReset = document.createElement("input");
        dynamicdiv.id = "dynamicdiv" + i;
        dynamicdiv.className = "dynamicdivClass";
        buttondiv.id = "buttondiv" + i;
        buttondiv.className = "playerButtons";
        dynamicTitleName.id = "dynamicTitleName" + i;
        dynamicTitleName.innerHTML = tabs[i].title.substring(0, 60);
        dynamicButtonReset.id = "dynamicButtonReset" + i;
        dynamicButtonReset.type = "button";
        dynamicButtonReset.name = tabs[i].id + " " + resetUrl;
        dynamicButtonReset.className = "playerButtons";
        dynamicButtonReset.value = "Reset";
        dynamicButtonPlay.id = "dynamicButtonPlay" + i;
        dynamicButtonPlay.type = "button";
        dynamicButtonPlay.name = tabs[i].id + " " + resetUrl;
        dynamicButtonPlay.className = "playerButtons";
        dynamicButtonPlay.value = "Play";
        document.getElementById("players").appendChild(dynamicdiv);
        document.getElementById(dynamicdiv.id).appendChild(dynamicTitleName);
        document.getElementById(dynamicdiv.id).appendChild(buttondiv);
        document.getElementById(buttondiv.id).appendChild(dynamicButtonReset);
        document.getElementById(buttondiv.id).appendChild(dynamicButtonPlay);

        document.getElementById("dynamicButtonReset" + i).addEventListener('click', function(e) {
            var gatherTab = e.target.name.split(" ")[0];
            var gatherURL = e.target.name.split(" ")[1];
            executeButton(parseInt(gatherTab), 'reset', gatherURL);
        });
        document.getElementById("dynamicButtonPlay" + i).addEventListener('click', function(e) {
            var gatherTab = e.target.name.split(" ")[0];
            executeButton(parseInt(gatherTab), 'play');
        });
    }
}