"use strict";

let Direction = {
  Horizontal: 'hor',
  Vertical: 'vert'
};
class SlideShow {
  #prefix = "[SlideShow]: "
  #dragging = false;
  #dragStartPos = 0;
  #dragCurrentPos = 0;
  #dragLastOffset = 0; 
  constructor(targetSelector,direction) {
    this.currentPage = 0;
    this.contentLength = 0;
    var targets = document.querySelectorAll(targetSelector);
    if(targets.length !== 1) {
      throw new Error(this.#prefix+"Target selector got " + targets.length + " Targets instead of 1!");
    }
    this.target = targets[0];

    if(direction == Direction.Horizontal || direction == Direction.Vertical) {
        this.direction = direction;
    } else {
      throw new Error(this.#prefix+"Invalid direction. Got " + direction + ".");
    }
    document.currentScript.remove();
    //Todo: Live update when value im instance is changed

    //TODO 
    // this.target.style.maxWidth=(this.width = this.parsePosition(width))+"px";
    // this.target.style.maxHeight=(this.height = this.parsePosition(height))+"px";

    var width=(this.width = this.target.offsetWidth)+"px";
    var height=(this.height = this.target.offsetHeight)+"px";

    //Controlls
    this.target.controlls = document.createElement("div");
    this.target.controlls.className="slide-controlls";
    this.target.appendChild(this.target.controlls);

    var assetsPath = "./assets/"; 
    var y = document.createElement("a");
    var img = document.createElement("img");

    img.alt = "Play/Pause";
    img.src = assetsPath+"pause.png";
    img.className = "slide-playPause";
    y.appendChild(img);
    y.addEventListener("click",this.toggleClick(this));
    //y.setAttribute("onclick","window.slideshows["+this.slideshowIndex+"].toggle();");

    this.target.controlls.appendChild(y);
    
    y = document.createElement("a");
    y.className="slideShow-controllBack"

    img = document.createElement("img");
    img.alt = "Previous";
    img.src = assetsPath+"back.png";
    y.appendChild(img);    
    y.addEventListener("click",this.backClick(this));
    //y.setAttribute("onclick", "window.slideshows["+this.slideshowIndex+"].pause();"+ "window.slideshows["+this.slideshowIndex+"].goto(window.slideshows["+this.slideshowIndex+"].currentPage-1);");
    this.target.controlls.appendChild(y);

    y = document.createElement("a");
    y.className="slideShow-controllForw"

    img = document.createElement("img");

    img.alt = "Next";
    img.src = assetsPath+"forw.png";
    y.appendChild(img);
    y.addEventListener("click",this.forwClick(this));
    //y.setAttribute("onclick", "window.slideshows["+this.slideshowIndex+"].pause();"+"window.slideshows["+this.slideshowIndex+"].goto(window.slideshows["+this.slideshowIndex+"].currentPage+1);");

    this.target.controlls.appendChild(y);


      //Move all content to movement wrapper
      var self = this;
      self.target.contentMoveWrapper = document.createElement("div");
      self.target.contentMoveWrapper.className="content-mov-wrapper"; 
      self.target.contentMoveWrapper.style.left = "0px";
      self.target.contentMoveWrapper.style.top = "0px";
      var contentElems = self.target.querySelectorAll(".content");
      self.contentLength = contentElems.length;
      var a = contentElems.length;

      contentElems.forEach(function(elem,index) {
        elem.style.width=width;
        elem.style.height=height;
        self.target.contentMoveWrapper.appendChild(elem);

      },self.target.contentMoveWrapper);
      self.target.appendChild(self.target.contentMoveWrapper)


    if(this.direction == Direction.Horizontal) {
      this.target.contentMoveWrapper.style.flexWrap="nowrap";
    } else {
      this.target.classList.add("vertical");
      this.target.contentMoveWrapper.style.flexWrap="wrap";
    }

    var loadedElementCount = 0;
    document.querySelectorAll(".content").forEach(function(elem) {
      elem.addEventListener("load",function(e) {
        this.loaded = true;
        console.log(this);
      });
    });


    window.addEventListener("resize",this.resize(this));


    //Dragging Setup

    this.target.addEventListener("touchmove",this.mousemove(this));
    this.target.addEventListener("mousemove",this.mousemove(this));

    this.target.addEventListener("touchstart",this.mousedown(this));
    this.target.addEventListener("mousedown",this.mousedown(this));
    this.target.addEventListener("touchend",this.mouseup(this));
    this.target.addEventListener("mouseup",this.mouseup(this));
    this.target.addEventListener("mouseleave",this.mouseup(this));





    this.loadAll();
    this.play(this);

    console.info(this.#prefix+"Loaded successfully!");
  }


  getCursorPosition(e,direction) {

    return (direction == Direction.Horizontal)?(e.type.includes('mouse') ? e.pageX : e.touches[0].clientX):(e.type.includes('mouse') ? e.pageY : e.touches[0].clientY);

  }
  //Event Functions
  mousemove(self) {
    return function(e) {
      if(self.#dragging) {
        self.pause();
        e.preventDefault();
        self.#dragCurrentPos=self.getCursorPosition(e,self.direction)-self.#dragStartPos;
        self.target.contentMoveWrapper.style.setProperty((self.direction == Direction.Horizontal)?"left":"top",self.#dragLastOffset+self.#dragCurrentPos+"px");
      }
    }
  }
  mousedown(self) {
    return function(e) {
      self.target.contentMoveWrapper.classList.add("notransition");
      self.#dragging=true;
      self.#dragStartPos=self.getCursorPosition(e,self.direction);
      self.#dragLastOffset = self.parsePosition(self.target.contentMoveWrapper.style.getPropertyValue(self.direction == Direction.Horizontal?"left":"top"));
    }
  }
  mouseup(self) {
    return function(e) {
      if(self.#dragging) {
        self.target.contentMoveWrapper.classList.remove("notransition");
        self.#dragging=false;
        if(self.#dragCurrentPos-(self.direction==Direction.Horizontal?self.width:self.height)/3>0) {
          self.goto(self.currentPage-1);
        } else if(self.#dragCurrentPos+(self.direction==Direction.Horizontal?self.width:self.height)/3<0) {
          self.goto(self.currentPage+1)
        } else {
          self.target.contentMoveWrapper.style.setProperty((self.direction == Direction.Horizontal)?"left":"top",self.#dragLastOffset+"px");
        }
        self.#dragCurrentPos=0;
      }
    }
  } 
  resize(self) {
    return function(e) {
      self.update();
    }
  }
  toggleClick(self) {
    return function(e) {
      self.toggle();
    }
  }
  backClick(self) {
    return function(e) {
      self.pause();
      self.goto(self.currentPage-1);
    }
  }
  forwClick(self) {
    return function(e) {
      self.pause();
      self.goto(self.currentPage+1);
    }
  }



  goto(pageNum) {

    //Todo: Infinite scrolling (repeat then move to other end)
    if(pageNum>=this.contentLength) {
      pageNum =0;
    } else if(pageNum<0) {
      pageNum = this.contentLength-1;
    } else {
    }

    this.currentPage = pageNum;
    //TODO
    if(this.direction == Direction.Horizontal) {
      this.target.contentMoveWrapper.style.left=(-1*pageNum*this.width)+"px";
    } else {
      this.target.contentMoveWrapper.style.top=-1*pageNum*this.height+"px";
    }
  }
  pause() {
    clearInterval(this.playerInterval);
    this.target.controlls.querySelectorAll(".slide-playPause")[0].src="play.png";
    this.isPlaying = false;
  }
  play() {
    this.playerInterval = window.setInterval(function(self) {
        if((self.currentPage+1)>=self.contentLength) {
          self.goto(0);
        } else {
          self.goto(self.currentPage+1);
        }
      },3000,this);
      this.isPlaying = true;
      this.target.controlls.querySelectorAll(".slide-playPause")[0].src="pause.png";
  }
  toggle() {
    if(this.isPlaying && this.playerInterval != undefined) {
      this.pause();
    } else {
      this.play();
    }
  }
  update() {
    var width = this.target.offsetWidth;
    var height = this.target.offsetHeight;
    this.target.style.width=(this.width=width)+"px";
    this.target.style.height=(this.height=height)+"px";

    var contentElems = this.target.contentMoveWrapper.querySelectorAll(".content");

    contentElems.forEach(function(elem,index) {
      elem.style.width=width+"px";
      elem.style.height=height+"px";

    },this.target.contentMoveWrapper);



    if(this.direction == Direction.Horizontal) {
      this.target.contentMoveWrapper.style.flexWrap="nowrap";
    } else {
      this.target.contentMoveWrapper.style.flexWrap="wrap";
    }
    //TOD
    this.target.contentMoveWrapper.style.top="0px";
    this.target.contentMoveWrapper.style.left="0px";


    this.goto(this.currentPage)
  }

  loadAll() {
    this.target.querySelectorAll(".content img").forEach(function(elem) {
      elem.src = elem.getAttribute("data-src"); 
    });
  }
  parsePosition(pos) {
    return parseInt(pos.substr(0,pos.length-2));
  }
}
