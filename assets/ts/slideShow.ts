enum Direction {
  Horizontal = "hor",
  Vertical = "ver",
}
interface TargetHTMLElement extends HTMLElement {
  controlls: HTMLElement;
  contentMoveWrapper: HTMLElement;
}

class SlideShow {
  #prefix = "[SlideShow]: ";
  #currentPage: number;
  contentLength: number;
  target: TargetHTMLElement | undefined;
  direction: Direction;
  width: number;
  height: number;
  #dragging = false;
  #dragCurrentPos = 0;
  #dragStartPos = 0;
  #dragLastOffset = 0;
  playerInterval: number | undefined;
  isPlaying = true;
  constructor(targetSelector: string, direction: Direction) {
    this.#currentPage = 0;
    this.contentLength = 0;
    var targets = document.querySelectorAll(targetSelector);
    if (targets.length !== 1) {
      throw new Error(
        this.#prefix +
          "Target selector got " +
          targets.length +
          " Targets instead of 1!"
      );
    }

    this.target = targets[0] as TargetHTMLElement;

    if (direction == Direction.Horizontal || direction == Direction.Vertical) {
      this.direction = direction;
    } else {
      throw new Error(
        this.#prefix + "Invalid direction. Got " + direction + "."
      );
    }
    if (document.currentScript != undefined) {
      document.currentScript.remove();
    }
    var width =
      (this.width = (this.target as TargetHTMLElement).offsetWidth) + "px";
    var height =
      (this.height = (this.target as TargetHTMLElement).offsetHeight) + "px";

    //Controlls
    this.target.controlls;
    this.target.controlls = document.createElement("div") as HTMLElement;
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
    for (const elem of contentElems as NodeListOf<HTMLDivElement>) {
      elem.style.width = width;
      elem.style.height = height;
      this.target.contentMoveWrapper.appendChild(elem);
    }
    this.target.appendChild(this.target.contentMoveWrapper);

    if (this.direction == Direction.Horizontal) {
      this.target.contentMoveWrapper.style.flexWrap = "nowrap";
    } else {
      this.target.classList.add("vertical");
      this.target.contentMoveWrapper.style.flexWrap = "wrap";
    }
    document.querySelectorAll(".content").forEach(function (elem) {
      elem.addEventListener("load", function (e) {
        (e.target as HTMLElement).setAttribute("loaded", "true");
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

    console.info(this.#prefix + "Loaded successfully!");
  }

  getCursorPosition(e: MouseEvent | TouchEvent, direction: Direction) {
    return direction == Direction.Horizontal
      ? e instanceof MouseEvent
        ? e.pageX
        : e.touches[0].clientX
      : e instanceof MouseEvent
      ? e.pageY
      : e.touches[0].clientY;
  }
  //Event Functions
  mousemove(self: SlideShow) {
    return function (e: MouseEvent | TouchEvent) {
      if (self.#dragging) {
        self.pause();
        e.preventDefault();
        self.#dragCurrentPos =
          self.getCursorPosition(e, self.direction) - self.#dragStartPos;
        self.target!.contentMoveWrapper.style.setProperty(
          self.direction == Direction.Horizontal ? "left" : "top",
          self.#dragLastOffset + self.#dragCurrentPos + "px"
        );
      }
    };
  }
  mousedown(self: SlideShow) {
    return function (e: MouseEvent | TouchEvent) {
      self.target!.contentMoveWrapper.classList.add("notransition");
      self.#dragging = true;
      self.#dragStartPos = self.getCursorPosition(e, self.direction);
      self.#dragLastOffset = self.parsePosition(
        self.target!.contentMoveWrapper.style.getPropertyValue(
          self.direction == Direction.Horizontal ? "left" : "top"
        )
      );
    };
  }
  mouseup(self: SlideShow) {
    return function () {
      if (self.#dragging) {
        self.target!.contentMoveWrapper.classList.remove("notransition");
        self.#dragging = false;
        if (
          self.#dragCurrentPos -
            (self.direction == Direction.Horizontal
              ? self.width
              : self.height) /
              3 >
          0
        ) {
          self.goto(self.#currentPage - 1);
        } else if (
          self.#dragCurrentPos +
            (self.direction == Direction.Horizontal
              ? self.width
              : self.height) /
              3 <
          0
        ) {
          self.goto(self.#currentPage + 1);
        } else {
          self.target!.contentMoveWrapper.style.setProperty(
            self.direction == Direction.Horizontal ? "left" : "top",
            self.#dragLastOffset + "px"
          );
        }
        self.#dragCurrentPos = 0;
      }
    };
  }
  resize(self: SlideShow) {
    return function () {
      self.update();
    };
  }
  toggleClick(self: SlideShow) {
    return function () {
      self.toggle();
    };
  }
  backClick(self: SlideShow) {
    return function () {
      self.pause();
      self.goto(self.#currentPage - 1);
    };
  }
  forwClick(self: SlideShow) {
    return function () {
      self.pause();
      self.goto(self.#currentPage + 1);
    };
  }

  goto(pageNum: number) {
    //Todo: Infinite scrolling (repeat then move to other end)
    if (pageNum >= this.contentLength) {
      pageNum = 0;
    } else if (pageNum < 0) {
      pageNum = this.contentLength - 1;
    } else {
    }

    this.#currentPage = pageNum;
    //TODO
    if (this.direction == Direction.Horizontal) {
      this.target!.contentMoveWrapper.style.left =
        -1 * pageNum * this.width + "px";
    } else {
      this.target!.contentMoveWrapper.style.top =
        -1 * pageNum * this.height + "px";
    }
  }
  pause() {
    var assetsPath = "/content/photos/assets/";
    clearInterval(this.playerInterval);
    (
      this.target!.controlls.querySelectorAll(
        ".slide-playPause"
      )[0] as HTMLImageElement
    ).src = assetsPath + "play.png";
    this.isPlaying = false;
  }
  play() {
    var assetsPath = "/content/photos/assets/";
    this.playerInterval = window.setInterval(
      function (self: SlideShow) {
        if (self.#currentPage + 1 >= self.contentLength) {
          self.goto(0);
        } else {
          self.goto(self.#currentPage + 1);
        }
      },
      3000,
      this
    );
    this.isPlaying = true;
    (
      this.target!.controlls.querySelectorAll(
        ".slide-playPause"
      )[0] as HTMLImageElement
    ).src = assetsPath + "pause.png";
  }
  toggle() {
    if (this.isPlaying && this.playerInterval != undefined) {
      this.pause();
    } else {
      this.play();
    }
  }
  update() {
    var width = this.target!.offsetWidth;
    var height = this.target!.offsetHeight;
    this.target!.style.width = (this.width = width) + "px";
    this.target!.style.height = (this.height = height) + "px";

    var contentElems =
      this.target!.contentMoveWrapper.querySelectorAll(".content");

    for (const elem of contentElems as NodeListOf<HTMLElement>) {
      elem.style.width = width + "px";
      elem.style.height = height + "px";
    }

    if (this.direction == Direction.Horizontal) {
      this.target!.contentMoveWrapper.style.flexWrap = "nowrap";
    } else {
      this.target!.contentMoveWrapper.style.flexWrap = "wrap";
    }
    //TOD
    this.target!.contentMoveWrapper.style.top = "0px";
    this.target!.contentMoveWrapper.style.left = "0px";

    this.goto(this.#currentPage);
  }

  loadAll() {
    for (const elem of this.target!.querySelectorAll(
      ".content img"
    ) as NodeListOf<HTMLImageElement>) {
      elem.src = elem.getAttribute("data-src")!;
    }
  }
  parsePosition(pos: string) {
    return parseInt(pos.substring(0, pos.length - 2));
  }
}
