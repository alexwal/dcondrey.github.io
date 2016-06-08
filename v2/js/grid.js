Grid = function(width, height) {
    this.padding = 2;
    this.camera = {
        x: 0,
        y: 0
    };
    this.squareWidth = 200;
    this.cardPool = [];
    this.cards = [];
    this.colors = ["#b494bb", "#a2b878", "#af98ad", "#d9d3c5", "#6ca86c", "#aea677", "#4fb4c6", "#80c6e8"];
    this.start = true;
    this.locked = true;
    this.startZoom = 2;
    this.resize(width, height);
    this.zoomRatio = 0;
    this.startFade = 0;
};

Grid.constructor = Grid;

Grid.prototype.resize = function(width, height) {
    this.width = width; // window width
    this.height = height; // window height

    this.gridWidth = Math.ceil(this.width / this.squareWidth) + 2 + this.padding;
    this.gridHeight = Math.ceil(this.height / this.squareWidth) + 2 + this.padding;

    var totalcards = this.gridWidth * this.gridHeight;

    this.odd = this.gridWidth % 2;

    console.log('cards',this.cards);
    for (var i = 0; i < this.cards.length; i++) {

        this.cardPool.push(this.cards[i]);
    }

    this.cards = [];

    for (i = 0; i < totalcards; i++) {
        var card = this.cardPool.pop();

        if (!card) {
            card = {
                //spring: new DoubleSpring,
                alpha: 1,
                color: this.colors[Math.round(Math.random() * 25) % 2],
                image: new Image,
                ratio: 0
            };
        }
        var xpos = i % this.gridWidth;
        var ypos = Math.floor(i / this.gridWidth);

        card.x = card.xHome = xpos;
        card.y = card.yHome = ypos;

        this.cards.push(card);
    }

    this.scale = 1;

    console.log('cards',this.cards);

};

Grid.prototype.startIntro = function() {
    TweenLite.to(this, 2, {
        startZoom: 1,
        ease: Expo.easeInOut,
        onComplete: this.onZoomedOut.bind(this)
    });
    TweenLite.to(this, 0.1, {
        startFade: 1,
        ease: Expo.easeInOut,
        delay: 2,
        onComplete: this.onTransitionFinished
    });
};

Grid.prototype.onZoomedOut = function() {
    this.start = false;
    this.locked = false;
    this.onStartComplete();
};

