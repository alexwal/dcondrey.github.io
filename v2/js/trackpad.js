Trackpad = function(target) {
    var self = this;

    self.target = target;
    self.value = 0;
    self.easingValue = 0;
    self.dragOffset = 0;
    self.dragging;
    self.speed = 0;
    self.prevPosition = 0;
    self.valueY = 0;
    self.easingValueY = 0;
    self.dragOffsetY = 0;
    self.speedY = 0;
    self.prevPositionY = 0;

    $(self.target).mousedown($.proxy(self.onMouseDown, self));
    self.target.onmousewheel = $.proxy(self.onMouseWheel, self);
    self.target.ontouchstart = $.proxy(self.onTouchStart, self);
    $(document).keydown($.proxy(self.onArrow, self));
};

Trackpad.constructor = Trackpad;

Trackpad.prototype.unlock = function() {
    var self = this;

    self.locked = false;
    self.speed = 0;
    self.easingValue = self.value;

    self.target.focus();
};
Trackpad.prototype.lock = function() {
    this.locked = true;
};
Trackpad.prototype.update = function() {
    var self = this;

    self.value = self.easingValue;
    self.valueY = self.easingValueY;

    if (self.dragging) {
        var newSpeed = self.easingValue - self.prevPosition;
        newSpeed *= 0.7;
        self.speed += (newSpeed - self.speed) * 0.5;
        self.prevPosition = self.easingValue;
        var newSpeedY = self.easingValueY - self.prevPositionY;
        newSpeedY *= 0.7;
        self.speedY += (newSpeedY - self.speedY) * 0.5;
        self.prevPositionY = self.easingValueY;
    } else {
        self.speed *= 0.95;
        self.easingValue += self.speed;
        self.speedY *= 0.95;
        self.easingValueY += self.speedY;
    }
};
Trackpad.prototype.onArrow = function(event) {
    if (event.keyCode == 38) {
        this.speed = 4;
        return false;
    } else if (event.keyCode == 40) {
        this.speed -= 4;
        return false;
    }
};
Trackpad.prototype.setPosition = function(value, valueY) {
    var self = this;
    self.value = self.easingValue = value;
    self.valueY = self.easingValueY = valueY;
};
Trackpad.prototype.onMouseWheel = function(event) {
    var self = this;
    util.preventDefault(event);
    event.returnValue = false;
    // if (this.locked) {
    //     return;
    // }
    self.speed = event.wheelDeltaX * 0.15;
    self.speedY = event.wheelDeltaY * 0.15;
};
Trackpad.prototype.startDrag = function(newPosition, newPositionY) {
    var self = this;

    if (self.locked) {
        return;
    }
    self.dragging = true;
    self.dragOffset = newPosition - self.value;
    self.dragOffsetY = newPositionY - self.valueY;
};
Trackpad.prototype.endDrag = function(newPosition) {
    var self = this;

    if (self.locked) {
        return;
    }
    self.dragging = false;
};
Trackpad.prototype.updateDrag = function(newPositionX, newPositionY) {
    var self = this;

    if (self.locked) {
        return;
    }
    self.easingValue = newPositionX - self.dragOffset;
    self.easingValueY = newPositionY - self.dragOffsetY;
};
Trackpad.prototype.onMouseDown = function(event) {
    util.preventDefault(event);
    event.returnValue = false;
    var self = this;
    $(document).mousemove($.proxy(self.onMouseMove, self));
    $(document).mouseup($.proxy(self.onMouseUp, self));
    self.startDrag(event.pageX, event.pageY);
};
Trackpad.prototype.onMouseMove = function(event) {
    util.preventDefault(event);
    this.updateDrag(event.pageX, event.pageY);
};
Trackpad.prototype.onMouseUp = function(event) {
    var self = this;
    $(document).unbind("mousemove", $.proxy(self.onMouseMove, self));
    $(document).unbind("mouseup", $.proxy(self.onMouseUp, self));
    self.endDrag();
};
Trackpad.prototype.onTouchStart = function(event) {
    var self = this;
    self.target.ontouchmove = $.proxy(self.onTouchMove, self);
    self.target.ontouchend = $.proxy(self.onTouchEnd, self);
    self.startDrag(event.touches[0].clientX, event.touches[0].clientY);
};
Trackpad.prototype.onTouchMove = function(event) {
    util.preventDefault(event);
    this.updateDrag(event.touches[0].clientX, event.touches[0].clientY);
};
Trackpad.prototype.onTouchEnd = function() {
    var self = this;
    self.target.ontouchmove = null;
    self.target.ontouchend = null;
    self.endDrag();
};