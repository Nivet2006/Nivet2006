let cursor = true, interval=500;

setInterval(() => {
    if(cursor) {
        document.getElementById("cursor").style.opacity = 0;
        cursor = false;
    }
    else {
        document.getElementById("cursor").style.opacity = 1;
        cursor = true;
    }
}, interval);