Grid.prototype.render = function(context) {
    context.save();
    var speedX = (track.x - this.camera.x) * 0.2;
    var speedY = (track.y - this.camera.y) * 0.2;
    var speed = Math.sqrt(speedY * speedY + speedX * speedX).toFixed(2);
    var fakeX = Math.abs(speed);

    if (fakeX > 40) {
        fakeX = 40;
    }

    fakeX /= 40;
    fakeX *= 0.25;

    this.scale += (1 - fakeX - this.scale) * 0.1;

    if (this.start) {
        this.scale = this.startZoom;
        this.camera.x = track.x;
        this.camera.y = track.y;
    } else {
        this.camera.x += speedX;
        this.camera.y += speedY;
    }

    var scaleRatio = (this.scale + (1 - this.scale) * this.zoomRatio).toFixed(2);

    context.translate(this.width / 2, this.height / 2);
    context.scale(scaleRatio, scaleRatio);
    context.translate(-this.squareWidth * (this.padding), -this.squareWidth * 1.5);
    context.translate(Math.floor(-this.width / 2), -Math.floor(this.height / 2));

    var offset = this.squareWidth;
    var totalX = this.squareWidth * this.gridWidth;
    var totalY = this.squareWidth * this.gridHeight;

    var cardobject;

    for (var i = 0; i < this.cards.length; i++) {
        cardobject = this.cards[i];

        var segmentXPosition = cardobject.x * this.squareWidth + this.camera.x;
        var segmentYPosition = cardobject.y * this.squareWidth + this.camera.y;

        var xid = Math.floor(segmentXPosition / totalX);
        xid *= this.gridWidth;
        xid -= cardobject.x;
        var yid = Math.floor(segmentYPosition / totalY);
        yid *= this.gridHeight;
        yid -= cardobject.y;


        if (cardobject.xid != xid || cardobject.yid != yid) {
            var cardnum = Grid.getId(xid, yid);
            var card = model.content[cardnum];
            cardobject.card = card;

            // on hover, zoom scale
            cardobject.scale = cardobject.card.scale || 1;

            cardobject.color = cardobject.card.color;
            cardobject.isStart = false;

            if (xid == -3 && yid == -3) {
                cardobject.isStart = true;
            }

            cardobject.image.src = REMOTE_PATH + cardobject.card.gridImage;
        }

        cardobject.xid = xid;
        cardobject.yid = yid;
        segmentXPosition = segmentXPosition % totalX;

        if (segmentXPosition < 0) {
            segmentXPosition += totalX;
        }

        segmentYPosition = segmentYPosition % totalY;

        if (segmentYPosition < 0) {
            segmentYPosition += totalY;
        }

        cardobject.xReal = segmentXPosition;
        cardobject.yReal = segmentYPosition;
        cardobject.xReals = segmentXPosition + (1 - this.zoomRatio);
        cardobject.yReals = segmentYPosition + (1 - this.zoomRatio);

        context.fillStyle = "black";
        context.globalAlpha = 1;
    }

    for (i = 0; i < this.cards.length; i++) {
        cardobject = this.cards[i];

        if (cardobject.xReal < (this.gridWidth - 1) * this.squareWidth && cardobject.yReal < (this.gridHeight - 1) * this.squareWidth) {
            var topLeft = cardobject;
            var topRight = this.cards[this.gridWidth * (cardobject.y % this.gridHeight) + (cardobject.x + 1) % this.gridWidth];
            var bottomRight = this.cards[this.gridWidth * ((cardobject.y + 1) % this.gridHeight) + (cardobject.x + 1) % this.gridWidth];
            var bottomLeft = this.cards[this.gridWidth * ((cardobject.y + 1) % this.gridHeight) + cardobject.x % this.gridWidth]; {
                context.globalAlpha = 1;

                if (cardobject.isStart) {
                    context.globalAlpha = this.startFade;
                }

                context.fillStyle = cardobject.color;
                context.beginPath();
                context.moveTo(topLeft.xReals - 1, topLeft.yReals - 1);
                context.lineTo(topRight.xReals + 1, topRight.yReals - 1);
                context.lineTo(bottomRight.xReals + 1, bottomRight.yReals + 1);
                context.lineTo(bottomLeft.xReals - 1, bottomLeft.yReals + 1);
                context.closePath();
                context.fill();
            }

            var centercardobjectX = (topLeft.xReals + topRight.xReals + bottomRight.xReals + bottomLeft.xReals) / 4;
            var centercardobjectY = (topLeft.yReals + topRight.yReals + bottomRight.yReals + bottomLeft.yReals) / 4;
            var averageWidth = topRight.xReals - topLeft.xReals;
            var averageWidth2 = bottomRight.xReals - bottomLeft.xReals;
            averageWidth3 = averageWidth < averageWidth2 ? averageWidth : averageWidth2;
            var averageHeight = topLeft.yReals - bottomLeft.yReals;
            var averageHeight2 = topRight.yReals - bottomRight.yReals;
            averageHeight3 = averageHeight > averageHeight2 ? averageHeight : averageHeight2;
            var image = cardobject.image;
            var sizeX = averageWidth3 / this.squareWidth * 200;
            var sizeY = averageHeight3 / this.squareWidth * 200;

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
            context.fillStyle = "#000000";

            if (this.overCell != cardobject) {
                context.globalAlpha = 1;
                if (cardobject.isStart) {
                    context.globalAlpha = this.startFade;
                    if (this.startFade < 1) {
                        sizeX = 200;
                        sizeY = 200;
                    }
                    context.drawImage(image, centercardobjectX - sizeX / 2, centercardobjectY - sizeY / 2, sizeX, sizeY);
                } else {
                    context.drawImage(image, centercardobjectX - sizeX / 2, centercardobjectY - sizeY / 2, sizeX, sizeY);
                }
            }
            context.fillStyle = "#463e40";
        }
    }

    context.restore();
};

Grid.prototype.centerOnCard = function() {
    this.locked = true;
    TweenLite.to(this, 0.4, {
        zoomRatio: 1,
        ease: Cubic.easeIn
    });

    if (this.overCell) {
        this.overCell.ratio = 0;
        this.overCell.count = 0;
        this.overCell.alpha1 = 0;
        this.overCell.alpha2 = 0;
    }
};

Grid.prototype.unlock = function() {
    this.locked = false;
    TweenLite.to(this, 0.2, {
        zoomRatio: 0
    });
};

Grid.prototype.down = function() {
    console.log('grid:down');
    this.overCell = this.hittest();
    this.overCell.down = true;
    this.didMove = false;
    this.overCell.count = 0;
    this.overCell.ratio = 0;
    this.overCell.alpha1 = 0;
    this.overCell.alpha2 = 0;
};

