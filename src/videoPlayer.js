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
            progressive : opts.progressive !== false
        };

        console.log(src);

        var type = /\.([a-zA-Z0-9]+)$/ig.exec(src)[1].toLowerCase();
        this.type = type;

        switch (type) {
            case "mp4" :
                video = document.createElement("video");
                video.setAttribute("x-webkit-airplay","true");
                video.setAttribute("airplay","allow");
                video.setAttribute("playsinline","");
                video.setAttribute("webkit-playsinline","");
                // video.setAttribute("x5-playsinline","");
                video.setAttribute("t7-video-player-type","inline");
                video.setAttribute("x5-video-player-type","h5-page");
                // video.setAttribute("x5-video-player-fullscreen","false");
                video.controls = false;
                if(options.autoplay)video.setAttribute("autoplay","true");
                if(options.loop)video.setAttribute("loop","true");
                video.setAttribute("src",src);
                video.style.width = "100%";
                video.style.height = "100%";
                video.style.objectFit = "cover";

                enableInlineVideo(video);
                domElement = video;
                break;
            case "ts" :
                domElement = document.createElement("canvas");
                domElement.style.width = "100%";
                domElement.style.height = "100%";
                domElement.style.objectFit = "cover";

                video = new JSMpeg.Player(src, {
                    canvas: domElement,
                    loop: options.loop,
                    autoplay : options.autoplay,
                    chunkSize : options.chunkSize,
                    progressive : options.progressive,
                    disableWebAssembly : true,
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

        }

        this.video = video;
        this.domElement = domElement;
        this._Event = {};

        if(type === "mp4"){
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
            if(this.type === "mp4"){
                this.video.load();
            }
        },
        play : function () {
            if(this.type === "ts"){
                if(this.ended)this.video.currentTime = 0;
            }
            this.video.play();
        },
        pause : function () {
            this.video.pause();
        },
        stop : function () {
            if(this.type === "ts"){
                this.video.stop();
            }else{
                this.video.currentTime = 0;
                this.video.pause();
            }
        },
        destroy : function () {
            if(this.type === "ts"){
                this.video.destroy();
            }
        },
        getMuted : function () {
            if(this.type === "ts"){
                return !this.video.volume;
            }else{
                return this.video.muted;
            }
        },
        setMuted : function (value) {
            if(this.type === "ts"){
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
            if(this.type === "mp4"){
                return this.video.ended;
            }
        },
        addEventListener : function (type,callback) {
            var _this = this;
            if(this.type === "ts"){
                if(!this._Event[type])this._Event[type] = {};
                this._Event[type][callback+""] = callback;

            }else{
                _this.video.addEventListener(type,callback);
            }

        },
        removeEventListener : function (type,callback) {
            var _this = this;
            if(this.type === "ts"){
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