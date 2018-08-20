var Video;
!function () {
    Video = function (src,opts) {
        var video,domElement;

        var options = {
            loop : opts.loop || false,
            autoplay : opts.autoplay || false,
            objectFit : opts.objectFit?opts.objectFit:"cover",
            chunkSize : opts.chunkSize * 1024 || 512 * 1024,
            type : opts.type?opts.type:"auto"
        };

        var u = navigator.userAgent.toLowerCase();
        var isWeixin = u.indexOf('micromessenger') > -1;
        var isAndroid = u.indexOf('android') > -1 || u.indexOf('linux') > -1;

        if(isWeixin && isAndroid && options.type !== "mp4") {
            this.useTs = true;
            domElement = document.createElement("canvas");
            if(options.objectFit !== "fill"){
                domElement.style.width = "100%";
                domElement.style.height = "100%";
                domElement.style.objectFit = options.objectFit;
            }

            video = new JSMpeg.Player(src.replace(".mp4",".ts"), {
                canvas: domElement,
                loop: options.loop || false,
                autoplay : options.autoplay || false,
                chunkSize : options.chunkSize
            });
        }else{
            video = document.createElement("video");
            video.setAttribute("x5-video-player-type","h5");
            video.setAttribute("x-webkit-airplay","true");
            video.setAttribute("airplay","allow");
            video.setAttribute("playsinline","");
            video.setAttribute("webkit-playsinline","");
            video.controls = false;
            if(options.autoplay)video.setAttribute("autoplay","true");
            if(options.loop)video.setAttribute("loop","true");
            video.setAttribute("src",src);
            if(options.objectFit !== "fill"){
                video.style.width = "100%";
                video.style.height = "100%";
                video.style.objectFit = options.objectFit;
            }

            video.webkitExitFullScreen();

            video.addEventListener('webkitbeginfullscreen', function (event) {
                video.webkitExitFullScreen();
            });

            domElement = video;
        }

        this.totalTime = opts.totalTime-1;
        this.video = video;
        this.domElement = domElement;
        this._Event = {};
        this._Temp = {};

        Object.defineProperty(this,"paused",{
            get : this.getPlayStatus
        });

        Object.defineProperty(this,"currentTime",{
            get : this.getCurrentTime,
            set : this.setCurrentTime
        });

        Object.defineProperty(this,"muted",{
            get : this.getMuted,
            set : this.setMuted
        });

    };

    Video.prototype = {
        load : function () {
            if(!this.useTs){
                this.video.load();
            }
        },
        play : function () {
            if(this.useTs){
                if(this._Temp.ended)this.video.currentTime = 0;
            }
            this.video.play();
        },
        pause : function () {
            this.video.pause();
        },
        stop : function () {
            if(this.useTs){
                this.video.stop();
            }else{
                this.video.currentTime = 0;
                this.video.pause();
            }
        },
        destroy : function () {
            if(this.useTs){
                if(this.animationFrame)cancelAnimationFrame(this.animationFrame);
                console.log(this.animationFrame);
                this.video.destroy();
            }
        },
        getMuted : function () {
            if(this.useTs){
                return !this.video.volume;
            }else{
                return this.video.muted;
            }
        },
        setMuted : function (value) {
            if(this.useTs){
                this.video.volume = value?0:1;
            }else{
                this.video.muted = value;
            }
        },
        getCurrentTime : function () {
            return this.video.currentTime;
        },
        setCurrentTime : function (time) {
            // this.seek(time);
            this.video.currentTime = time;
        },
        getPlayStatus : function () {
            if(this.useTs){
                return this.video.isPlaying;
            }else{
                return !this.video.paused;
            }
        },
        _loop : function () {
            this.animationFrame = requestAnimationFrame(this._loop.bind(this));
            var _this = this;

            if(this.video.isPlaying){
                //播放状态
                this._Temp.pause = false;
                this._Temp.ended = false;

                if(this._Event.timeupdate){
                    for (var timeupdateItem in this._Event.timeupdate){
                        _this._Event.timeupdate[timeupdateItem]();
                    }
                }

                if(this._Event.play && !this._Temp.play){
                    this._Temp.play = true;
                    for (var playItem in this._Event.play){
                        _this._Event.play[playItem]();
                    }
                }
            }else{
                if(this.video.currentTime >= this.totalTime){
                    //完成状态
                    if(this.video.currentTime !== 0 && !this._Temp.ended){
                        this._Temp.pause = true;
                        this._Temp.ended = true;
                        if(this._Event.pause){
                            for (var pauseItem in this._Event.pause){
                                _this._Event.pause[pauseItem]();
                            }
                        }
                        if(this._Event.ended){
                            for (var endedItem in this._Event.ended){
                                _this._Event.ended[endedItem]();
                            }
                        }
                    }
                }else{
                    //暂停状态
                    if(this.video.currentTime !== 0 && !this._Temp.pause){
                        this._Temp.pause = true;
                        if(this._Event.pause){
                            for (var pauseItem in this._Event.pause){
                                _this._Event.pause[pauseItem]();
                            }
                        }
                    }
                }
            }

        },
        addEventListener : function (type,callback) {
            var _this = this;

            if(this.useTs){
                if(!this._Event[type])this._Event[type] = {};
                this._Event[type][callback+""] = callback;

                this.animationFrame = requestAnimationFrame(this._loop.bind(this));
            }else{
                _this.video.addEventListener(type,callback);
            }

        },
        removeEventListener : function (type,callback) {
            var _this = this;

            if(this.useTs){
                delete _this._Event[type][callback+""];
                if(Object.getOwnPropertyNames(_this._Event[type]).length  === 0){
                    delete _this._Event[type];
                }

                if(!_this._Event.play && !_this._Event.timeupdate && !_this._Event.pause && !_this._Event.ended){
                    if(_this.animationFrame)cancelAnimationFrame(_this.animationFrame);
                }

            }else{
                _this.video.removeEventListener(type,callback);
            }
        }

    };
}();