
Gesturepad = function(target) {
    console.log('gesturepad', target);

    var self = this;

    self.target = target;
    self.startPoint = {
        x: 0,
        y: 0
    };

    self.endPoint = {
        x: 0,
        y: 0
    };
};

Gesturepad.prototype.enable = function() {
    var self = this;

    $(document).mousedown($.proxy(self.onMouseDown, self));
    $(document).mouseup($.proxy(self.onMouseUp, self));
    $(document).mousemove($.proxy(self.onMouseMove, self));
    $(document).bind("touchstart", $.proxy(self.onMouseDown, self));
    $(document).bind("touchend", $.proxy(self.onMouseUp, self));
    $(document).bind("touchmove", $.proxy(self.onMouseMove, self));
};

Gesturepad.prototype.disable = function() {
    console.log('gesturepad:onmouseup');
    var self = this;

    $(document).unbind("mousedown", $.proxy(self.onMouseDown, self));
    $(document).unbind("mousemove", $.proxy(self.onMouseMove, self));
    $(document).unbind("mouseup", $.proxy(self.onMouseUp, self));
    $(document).unbind("touchstart", $.proxy(self.onMouseDown, self));
    $(document).unbind("touchend", $.proxy(self.onMouseUp, self));
    $(document).unbind("touchmove", $.proxy(self.onMouseMove, self));
};

Gesturepad.prototype.onMouseDown = function(evt) {
    console.log('gesturepad:onmousedown');

    if (evt) {
        evt.preventDefault();
    }

    var self = this;

    var rect = self.target.getBoundingClientRect();

    self.dragging = true;
    self.startPoint.x = evt.pageX - rect.left;
    self.startPoint.y = evt.pageY - rect.top;
    self.endPoint.x = evt.pageX - rect.left;
    self.endPoint.y = evt.pageY - rect.top;
};
Gesturepad.prototype.onMouseUp = function(evt) {
    console.log('gesturepad:onmouseup');

    if (evt) {
        evt.preventDefault();
    }

    var self = this;

    self.dragging = false;

    var rect = self.target.getBoundingClientRect();
    var xdist = self.endPoint.x - self.startPoint.x;
    var ydist = self.endPoint.y - self.startPoint.y;

    if (xdist * xdist + ydist * ydist < 30 * 30) {
        var padding = 40;
        var outside = true;

        if (self.endPoint.x > -padding && self.endPoint.x < 500 + padding) {
            if (self.endPoint.y > -padding && self.endPoint.y < 500 + padding) {
                outside = false;
            }
        }
        if (outside) {
            if (self.onClose) {
                self.onClose();
            }
        }
        return;
    }
    if (Math.abs(xdist) > Math.abs(ydist)) {
        if (xdist < 0) {
            if (self.onSwipe) {
                self.onSwipe("LEFT");
            }
        } else {
            if (self.onSwipe) {
                self.onSwipe("RIGHT");
            }
        }
    } else {
        if (ydist < 0) {
            if (self.onSwipe) {
                self.onSwipe("UP");
            }
        } else {
            if (self.onSwipe) {
                self.onSwipe("DOWN");
            }
        }
    }

    self.startPoint.x = self.endPoint.x;
    self.startPoint.y = self.endPoint.y;
};

Gesturepad.prototype.onMouseMove = function(evt) {
    console.log('gesturepad:onmousemove');

    var self = this;

    var rect = self.target.getBoundingClientRect();
    if (self.dragging) {
        self.endPoint.x = evt.pageX - rect.left;
        self.endPoint.y = evt.pageY - rect.top;
    }
};