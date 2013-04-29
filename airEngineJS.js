//By David da Silva Contín. Last update 1:09 PM 11/08/2012

      // debuggerJS begin
      var forbbidenTopics = {};
      function trace (message, topic) {
        //console.log("Trying to trace... Message: {" + message + "}, topic: {" + topic + "}");
        if ((topic != 'undefined') || (forbbidenTopics[topic] != 'undefined') || (forbbidenTopics[topic] == false)){
          console.log(message);
        }
      }
      function traceObject(object, topic) {
        if ((topic != 'undefined') || (forbbidenTopics[topic] != 'undefined') || (forbbidenTopics[topic] == false)){
          var message = object + " {";
          for (var prop in object) {
            message += prop + ": " + object[prop] + ",";
          }
          message += "}";
          console.log(message);
        }
      }
      // debuggerJS end





      // delegateJS begin
      //function 
      // delegateJS end





      // keyboardJS begin
      function keyboardJS () {
        this.keys = {};
        this.tempASCIIkey;
        this.tempCHARkey;
      }
      keyboardJS.prototype = {
        keyIsUp : function (evt) {
          this.ASCIIkey = evt.keyCode;
          this.CHARkey = String.fromCharCode(this.ASCIIkey);
          this.keys[this.CHARkey] = false;
        },
        keyIsDown : function (evt) {
          this.ASCIIkey = evt.keyCode;
          this.CHARkey = String.fromCharCode(this.ASCIIkey);
          this.keys[this.CHARkey] = true;
        },
        init : function () {
          document.addEventListener("keydown", this.keyIsDown.bind(this));
          document.addEventListener("keyup", this.keyIsUp.bind(this));
          trace("keyboardJS inited", "keyboardJS");
        }
      }
      // keyboardJS end





      // displayObjectJS
      function displayObjectJS (properties) {
        if (properties){
          for (var prop in properties){
            this[prop] = properties[prop];
          }
        }
        trace ("displayObjectJS created.", "displayObjectJS");
      }
      displayObjectJS.prototype = {
        x : 0,
        y : 0,
        scale : 1,
        isCollider : false,
        isStatic : true,
        collisionRadius : 20,
        name : "unnamed displayObjectJS",
        logic : function () {

        },
        renderOn : function (canvasArg) {
          trace("prototype displayObjectJS rendering function");
        },
        triggerCollisionWith : function (obj) {
          return true;
        }
      }
      // displayObjectJS





      // airCameraJS begin
      function airCameraJS (airEngineJSobject, properties) {
        this.canvas = airEngineJSobject.canvas;
        this.context2D = airEngineJSobject.context2D;
        this.rect = (properties === undefined || properties.rect === undefined)? {x:0, y:0, width : this.canvas.width, height : this.canvas.height} : properties.rect;

        this.x = (properties === undefined || properties.x === undefined)? this.rect.width/2 : properties.x;
        this.y = (properties === undefined || properties.y === undefined)? this.rect.height/2 : properties.y;

        this.scale = (properties === undefined || properties.scale === undefined)? 1 : properties.scale;

        this.target = (properties === undefined)? undefined : properties.target;

        this.smoothness = (properties === undefined || properties.smoothness === undefined)? 50 : properties.smoothness;

        //Scale available in next version
        //var scale = (properties === undefined || properties.smoothness === undefined)? 5 : properties.smoothness;

        trace("A new airCameraJS has been created");
      }
      airCameraJS.prototype = {
        canvas : undefined,
        scale: 0,
        logic : function () {
          if (this.target != undefined){
            this.x += (this.target.x-this.x)/this.smoothness;
            this.y += (this.target.y-this.y)/this.smoothness;
          }
        },
        toX : function (anX) {
            return (anX - this.x)*this.scale + this.canvas.width/2;
        },
        toY : function (anY) {
            return (anY - this.y)*this.scale + this.canvas.height/2;
        }
      }
      // airCameraJS end





      // resourceManagerJS begin
      function resourceManagerJS () {
        this.self = this;
        trace("A resourceManagerJS was created.");
      }
      resourceManagerJS.prototype = {
        images : {},
        sounds : {},
        numImages : 0,
        loadedImages : 0,
        numSounds : 0,
        loadedSounds : 0,
        delegate: undefined,
        self: undefined,
        finishedLoading: false,
        loadImages : function (sources) {
          for(var src in sources) {
            this.numImages++;
            this.images[src] = new Image();
            this.images[src].onload = this.self.imageLoaded.bind(this.self);
            this.images[src].src = sources[src];
          }
        },
        loadSounds : function (sources) {
          for(var src in sources) {
            this.numSounds++;
            this.sounds[src] = new Audio();

            this.sounds[src].onload = this.self.soundLoaded.bind(this.self);
            this.sounds[src].src = sources[src];
          }
        },
        imageLoaded : function () {
          this.loadedImages++;
          this.checkIfLoaded();
        },
        soundLoaded : function () {
          this.loadedSounds++;
          this.checkIfLoaded();
        },
        checkIfLoaded : function () {
          if(this.loadedImages >= this.numImages && this.loadedSounds >= this.numSounds) {
            this.delegate.loaded();
            this.finishedLoading = true;
          }
        }
      }
      // resourceManagerJS end





      // airEngineJS begin
      function airEngineJS (properties) {
        trace("A new airEngineJS has been created");
        for (var prop in properties){
          this[prop] = properties[prop];
        }
        this.context2D = this.canvas.getContext("2d");
        if (this.autoinit == true){
          this.keyboard = new keyboardJS();
          this.keyboard.init();
          this.cameras.push(new airCameraJS(this));
        }
        var self = this;
        if (this.hasResources){
          this.resourceManager = new resourceManagerJS ();
          this.resourceManager.delegate = self;
        }
        this.enterframe = setInterval(function() {self.intervalCaller();}, 1000/this.fps);
        this.hudCamera = new airCameraJS(this);
        trace("airEngineJS's initiation finished.");
      }
      airEngineJS.prototype = {
        isometric: false,
        autoinit: true,
        hasResources: false,
        fps: 60,
        intervalCaller : function () {
          this.mainLoop();
        },
        loaded : function () {
          trace("resourceManagerJS finished loading the resources.");
        },
        cameras : [],
        provisionalValues : {},
        displayObjects : [],
        colliderObjects : [],
        dynamicObjects : [],
        hudDisplayObjects : [],
        addDisplayObject : function (displayObjectArg) {
          console.log("Object "+displayObjectArg + " added to displayObjectArray");
          this.displayObjects.push(displayObjectArg);
          if (displayObjectArg.isCollider){
            this.colliderObjects.push(displayObjectArg);
          }
          if (!displayObjectArg.isStatic){
            this.dynamicObjects.push(displayObjectArg);
          }
        },
        addHudDisplayObject : function (displayObjectArg) {
          console.log("Object "+displayObjectArg + " added to hudDisplayObjectArray");
          this.hudDisplayObjects.push(displayObjectArg);
        },
        hitTest : function (object) {
          for (var i = this.colliderObjects.length-1; i >= 0; --i){
            if (object != this.colliderObjects[i]){
              this.hitTestObjectVsObject(object, this.colliderObjects[i]);
            }
          }
        },
        hitTestObjectVsObject : function (obj1, obj2) {
          this.provisionalValues.minDistance = obj1.collisionRadius + obj2.collisionRadius;

          if (this.distancePtoP({x:obj1.x, y:obj1.y}, {x:obj2.x, y:obj2.y}) < this.provisionalValues.minDistance){

            this.provisionalValues.angle = Math.atan(-this.provisionalValues.dy/this.provisionalValues.dx)*(180/Math.PI);
            while(this.provisionalValues.angle<0){
              this.provisionalValues.angle += 180;
            }
            if (this.provisionalValues.dy>0){
              this.provisionalValues.angle += 180;
            }
            this.provisionalValues.angle *= Math.PI/180;


            if (this.isometric){
              this.provisionalValues.minDistance *= (0.4*Math.abs(Math.cos(this.provisionalValues.angle)) + 0.6);
            }
            if (this.distancePtoP({x:obj1.x, y:obj1.y}, {x:obj2.x, y:obj2.y}) < this.provisionalValues.minDistance){

              if (obj1.triggerCollisionWith(obj2)){

                obj1.x = obj2.x - this.provisionalValues.minDistance * Math.cos(this.provisionalValues.angle);
                obj1.y = obj2.y + this.provisionalValues.minDistance * Math.sin(this.provisionalValues.angle);
                
              }
            }
          }
        },
        distancePtoP : function (p1, p2) {
          this.provisionalValues.dx = p2.x - p1.x;
          this.provisionalValues.dy = p2.y - p1.y;
          this.provisionalValues.dModule = Math.sqrt(Math.pow(this.provisionalValues.dx, 2) + Math.pow(this.provisionalValues.dy, 2));
          return this.provisionalValues.dModule;
        },
        logic : function () {
          for (var i = this.displayObjects.length-1; i >= 0; --i){
            this.displayObjects[i].logic();
            if (!this.displayObjects[i].isStatic){
              this.hitTest(this.displayObjects[i]);
            }
          }

          for (var i = this.hudDisplayObjects.length-1; i>= 0; --i){
            this.hudDisplayObjects[i].logic();
          }

          for (var j = this.cameras.length-1; j >= 0; --j){
            this.cameras[j].logic();
          }
        },
        prerender : function () {

        },
        render : function () {
        
          for (var i = 0; i < this.cameras.length; ++i){
            for (var j = 0; j < this.displayObjects.length; ++j){
              this.displayObjects[j].renderOn(this.cameras[i]);
            }
          }
          for (var i = 0; i < this.hudDisplayObjects.length; ++i){
            this.hudDisplayObjects[i].renderOn(this.hudCamera);
          }
        },
        mainLoop : function () {
          this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.logic();
          this.prerender();
          this.render();
        },
        removeDisplayObject : function (obj) {
        	for (var i = this.displayObjects.length-1; i >= 0; i--){
        	
            if (this.displayObjects[i] == obj){
		    		  this.displayObjects.splice(i, 1);
		    		  break;
		        }
		      }
        },
        removeHudDisplayObject : function (obj) {
          for (var i = this.hudDisplayObjects.length-1; i >= 0; i--){
          
            if (this.hudDisplayObjects[i] == obj){
              this.hudDisplayObjects.splice(i, 1);
              break;
            }
          }
        },
        removeDisplayObject : function (obj) {
          for (var i = this.displayObjects.length-1; i >= 0; i--){
          
            if (this.displayObjects[i] == obj){
              this.displayObjects.splice(i, 1);
              break;
            }
          }
        },
		 }
  
      // airEngineJS end