# VideoPlayer
解决H5在微信浏览器中弹出播放框的插件

## 如何使用
引入JS核心文件
```html
<script type="text/javascript" src="jsmpeg.min.js"></script>
<script type="text/javascript" src="videoPlayer.js"></script>
 ```
实例化videoPlay
```JS
//实例化videoPlayer
var video = new Video({
    loop : false,
    autoplay : false,
    objectFit : "cover",
    chunkSize : 512
});
```

## Options

| Field           | Type            | Default  | Description                           | 
| --------------- |:---------------:| :------: | ------------------------------------  |
| `loop`          | `boolean`       | `false`  | 视频是否循环播放 |
| `autoplay`      | `boolean`       | `false`  | 视频是否自动播放           |
| `objectFit`     | `string`        | cover    | 设置视频的object-fit属性，该项值同css的object-fit属性      |
| `chunkSize`     | `number`        | `512`    | 设置ts视频文件分段值，单位为KB，该项只对ts文件有效 |

## Methods
实例化完成后，你可以使用以下方法进行视频播放：

| Field            | Parameter              | Description                         |
| ---------------- | :--------------------: | ----------------------------------- |
| `load()`         | none                   | loading视频，该项只对MP4文件有效，ts文件会在实例化的时候加载。   |
| `play()`         | none                   | 播放视频。 |
| `pause()`        | none                   | 暂停播放视频。|
| `stop()`         | none                   | 停止播放视频。|
| `destroy()`      | none                   | 清除视频及监听事件。|
| `getPlayStatus()`| none                   | 获取视频播放状态。 |
| `paused`         | none                   | 获取视频是否暂停。 |
| `currentTime`    | none                   | 获取或设置视频的播放位置。 |
| `muted`          | none                   | 获取或设置视频的音量。 |

## Events
播放事件的监听及取消监听的方法。

| Field                                  | Parameter           | Description           |
| -------------------------------------- | :-----------------: |---------------------- |
| `addEventListener(events,handler)`     | `events` `handler`  | 监听事件。`events` - 监听事件名称，`handler` - 监听事件执行方法。   |
| `removeEventListener(events,handler)`  | `events` `handler`  | 停止监听事件。参数同上。   |

事件监听名称：
- `"play"` - 开始播放
- `"timeupdate"` - 播放过程中
- `"pause"` - 暂停视频
- `"ended"` - 播放结束

```JS
//示例
var timeupdate = function () {
    console.log(video.currentTime);
}
video.addEventListener("timeupdate",timeupdate);
```
## Author
iorilp
