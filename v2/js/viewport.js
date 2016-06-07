var Viewport = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;

    self.topLeft = {
        x: 0,
        y: 0
    };
    self.topRight = {
        x: 0,
        y: 0
    };
    self.bottomRight = {
        x: 0,
        y: 0
    };
    self.bottomLeft = {
        x: 0,
        y: 0
    };
    self.topLeftFrame = {
        x: 0,
        y: 0
    };
    self.topRightFrame = {
        x: 0,
        y: 0
    };
    self.bottomRightFrame = {
        x: 0,
        y: 0
    };
    self.bottomLeftFrame = {
        x: 0,
        y: 0
    };
    self.alpha = 1;
    self.imageAlpha = 1;
};

Viewport.prototype.render = function(context) {
    var self = this;

    if (!self.card) {
        return;
    }
    context.save();

    context.translate(self.width / 2, self.height / 2);
    context.globalAlpha = 1;
    context.fillStyle = self.color;
    context.beginPath();
    context.moveTo(self.topLeft.x, self.topLeft.y);
    context.lineTo(self.topRight.x, self.topRight.y);
    context.lineTo(self.bottomRight.x, self.bottomRight.y);
    context.lineTo(self.bottomLeft.x, self.bottomLeft.y);
    context.closePath();
    context.fill();

    var centerPointX = (self.topLeft.x + self.topRight.x + self.bottomRight.x + self.bottomLeft.x) / 4;
    var centerPointY = (self.topLeft.y + self.topRight.y + self.bottomRight.y + self.bottomLeft.y) / 4;
    var averageWidth = self.topRight.x - self.topLeft.x;
    var averageWidth2 = self.bottomRight.x - self.bottomLeft.x;
    averageWidth3 = averageWidth < averageWidth2 ? averageWidth : averageWidth2;
    var averageHeight = self.topLeft.y - self.bottomLeft.y;
    var averageHeight2 = self.topRight.y - self.bottomRight.y;
    averageHeight3 = averageHeight > averageHeight2 ? averageHeight : averageHeight2;
    var image = self.card.image;

    if (image) {
        var sizeX = averageWidth3 / 300 * image.width;
        var sizeY = averageHeight3 / 300 * image.height;
        if (sizeX < 0) {
            sizeX *= -1;
        }
        if (sizeY < 0) {
            sizeY *= -1;
        }
        var av1 = averageWidth2 / averageWidth;
        var av1_ = averageWidth / averageWidth2;
        av1 = av1 > av1_ ? av1 : av1_;
        var av2 = averageHeight / averageHeight2;
        var av2_ = averageHeight2 / averageHeight;
        av2 = av2 > av2_ ? av2 : av2_;
        context.globalAlpha = 0;
        context.drawImage(image, centerPointX - sizeX / 2, centerPointY - sizeY / 2, sizeX, sizeY);
    }
    context.restore();
};
Viewport.prototype.resize = function(width, height) {
    var self = this;

    self.width = width;
    self.height = height;
};

Viewport.prototype.showCard = function(card) {
    console.log('showcard');
    var self = this;

    self.card = card;
    self.color = card.color;
    self.alpha = 1;
    self.imageAlpha = 1;

    var fbColorSplit = util.hexToRgb(card.color);
    fbColorSplit[0] = Math.floor(fbColorSplit[0] * 0.7);
    fbColorSplit[1] = Math.floor(fbColorSplit[1] * 0.7);
    fbColorSplit[2] = Math.floor(fbColorSplit[2] * 0.7);
    self.fbColor = util.RGBtoHEX(fbColorSplit);
    self.card.fbColor = self.fbColor;

    TweenLite.to(self.topLeft, 0.5, {
        x: -300,
        y: -300,
        ease: Back.easeOut
    });
    TweenLite.to(self.topRight, 0.5, {
        x: 300,
        y: -300,
        ease: Back.easeOut
    });
    TweenLite.to(self.bottomRight, 0.5, {
        x: 300,
        y: 300,
        ease: Back.easeOut,
        onComplete: self.onSquareComplete.bind(self)
    });
    TweenLite.to(self.bottomLeft, 0.5, {
        x: -300,
        y: 300,
        ease: Back.easeOut,
        onComplete: onViewportShown.bind(self)
    });
    TweenLite.to(self, 0.5, {
        ease: Sine.easeOut
    });
    TweenLite.to(self, 0.25, {
        imageAlpha: 0,
        ease: Sine.easeOut
    });
};

Viewport.prototype.hide = function() {
    var self = this;

    var speed = 0.3;
    TweenLite.to(self, speed, {
        imageAlpha: 0,
        ease: Sine.easeOut
    });
    TweenLite.to(self.topLeft, speed, {
        x: -300,
        y: -300,
        ease: Back.easeOut
    });
    TweenLite.to(self.topRight, speed, {
        x: -0,
        y: -300,
        ease: Back.easeOut
    });
    TweenLite.to(self.bottomRight, speed, {
        x: -0,
        y: -0,
        ease: Back.easeOut
    });
    TweenLite.to(self.bottomLeft, speed, {
        x: -300,
        y: -0,
        ease: Back.easeOut,
        onComplete: self.onHidden.bind(self)
    });
};

Viewport.prototype.onSquareComplete = function() {
    console.log('onsquarecomplete');
    if (util.isIpad) {
        setTimeout(onSquareReady.bind(this), 400);
    } else {
        onSquareReady();
    }
};

Viewport.prototype.onHidden = function() {
    this.card = null;
    onViewportHidden();
};
