
Date.now = Date.now || function() {
    return +new Date;
};

Time = function() {
    this.DELTA_TIME = 1;
    this.lastTime = Date.now();
    this.frames = 0;
    this.speed = 1;
};

Time.constructor = Time;
Time.prototype.update = function() {
    this.frames++;
    var time = Date.now();
    this.frames = 0;
    var currentTime = time;
    var passedTime = currentTime - this.lastTime;
    this.DELTA_TIME = passedTime * 0.06;
    this.DELTA_TIME *= this.speed;
    if (this.DELTA_TIME > 2.3) {
        this.DELTA_TIME = 2.3;
    }
    this.lastTime = currentTime;
};

AssetLoader = function() {
    this.images = [];
    this.total = 0;
    this.position = 0;
    this.onLoadComplete;
    this.onProgress;
};

AssetLoader.constructor = AssetLoader;
AssetLoader.prototype.addImages = function(images) {
    for (var i = 0; i < images.length; i++) {
        var imageToLoad = new Image;
        imageToLoad.srcToLoad = images[i];
        this.images.push(imageToLoad);
    }
    this.total = this.images.length;
};

AssetLoader.prototype.load = function() {
    console.log("LOAD START");
    this.position = 0;
    this.loadNext();
};

AssetLoader.prototype.loadNext = function() {
    var imageToLoad = this.images[this.position];
    imageToLoad.src = imageToLoad.srcToLoad;
};

GridButton = function(framesIds) {
    this.framesIds = framesIds;
    this.frames = [];
    this.view = document.createElement("div");
    this.view.style.position = "absolute";
    for (var i = 0; i < framesIds.length; i++) {
        var image = new Image;
        image.src = REMOTE_PATH + framesIds[i];
        this.frames.push(image);
    }
    this.currentframe = 0;
    this.speed = 0.2;
    this.time = new Time;
};

GridButton.constructor = GridButton;
GridButton.prototype.play = function() {};
GridButton.prototype.getNextImage = function() {
    this.time.update();
    this.currentframe += this.time.DELTA_TIME * this.speed * 2;
    var actualFrame = Math.floor(this.currentframe);
    return this.frames[actualFrame % this.frames.length];
};