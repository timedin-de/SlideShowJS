var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SlideShow_prefix, _SlideShow_currentPage, _SlideShow_dragging, _SlideShow_dragCurrentPos, _SlideShow_dragStartPos, _SlideShow_dragLastOffset;
var Direction;
(function (Direction) {
    Direction["Horizontal"] = "hor";
    Direction["Vertical"] = "ver";
})(Direction || (Direction = {}));
;
class SlideShow {
    constructor(targetSelector, direction) {
        _SlideShow_prefix.set(this, "[SlideShow]: ");
        _SlideShow_currentPage.set(this, void 0);
        _SlideShow_dragging.set(this, false);
        _SlideShow_dragCurrentPos.set(this, 0);
        _SlideShow_dragStartPos.set(this, 0);
        _SlideShow_dragLastOffset.set(this, 0);
        this.isPlaying = true;
        __classPrivateFieldSet(this, _SlideShow_currentPage, 0, "f");
        this.contentLength = 0;
        var targets = document.querySelectorAll(targetSelector);
        if (targets.length !== 1) {
            throw new Error(__classPrivateFieldGet(this, _SlideShow_prefix, "f") + "Target selector got " + targets.length + " Targets instead of 1!");
        }
        this.target = targets[0];
        if (direction == Direction.Horizontal || direction == Direction.Vertical) {
            this.direction = direction;
        }
        else {
            throw new Error(__classPrivateFieldGet(this, _SlideShow_prefix, "f") + "Invalid direction. Got " + direction + ".");
        }
        if (document.currentScript != undefined) {
            document.currentScript.remove();
        }
        var width = (this.width = this.target.offsetWidth) + "px";
        var height = (this.height = this.target.offsetHeight) + "px";
        //Controlls
        this.target.controlls;
        this.target.controlls = document.createElement("div");
        this.target.controlls.className = "slide-controlls";
        this.target.appendChild(this.target.controlls);
        var assetsPath = "/content/photos/assets/";
        var y = document.createElement("a");
        var img = document.createElement("img");
        img.alt = "Play/Pause";
        img.src = assetsPath + "pause.png";
        img.className = "slide-playPause";
        y.appendChild(img);
        y.addEventListener("click", this.toggleClick(this));
        //y.setAttribute("onclick","window.slideshows["+this.slideshowIndex+"].toggle();");
        this.target.controlls.appendChild(y);
        y = document.createElement("a");
        y.className = "slideShow-controllBack";
        img = document.createElement("img");
        img.alt = "Previous";
        img.src = assetsPath + "back.png";
        y.appendChild(img);
        y.addEventListener("click", this.backClick(this));
        //y.setAttribute("onclick", "window.slideshows["+this.slideshowIndex+"].pause();"+ "window.slideshows["+this.slideshowIndex+"].goto(window.slideshows["+this.slideshowIndex+"].currentPage-1);");
        this.target.controlls.appendChild(y);
        y = document.createElement("a");
        y.className = "slideShow-controllForw";
        img = document.createElement("img");
        img.alt = "Next";
        img.src = assetsPath + "forw.png";
        y.appendChild(img);
        y.addEventListener("click", this.forwClick(this));
        //y.setAttribute("onclick", "window.slideshows["+this.slideshowIndex+"].pause();"+"window.slideshows["+this.slideshowIndex+"].goto(window.slideshows["+this.slideshowIndex+"].currentPage+1);");
        this.target.controlls.appendChild(y);
        //Move all content to movement wrapper
        this.target.contentMoveWrapper = document.createElement("div");
        this.target.contentMoveWrapper.className = "content-mov-wrapper";
        this.target.contentMoveWrapper.style.left = "0px";
        this.target.contentMoveWrapper.style.top = "0px";
        var contentElems = this.target.querySelectorAll(".content");
        this.contentLength = contentElems.length;
        for (const elem of contentElems) {
            elem.style.width = width;
            elem.style.height = height;
            this.target.contentMoveWrapper.appendChild(elem);
        }
        this.target.appendChild(this.target.contentMoveWrapper);
        if (this.direction == Direction.Horizontal) {
            this.target.contentMoveWrapper.style.flexWrap = "nowrap";
        }
        else {
            this.target.classList.add("vertical");
            this.target.contentMoveWrapper.style.flexWrap = "wrap";
        }
        document.querySelectorAll(".content").forEach(function (elem) {
            elem.addEventListener("load", function (e) {
                e.target.setAttribute("loaded", "true");
                console.log(e.target);
            });
        });
        window.addEventListener("resize", this.resize(this));
        //Dragging Setup
        this.target.addEventListener("touchmove", this.mousemove(this));
        this.target.addEventListener("mousemove", this.mousemove(this));
        this.target.addEventListener("touchstart", this.mousedown(this));
        this.target.addEventListener("mousedown", this.mousedown(this));
        this.target.addEventListener("touchend", this.mouseup(this));
        this.target.addEventListener("mouseup", this.mouseup(this));
        this.target.addEventListener("mouseleave", this.mouseup(this));
        this.loadAll();
        this.play();
        console.info(__classPrivateFieldGet(this, _SlideShow_prefix, "f") + "Loaded successfully!");
    }
    getCursorPosition(e, direction) {
        return (direction == Direction.Horizontal) ? e instanceof MouseEvent ? e.pageX : e.touches[0].clientX : e instanceof MouseEvent ? e.pageY : e.touches[0].clientY;
    }
    //Event Functions
    mousemove(self) {
        return function (e) {
            if (__classPrivateFieldGet(self, _SlideShow_dragging, "f")) {
                self.pause();
                e.preventDefault();
                __classPrivateFieldSet(self, _SlideShow_dragCurrentPos, self.getCursorPosition(e, self.direction) - __classPrivateFieldGet(self, _SlideShow_dragStartPos, "f"), "f");
                self.target.contentMoveWrapper.style.setProperty((self.direction == Direction.Horizontal) ? "left" : "top", __classPrivateFieldGet(self, _SlideShow_dragLastOffset, "f") + __classPrivateFieldGet(self, _SlideShow_dragCurrentPos, "f") + "px");
            }
        };
    }
    mousedown(self) {
        return function (e) {
            self.target.contentMoveWrapper.classList.add("notransition");
            __classPrivateFieldSet(self, _SlideShow_dragging, true, "f");
            __classPrivateFieldSet(self, _SlideShow_dragStartPos, self.getCursorPosition(e, self.direction), "f");
            __classPrivateFieldSet(self, _SlideShow_dragLastOffset, self.parsePosition(self.target.contentMoveWrapper.style.getPropertyValue(self.direction == Direction.Horizontal ? "left" : "top")), "f");
        };
    }
    mouseup(self) {
        return function () {
            if (__classPrivateFieldGet(self, _SlideShow_dragging, "f")) {
                self.target.contentMoveWrapper.classList.remove("notransition");
                __classPrivateFieldSet(self, _SlideShow_dragging, false, "f");
                if (__classPrivateFieldGet(self, _SlideShow_dragCurrentPos, "f") - (self.direction == Direction.Horizontal ? self.width : self.height) / 3 > 0) {
                    self.goto(__classPrivateFieldGet(self, _SlideShow_currentPage, "f") - 1);
                }
                else if (__classPrivateFieldGet(self, _SlideShow_dragCurrentPos, "f") + (self.direction == Direction.Horizontal ? self.width : self.height) / 3 < 0) {
                    self.goto(__classPrivateFieldGet(self, _SlideShow_currentPage, "f") + 1);
                }
                else {
                    self.target.contentMoveWrapper.style.setProperty((self.direction == Direction.Horizontal) ? "left" : "top", __classPrivateFieldGet(self, _SlideShow_dragLastOffset, "f") + "px");
                }
                __classPrivateFieldSet(self, _SlideShow_dragCurrentPos, 0, "f");
            }
        };
    }
    resize(self) {
        return function () {
            self.update();
        };
    }
    toggleClick(self) {
        return function () {
            self.toggle();
        };
    }
    backClick(self) {
        return function () {
            self.pause();
            self.goto(__classPrivateFieldGet(self, _SlideShow_currentPage, "f") - 1);
        };
    }
    forwClick(self) {
        return function () {
            self.pause();
            self.goto(__classPrivateFieldGet(self, _SlideShow_currentPage, "f") + 1);
        };
    }
    goto(pageNum) {
        //Todo: Infinite scrolling (repeat then move to other end)
        if (pageNum >= this.contentLength) {
            pageNum = 0;
        }
        else if (pageNum < 0) {
            pageNum = this.contentLength - 1;
        }
        else {
        }
        __classPrivateFieldSet(this, _SlideShow_currentPage, pageNum, "f");
        //TODO
        if (this.direction == Direction.Horizontal) {
            this.target.contentMoveWrapper.style.left = (-1 * pageNum * this.width) + "px";
        }
        else {
            this.target.contentMoveWrapper.style.top = -1 * pageNum * this.height + "px";
        }
    }
    pause() {
        var assetsPath = "/content/photos/assets/";
        clearInterval(this.playerInterval);
        this.target.controlls.querySelectorAll(".slide-playPause")[0].src = assetsPath + "play.png";
        this.isPlaying = false;
    }
    play() {
        var assetsPath = "/content/photos/assets/";
        this.playerInterval = window.setInterval(function (self) {
            if ((__classPrivateFieldGet(self, _SlideShow_currentPage, "f") + 1) >= self.contentLength) {
                self.goto(0);
            }
            else {
                self.goto(__classPrivateFieldGet(self, _SlideShow_currentPage, "f") + 1);
            }
        }, 3000, this);
        this.isPlaying = true;
        this.target.controlls.querySelectorAll(".slide-playPause")[0].src = assetsPath + "pause.png";
    }
    toggle() {
        if (this.isPlaying && this.playerInterval != undefined) {
            this.pause();
        }
        else {
            this.play();
        }
    }
    update() {
        var width = this.target.offsetWidth;
        var height = this.target.offsetHeight;
        this.target.style.width = (this.width = width) + "px";
        this.target.style.height = (this.height = height) + "px";
        var contentElems = this.target.contentMoveWrapper.querySelectorAll(".content");
        for (const elem of contentElems) {
            elem.style.width = width + "px";
            elem.style.height = height + "px";
        }
        if (this.direction == Direction.Horizontal) {
            this.target.contentMoveWrapper.style.flexWrap = "nowrap";
        }
        else {
            this.target.contentMoveWrapper.style.flexWrap = "wrap";
        }
        //TOD
        this.target.contentMoveWrapper.style.top = "0px";
        this.target.contentMoveWrapper.style.left = "0px";
        this.goto(__classPrivateFieldGet(this, _SlideShow_currentPage, "f"));
    }
    loadAll() {
        for (const elem of this.target.querySelectorAll(".content img")) {
            elem.src = elem.getAttribute("data-src");
        }
    }
    parsePosition(pos) {
        return parseInt(pos.substring(0, pos.length - 2));
    }
}
_SlideShow_prefix = new WeakMap(), _SlideShow_currentPage = new WeakMap(), _SlideShow_dragging = new WeakMap(), _SlideShow_dragCurrentPos = new WeakMap(), _SlideShow_dragStartPos = new WeakMap(), _SlideShow_dragLastOffset = new WeakMap();
