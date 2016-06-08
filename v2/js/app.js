$.support.cors = true;

$(window).ready(onReady);

function onReady() {
    IS_IE8 = false; // !Modernizr.canvas
    $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
    //siteTime = new Time;
    last = 0;
    loaded = false;
    resizeCount = 0;

    if (!model.dimensions) {

        model.dimensions = [Math.floor(Math.random() * 15) + 5, Math.floor(Math.random() * 10) + 5];
        console.log(model.dimensions);
    }

    init();
}

// function load() {
//     loaderScreen = new LoaderScreen;
//     loaderScreen.onComplete = init;
//     document.body.appendChild(loaderScreen.view);
//     onResize();
//     $(window).resize(onResize);
// }

function init() {
    onResize();

    $(window).resize(onResize);
    loaded = true;
    var windowWidth = window.innerWidth || document.documentElement.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;

    /**
     * Draw the canvas
     */
    canvas = document.createElement("canvas");

    util.setAttributes(canvas, {
        "aria-hidden": "true",
        "width": windowWidth,
        "height": windowHeight,
        "tabindex": "0",
        "aria-pressed": "false",
        "role": "Application"
    });

    context = canvas.getContext("2d");
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";

    document.body.appendChild(canvas);

    /**
     * Animate display canvas
     */
    canvas.style.display = "none";

    $(canvas).fadeIn("slow");

    util.setAttributes(canvas, {
        "aria-hidden": "false",
    });


    /**
     * Add event listeners to canvas
     */
    $(canvas).mousedown(onMouseDown);
    $(canvas).mouseup(onMouseUp);
    $(canvas).mousemove(onMouseMove);
    $(canvas).bind("touchstart", onTouchStart);
    $(canvas).bind("touchend", onTouchEnd);
    $(canvas).bind("touchmove", onTouchMove);


    grid = new Grid(windowWidth, windowHeight);

    grid.onCardSelected = onCardSelected;
    trackpad = new Trackpad(canvas);
    viewport = new Viewport(windowWidth, windowHeight);

    cardview = new Cardview;
    cardview.onClosePressed = hideCard;

    browseMode = false;
    pauseGridRender = false;
    onResize();
    resizeCount = 19;
    trackpad.lock();

    var start = model.layout.indexOf(0);
    var layoutWidth = model.dimensions[0];
    var startX = -2;
    var startY = -2;

    trackpad.setPosition(windowWidth / 2 + startX * 300 + 300 / 2, windowHeight / 2 + startY * 300);
    grid.onStartComplete = onGridStartComplete;
    grid.startIntro();

    requestAnimFrame(update);
}

function onGridStartComplete() {
    var hashString = window.location.hash;
    var id = hashString.split("=")[1];
    var card;

    if (id) {
        for (var i = 0; i < model.content.length; i++) {
            if (id == model.content[i].id) {
                card = model.content[i];
                break;
            }
        }
    }

    if (card) {
        showCard(card);
    } else {
        browseMode = true;
        trackpad.unlock();
        grid.unlock();
    }
}

function update() {
    resizeCount++;

    if (resizeCount == 20) {
        var w = $(window).width();
        var h = $(window).height();
        if (!IS_IE8) {
            canvas.width = w;
            canvas.height = h;
        }
        grid.resize(w, h);
        viewport.resize(w, h);
        cardview.view.style.left = w / 2 + -300 + "px";
        cardview.view.style.top = h / 2 - 300 + "px";

        if (w != this.cacheW && h != this.cacheH) {
            window.scrollTo(0, 0);
        }

        this.cacheW = w;
        this.cacheH = h;
    }

    //siteTime.update();

    if (loaded && browseMode) {
        trackpad.update();
    }

    track.x = trackpad.value;
    track.y = trackpad.valueY;

    if (!pauseGridRender) {
        if (!IS_IE8) {
            grid.render(context);
            viewport.render(context);
        } else {
            grid.render();
        }
    }

    requestAnimFrame(update);
}

function showCard(card) {
    this.card = card;
    browseMode = false;
    viewport.showCard(card);
    trackpad.lock();
    TweenLite.to(trackpad, 0.5, {
        value: card.positionX,
        easingValue: card.positionX,
        valueY: card.positionY,
        easingValueY: card.positionY,
        ease: Sine.easeOut
    });

    grid.centerOnCard();

    if (card.id != "startx") {
        window.location.hash = "card=" + card.id;
    } else {
        window.location.hash = "";
    }
}

function hideCard() {
    pauseGridRender = false;
    viewport.hide();
    window.location.hash = "";
}

function onViewportShown() {
    if (cardview.isOpen) {
        pauseGridRender = true;
    }
    if (!IS_IE8) {
        grid.render(context);
        viewport.render(context);
    }
}

function onSquareReady() {
    console.log('onsquareready');

    cardview.show(card);
}

function onViewportHidden() {
    trackpad.unlock();
    grid.unlock();
    browseMode = true;
}

function onCardSelected(card) {
    console.log('oncardselected');
    console.log(card.story);
    if (card.story === undefined) {
        util.openURL(card.url, card.copy);
        return;
    } else {
        showCard(card);
    }
}

function onSubmitComplete() {
    // submitForm.hide();
    trackpad.unlock();
    grid.unlock();
    browseMode = true;
}

function onResize() {
    resizeCount = 0;
}
mouse = {
    x: 0,
    y: 0
};
track = {
    x: 0,
    y: 0
};
downTarget = {
    x: 0,
    y: 0
};

function onMouseDown(event) {
    util.preventDefault(event);
    downTarget.x = mouse.x;
    downTarget.y = mouse.y;
    if (!browseMode) {
        return;
    }
    grid.down();
}

function onMouseUp(event) {
    util.preventDefault(event);

    if (!browseMode) {
        return;
    }
    grid.up();
}

function onTouchStart(event) {
    util.preventDefault(event);
    mouse.x = event.pageX + document.body.scrollLeft;
    mouse.y = event.pageY + document.body.scrollTop;
    downTarget.x = mouse.x;
    downTarget.y = mouse.y;

    if (!browseMode) {
        return;
    }

    if (!grid.firstTouch) {
        grid.firstTouch = true;
    }
    grid.down();
}

function onTouchEnd(event) {
    util.preventDefault(event);

    if (!browseMode) {
        return;
    }
    grid.up();
}

function onTouchMove(event) {
    util.preventDefault(event);
    mouse.x = event.pageX + document.body.scrollLeft;
    mouse.y = event.pageY + document.body.scrollTop;
    testDidMove();
}

function onMouseMove(event) {
    mouse.x = event.clientX + document.body.scrollLeft;
    mouse.y = event.clientY + document.body.scrollTop;
    testDidMove();
}

function testDidMove() {
    var xdist = mouse.x - downTarget.x;
    var ydist = mouse.y - downTarget.y;
    var dist = xdist * xdist + ydist * ydist;

    if (dist > 30 * 30) {
        grid.didMove = true;
    }
}