/* Drag up */
Grid.prototype.up = function() {
    if (this.overCell.down) {
        this.overCell.down = false;

        if (!this.didMove) {
            var positionX = this.overCell.xid;
            if (positionX < -this.gridWidth) {
                positionX += this.gridWidth;
            }
            var positionY = this.overCell.yid;

            cardobject = this.overCell;

            var topLeft = cardobject;

            var topRight = this.cards[this.gridWidth * (cardobject.y % this.gridHeight) + (cardobject.x + 1) % this.gridWidth];
            var bottomRight = this.cards[this.gridWidth * ((cardobject.y + 1) % this.gridHeight) + (cardobject.x + 1) % this.gridWidth];
            var bottomLeft = this.cards[this.gridWidth * ((cardobject.y + 1) % this.gridHeight) + cardobject.x % this.gridWidth];
            var offsetX = -this.width / 2 - this.squareWidth * (this.padding);
            var offsetY = -this.height / 2 - this.squareWidth * 1.5;

            this.overCell.card.corners = [{
                x: topLeft.xReals + offsetX,
                y: topLeft.yReals + offsetY
            }, {
                x: topRight.xReals + offsetX,
                y: topRight.yReals + offsetY
            }, {
                x: bottomRight.xReals + offsetX,
                y: bottomRight.yReals + offsetY
            }, {
                x: bottomLeft.xReals + offsetX,
                y: bottomLeft.yReals + offsetY
            }];
            //console.log(positionY);
            this.overCell.card.positionX = (positionX + 2 - 0.5) * this.squareWidth + this.width / 2 - this.squareWidth / 2 + 1;
            this.overCell.card.positionY = (positionY + 1.5 - 0.5) * this.squareWidth + this.height / 2 - this.squareWidth / 2 + 1;
            this.overCell.card.positionX = Math.floor(this.overCell.card.positionX);
            this.overCell.card.positionY = Math.floor(this.overCell.card.positionY);
            if (this.overCell.y === 0) {
                this.overCell.card.positionY -= 2;
            }
            if (this.overCell.x === 0) {
                this.overCell.card.positionX -= 1;
            }
            this.overCell.card.color = cardobject.color;
            this.overCell.card.image = cardobject.image;
            this.onCardSelected(this.overCell.card);
        }
    }
};

/**
 * on CLick
 */
Grid.prototype.hittest = function() {
    document.body.style.cursor = "default";
    if (this.overCell) { // the clicked card
        var cardobject = this.overCell;
        var topLeft = cardobject;
        var topRight = this.cards[this.gridWidth * (cardobject.y % this.gridHeight) + (cardobject.x + 1) % this.gridWidth];
        var bottomRight = this.cards[this.gridWidth * ((cardobject.y + 1) % this.gridHeight) + (cardobject.x + 1) % this.gridWidth];
        var bottomLeft = this.cards[this.gridWidth * ((cardobject.y + 1) % this.gridHeight) + cardobject.x % this.gridWidth];
        var distX = topRight.xReal - cardobject.xReal;
        var distY = bottomRight.yReal - cardobject.yReal;
        var positionX = mouse.x - cardobject.xReal + this.squareWidth * 2;
        var positionY = mouse.y - cardobject.yReal + this.squareWidth * 1.5;
        if (positionX > 0 && positionX < distX && positionY > 0 && positionY < distY + 40) {
            if (cardobject.card.id == "startx") {
                if (positionX > 18 && positionX < distX - 22 && positionY > 195 && positionY < distY + 10) {
                    document.body.style.cursor = "cardobjecter";
                }
            } else {
                if (positionX > 5 && positionX < distX - 5 && positionY > 230 && positionY < distY + 24) {
                    document.body.style.cursor = "cardobjecter";
                }
            }
            return this.overCell;
        }
    }

    var gridPosX = Math.floor((mouse.x - this.camera.x) / this.squareWidth) + 2;
    var gridPosY = Math.floor((mouse.y - this.camera.y + this.squareWidth * 0.5) / this.squareWidth) + 1;

    gridPosX %= this.gridWidth;
    if (gridPosX < 0) {
        gridPosX += this.gridWidth;
    }
    gridPosY %= this.gridHeight;
    if (gridPosY < 0) {
        gridPosY += this.gridHeight;
    }
    return this.cards[gridPosY % this.gridHeight * this.gridWidth + gridPosX];
};

Grid.getId = function(xid, yid) {
    var gridWidth = model.dimensions[0];
    var gridHeight = model.dimensions[1];
    var modX = (xid - 4) % gridWidth;

    if (modX < 0) {
        modX += gridWidth;
    }

    var modY = (yid - 3) % gridHeight;
    if (modY < 0) {
        modY += gridHeight;
    }
    var id = model.layout[modY * gridWidth + modX];
    if (id >= model.content.length) {
        id++;
    }
    var cardnum = id % model.content.length;

    if (yid === 0) {
        if (cardnum < 0) {
            cardnum += model.content.length;
        }
    }
    return cardnum;
};