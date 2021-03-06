﻿const connection = new signalR.HubConnection("/chathub");

function populateLayout(layoutId) {
    connection.invoke("GetLayout", layoutId).catch(err => showErr(err));
}

function populateFirstLayout() {
    connection.invoke("InitializeGui").catch(err => showErr(err));
}

connection.on("ReceiveLayout", (layout) => {
    console.log('Receiving layout : ' + layout);
    itemCount = 0;
    $("#layoutDiv").empty();
    $.each(layout.items, function (index, items) {
        var icon = items.icon;
        var title = items.text;
        $("#layoutDiv").append('<div class="col-lg-3 col-md-4 col-xs-6 layoutItemContainer"><a href="#" onclick="doAction(\'' + layout.layoutId + '\',\'' + itemCount + '\');return false" class="d-block mb-4"><img class="img-fluid img-thumbnail" src="/icons/' + icon + '" alt=""><div class="title bottom">' + title + '</div></a></div>');
        itemCount++;
    });
});







connection.on("ReceiveLayoutHeadings", (layouts) => {
    console.log("List of layouts updated");
    var layoutList = $('#layoutList');
    layoutList.empty();
    for (var key in layouts) {
        if (layouts.hasOwnProperty(key)) {
            // check if the property/key is defined in the object itself, not in parent

            const title = layouts[key];
            const id = key;
            const listItem = $(`<li class="nav-item"><a class="nav-link" href="#"><span>${title}</span></a></li>`);
            console.log(key);

            listItem.find("a").click(function (event) {
                location.hash = id;
                populateLayout(id);
                event.preventDefault();
                event.stopPropagation();
            });
            layoutList.append(listItem);
        }
    }

});



connection.on("ChangeImage", (id, actionId, imgUrl) => {
    actionId = actionId + 1;
    if (isCurrentLayout(id)) {
        console.log(`updating icon ${actionId} layout for ${id}`);
        $(`#layoutDiv div:nth-child(${actionId}) a img`)[0].src = `/icons/${imgUrl}`;
    } else {
        console.log(`not updating icon ${actionId} you're on the wrong layout for ${id}`);
    }
});


function doAction(layoutIndex, itemIndex) {
    connection.invoke("DoAction", layoutIndex, itemIndex).catch(err => showErr(err));
}




function showErr(msg) {
    const listItem = document.createElement("li");
    listItem.setAttribute("style", "color: red");
    listItem.innerText = msg.toString();
    document.getElementById("messages").appendChild(listItem);
}


function guiStarted() {
    console.log("Gui Started");
    populateFirstLayout();
}

connection.start().catch(err => showErr(err));




var checkForConnection = setInterval(function () {
    console.log("Waiting to connect to Server.");
    if (connection.connection.connectionState === 1) {
        guiStarted();
        clearInterval(checkForConnection);
    }
}, 500);