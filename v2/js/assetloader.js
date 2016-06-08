AssetLoader = function() {
    this.images = [];
    this.total = 0;
    this.position = 0;
};

AssetLoader.constructor = AssetLoader;

AssetLoader.prototype.load = function() {
    console.log("LOAD START");
    this.position = 0;
    this.loadNext();
};

AssetLoader.prototype.addImages = function(images) {
    for (var i = 0; i < images.length; i++) {
        var imageToLoad = new Image;
        imageToLoad.srcToLoad = images[i];
        this.images.push(imageToLoad);
    }
    this.total = this.images.length;
};

AssetLoader.prototype.loadNext = function() {
    var imageToLoad = this.images[this.position];
    imageToLoad.src = imageToLoad.srcToLoad;
};