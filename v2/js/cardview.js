
Cardview = function() {
    //var soundIds = ["NUwhoosh1", "NUwhoosh2", "NUwhoosh3"];
    this.count = 0;
    this.frame = 0;
    this.view = document.createElement("div");

    this.view.style.position = "absolute";
    // this.view.setAttribute("aria-hidden", true);
    // this.view.setAttribute("aria-labelledby", "card-title")
    // this.view.setAttribute("aria-describedby", "card-description");
    // this.view.setAttribute("role", "dialog");

    util.setAttributes(this.view, {
        "class": "cardView",
        "aria-hidden": "true",
        "aria-labelledby": "card-title",
        "aria-describedby": "card-description",
        "role":"dialog"
    });

    this.div = document.createElement("div");

    this.div.width = 200;
    this.div.height = 200;

    this.view.style.width = 200 + "px";
    this.view.style.height = 200 + "px";
    document.body.appendChild(this.view);

    this.gesturepad = new Gesturepad(this.view);

    //this.gesturepad.onSwipe = this.onSwipe.bind(this);
    this.gesturepad.onClose = this.closePressed.bind(this);

    this.closeButton = new Image;

    if (util.isIpad) {
        this.closeButton.className = "closeButton";
        this.closeButton.src = REMOTE_PATH + "img/closeButton.png";
    } else {
        this.closeButton.className = "closeButtonSmall";
        this.closeButton.src = REMOTE_PATH + "img/closeButtonPetit.png";
    }

    this.cardHeader = document.createElement("h1");
    this.cardHeader.className = "card-title";
    this.cardParagraph = document.createElement("p");
    this.cardParagraph.className = "card-description";
    this.cardFooter = document.createElement("footer");

    this.view.appendChild(this.cardHeader);
    this.view.appendChild(this.cardParagraph);
    this.view.appendChild(this.cardFooter);

    this.view.appendChild(this.closeButton);

    $(this.closeButton).bind("click", $.proxy(this.closePressed, this));
    $(this.closeButton).bind("touchstart", $.proxy(this.closePressed, this));

    this.isOpen = false;
};
Cardview.constructor = Cardview;

Cardview.prototype.tellPressed = function(event) {
    util.preventDefault(event);

    if (!this.isOpen) {
        return;
    }

    this.buttonTouch = true;
    this.isOpen = false;

    $(this.view).fadeOut();
    this.gesturepad.enable();
    this.card = null;
};

Cardview.prototype.closePressed = function(event) {
    util.preventDefault(event);

    if (!this.isOpen) {
        return;
    }

    if (this.buttonTouch) {
        this.buttonTouch = false;
        return;
    }
    //SOUNDS.clickClose.play();
    this.isOpen = false;
    if (this.onClosePressed) {
        this.onClosePressed();
    }

    $(this.view).fadeOut();
    this.gesturepad.disable();
    this.card = null;
};

Cardview.prototype.show = function(card) {
    this.isOpen = true;

    this.cardHeader.innerHTML = card.copy;
    this.cardParagraph.innerHTML = card.story;
    this.cardFooter.innerHTML = "<a href='http://" + card.url + "' target='_blank'>" + card.url + "</a>";
    this.cardHeader.style.color = this.cardParagraph.style.color = card.textColor1 || "#FFFFFF";
    this.cardFooter.style.color = card.textColor2 || "#FFFFFF";

    this.hasLoaded = false;

    this.card = card;

    this.alpha = 0;

    $(this.view).fadeIn();
};