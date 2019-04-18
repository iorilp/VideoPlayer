var Video;
!function () {
    Video = function (src,opts) {
        var _this = this;
        var video,domElement;

        if(!opts)opts = {};

        var options = {
            loop : opts.loop || false,
            autoplay : opts.autoplay || false,
            chunkSize : opts.chunkSize * 1024 || 512 * 1024,
            type : opts.type?opts.type:"auto"
        };

        var u = navigator.userAgent.toLowerCase();
        var isWeChat = u.indexOf('micromessenger') > -1;
        var isAndroid = u.indexOf('android') > -1 || u.indexOf('linux') > -1;

        if(isWeChat && isAndroid && options.type !== "mp4") {
            this.useTs = true;
            domElement = document.createElement("canvas");
            if(options.objectFit !== "fill"){
                domElement.style.width = "100%";
                domElement.style.height = "100%";
                domElement.style.objectFit = "cover";
            }

            video = new JSMpeg.Player(src.replace(".mp4",".ts"), {
                canvas: domElement,
                loop: options.loop || false,
                autoplay : options.autoplay || false,
                chunkSize : options.chunkSize,
                onPlay : function (player) {
                    _this.ended = false;
                    if(!_this._Event.play)return;
                    for (var i in _this._Event.play){
                        _this._Event.play[i]();
                    }
                },
                onVideoDecode : function (decoder, time) {
                    if(!_this._Event.timeupdate)return;
                    for (var i in _this._Event.timeupdate){
                        _this._Event.timeupdate[i]();
                    }
                },
                onPause : function (player) {
                    if(!_this._Event.pause)return;
                    for (var i in _this._Event.pause){
                        _this._Event.pause[i]();
                    }
                },
                onEnded : function (player) {
                    _this.ended = true;
                    if(!_this._Event.ended)return;
                    for (var i in _this._Event.ended){
                        _this._Event.ended[i]();
                    }
                }
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

        this.video = video;
        this.domElement = domElement;
        this._Event = {};

        if(!this.useTs){
            Object.defineProperty(this,"ended",{
                get : this.getEnded
            });
        }

        Object.defineProperty(this,"paused",{
            get : this.getPaused
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
                if(this.ended)this.video.currentTime = 0;
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
            this.video.currentTime = time;
        },
        getPaused : function () {
            return this.video.paused;
        },
        getEnded : function () {
            if(!this.useTs){
                return this.video.ended;
            }
        },
        addEventListener : function (type,callback) {
            var _this = this;

            if(this.useTs){
                if(!this._Event[type])this._Event[type] = {};
                this._Event[type][callback+""] = callback;

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
            }else{
                _this.video.removeEventListener(type,callback);
            }
        }

    };
}();