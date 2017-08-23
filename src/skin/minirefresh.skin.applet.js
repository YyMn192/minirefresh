/**
 * 微信小程序皮肤
 * 由于要复用default的上拉加载，toTop功能，所以直接继承自default
 * 只重写了 downWrap相关操作
 */
(function(innerUtil) {

    /**
     * 一些默认提供的CSS类，一般来说不会变动（由框架提供的）
     * skin字段会根据不同的皮肤有不同值
     */
    var CLASS_SKIN = 'minirefresh-skin-applet';
    var CLASS_DOWN_WRAP = 'minirefresh-downwrap';
    var CLASS_HARDWARE_SPEEDUP = 'minirefresh-hardware-speedup';

    /**
     * 本皮肤的特色样式
     */
    var CLASS_DOWN_LOADING = 'loading-applet';

    /**
     * 一些常量
     */
    var DEFAULT_DOWN_HEIGHT = 50;

    var defaultSetting = {
        down: {
            successAnim: {
                // 微信小程序皮肤没有successAnim 也没有文字提示
                enable: false
            }
        }
    };

    var MiniRefreshSkin = innerUtil.skin.defaults.extend({

        /**
         * 拓展自定义的配置
         * @param {Object} options 配置参数
         */
        init: function(options) {
            options = innerUtil.extend(true, {}, defaultSetting, options);
            this._super(options);
        },

        /**
         * 重写下拉刷新初始化，变为小程序自己的动画
         */
        _initDownWrap: function() {
            var container = this.container,
                scrollWrap = this.scrollWrap;

            // 下拉的区域
            var downWrap = document.createElement('div');

            downWrap.className = CLASS_DOWN_WRAP + ' ' + CLASS_HARDWARE_SPEEDUP;
            downWrap.innerHTML = '<div class="downwrap-content ball-beat"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
            container.insertBefore(downWrap, scrollWrap);

            // 由于直接继承的default，所以其实已经有default皮肤了，这里再加上本皮肤样式
            container.classList.add(CLASS_SKIN);

            this.downWrap = downWrap;
            // 留一个默认值，以免样式被覆盖，无法获取
            this.downWrapHeight = this.downWrap.offsetHeight || DEFAULT_DOWN_HEIGHT;
            this._transformDownWrap(-1 * this.downWrapHeight);
        },
        _transformDownWrap: function(offset, duration) {
            offset = offset || 0;
            duration = duration || 0;
            // 记得动画时 translateZ 否则硬件加速会被覆盖
            this.downWrap.style.webkitTransitionDuration = duration + 'ms';
            this.downWrap.style.transitionDuration = duration + 'ms';
            this.downWrap.style.webkitTransform = 'translateY(' + offset + 'px)  translateZ(0px)';
            this.downWrap.style.transform = 'translateY(' + offset + 'px)  translateZ(0px)';
        },

        /**
         * 重写下拉过程动画
         * @param {Number} downHight 当前下拉的高度
         * @param {Number} downOffset 下拉的阈值
         */
        _pullHook: function(downHight, downOffset) {

            if (downHight < downOffset) {
                var rate = downHight / downOffset,
                    offset = this.downWrapHeight * (-1 + rate);

                this._transformDownWrap(offset);
            } else {
                this._transformDownWrap(0);
            }
        },

        /**
         * 重写下拉动画
         */
        _downLoaingHook: function() {
            this.downWrap.classList.add(CLASS_DOWN_LOADING);
        },

        /**
         * 重写success 但是什么都不做
         */
        _downLoaingSuccessHook: function() {},

        /**
         * 重写下拉end
         * @param {Boolean} isSuccess 是否成功
         */
        _downLoaingEndHook: function(isSuccess) {
            this.downWrap.classList.remove(CLASS_DOWN_LOADING);
            this._transformDownWrap(-1 * this.downWrapHeight);
        }
    });

    // 挂载皮肤，这样多个皮肤可以并存
    innerUtil.namespace('skin.applet', MiniRefreshSkin);

    // 覆盖全局对象，使的全局对象只会指向一个最新的皮肤
    window.MiniRefresh = MiniRefreshSkin;

    /**
     * 兼容require，为了方便使用，暴露出去的就是最终的皮肤
     * 如果要自己实现皮肤，也请在对应的皮肤中增加require支持
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MiniRefreshSkin;
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function() {
            return MiniRefreshSkin;
        });
    }

})(MiniRefreshTools);