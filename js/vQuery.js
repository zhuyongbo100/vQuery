~function (window) {
    //识别IE6~8
    var flag = "getComputedStyle" in window;
    //前台调用
    var $ = function (selector) {
        return new vQuery(selector);
    }

    function vQuery(selector) {
        //->创建一个数组，来保存获取的节点和节点数组
        this.elements = [];
        if (typeof seleorct === "function") { //HTMLDOM加载完成即执行
            this.ready(selector);
        } else if (typeof selector === "object" && selector != null) {//this
            this.elements = [];
            this.elements[0] = selector;
        } else if (selector == undefined) {//方便扩展插件
        } else {
            var slt = $.trim(selector).split(/\s+/);
            //->选择器部分，支持后代、子代、并集、子代中的第n个
            for (var i = 0, len = slt.length; i < len; i++) {
                var suffix = slt[i].charAt(0);
                var name = slt[i].substr(1);
                if (i === 0) {
                    switch (suffix) {
                        case "#":
                            this.elements.push(this.getId(name));
                            break;
                        case ".":
                            this.elements = this.getClass(name);
                            break;
                        default:
                            this.elements = this.getTagName(slt[i]);
                    }
                } else {
                    if (suffix === ">") {//
                        if (!/\.|#/.test(slt[i + 1])) {
                            this.children(slt[++i]);
                        } else {
                            continue;
                        }
                    } else if (/\.|\#/.test(slt[i])) {
                        this.bing(slt[i]);
                    }
                    else if (/nth\((\d+)\)/.test(slt[i])) {
                        var num = slt[i].match(/nth\((\d+)\)/)[1];
                        this.nth(num);
                    }
                    else {
                        this.find(slt[i]);
                    }
                }

            }
        }

    }

    var vQ = vQuery.prototype;
    //============选择器==============================
    //->后代选择器,格式 ul li div
    vQ.find = function (selector) {
        var suffix = selector.charAt(0);
        var name = selector.substr(1);
        var childElements = [];
        if (suffix === "#") {
            this.elements = [];
            this.elements.push(this.getId(name));
            return this;
        }
        for (var i = 0; i < this.elements.length; i++) {
            if (suffix === ".") {
                var element = this.getClass(name, this.elements[i]);
                for (var j = 0; j < element.length; j++) {
                    childElements.push(element[j]);
                }
            } else {
                var element = this.getTagName(selector, this.elements[i]);
                for (var j = 0; j < element.length; j++) {
                    childElements.push(element[j]);
                }
            }
        }
        this.elements = childElements;
        return this;
    }
    //->子代选择器，格式 ul > li > div
    vQ.children = function (selector) {
        if (selector) {
            var suffix = selector.charAt(0);
            var name = selector.substr(1);
        }
        var childElements = [];
        if (suffix === "#") {
            this.elements = [];
            this.elements.push(this.getId(name));
            return this;
        }
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var curEle = this.elements[i];
            if (flag) {
                childElements = childElements.concat($.makeArray(curEle.children));
            } else {
                var childNodes = curEle.childNodes;
                for (var j = 0, _len = childNodes.length; j < _len; j++) {
                    var curNode = childNodes[j];
                    if (curNode.nodeType === 1) {
                        childElements.push(curNode);
                    }
                }
            }
            if (typeof selector === "string") {
                for (var k = 0; k < childElements.length; k++) {
                    if (suffix === ".") {
                        var elements = this.getClass(name, this.elements[i]);
                        var reg = new RegExp("(^|\\s+)" + name + "(\\s+|$)");
                        for (var j = 0; j < elements.length; j++) {
                            if (!reg.test(childElements[k].className)) {
                                childElements.splice(k, 1);
                                k--;
                            }
                        }
                    } else {
                        if (childElements[k].nodeName !== selector.toUpperCase()) {
                            childElements.splice(k, 1);
                            k--;
                        }
                    }

                }
            }
        }
        this.elements = childElements;
        return this;
    }
    //->交集选择器,格式p.class或者p#id
    vQ.bing = function (selector) {
        var childElements = [];
        var reg = /(\w+)(\.|#)(\w+)/;
        var sltAry = selector.match(reg);
        var tag = sltAry[1];
        var suffix = sltAry[2];
        var name = sltAry[3];
        for (var i = 0; i < this.elements.length; i++) {
            if (suffix === "#") {
                var ele = this.getId(name);
                if (ele && ele.nodeName === tag.toUpperCase()) {
                    childElements.push(this.getId(name));
                }
            } else if (suffix === ".") {
                var eles = this.getTagName(tag, this.elements[i]);
                for (var j = 0; j < eles.length; j++) {
                    var reg = new RegExp("(^|\\s+)" + name + "(\\s+|$)");
                    if (reg.test(eles[j].className)) {
                        childElements.push(eles[j]);
                    }
                }
            }
        }
        this.elements = childElements;
        return this;
    }
    //->子代中的第num个,格式:nth(num)
    vQ.nth = function (num) {
        this.children().eq(num - 1);
        return this;
    }
    //->通过ID获取元素
    vQ.getId = function (id) {
        return document.getElementById(id);
    }
    //->通过TagName获取元素数组
    vQ.getTagName = function (tag, context) {
        context = context ? context : document;
        var elements = context.getElementsByTagName(tag);
        var tempAry = $.makeArray(elements);
        return tempAry;
    }
    //->通过Class获取节点数组
    vQ.getClass = function (strClass, context) {
        var tempAry = [];
        context = context ? context : document;
        if (flag) {
            tempAry = $.makeArray(context.getElementsByClassName(strClass));
        } else {
            var nodes = context.getElementsByTagName("*");
            var scAry = $.trim(strClass).split(/\s+/);
            for (var i = 0, len = nodes.length; i < len; i++) {
                var isOk = true;
                var curNode = nodes[i];
                for (var j = 0; j < scAry.length; j++) {
                    curSc = scAry[j];
                    var reg = new RegExp("(^|\\s+)" + curSc + "(\\s+|$)");
                    var cn = curNode.className;
                    if (!reg.test(cn)) {
                        isOk = false;
                        break;
                    }
                }
                isOk ? tempAry.push(curNode) : null;
            }
        }
        return tempAry;
    }
    //->eq:获取元素数组中的指定元素
    vQ.eq = function (num) {
        var element = this.elements[num];
        this.elements = [];
        this.elements[0] = element;
        return this;
    }
    //->get:获取元素数组的指定元素的DOM对象
    vQ.get = function (num) {
        return this.elements[num];
    }
    //============class======================
    //->hasClass：判断指定元素是否含有指定className
    vQ.hasClass = function (className) {
        var reg = new RegExp("(^|\\s+)" + className + "(\\s+|$)");
        var curEle = this.elements[0];
        return reg.test(curEle.className);
    }
    //->addClass:支持元素数组，可增加多个类名，格式 class1 class2 class3
    vQ.addClass = function (className) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            curEle = this.elements[i];
            var ary = $.trim(className).split(/\s+/);
            for (var j = 0, j_len = ary.length; j < j_len; j++) {
                var curName = ary[j];
                var reg = new RegExp("(^|\\s+)" + curName + "(\\s+|$)");
                if (!reg.test(curEle.className)) {
                    curEle.className += " " + curName;
                }
            }
        }
        return this;
    }
    //->removeClss:支持元素数组移除class,格式class1 class2
    vQ.removeClass = function (className) {
        var ary = $.trim(className).split(/\s+/);
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var curEle = this.elements[i];
            for (var j = 0, j_len = ary.length; j < j_len; j++) {
                var curName = ary[j];
                var reg = new RegExp("(^|\\s+)" + curName + "(\\s+|$)");
                if (reg.test(curEle.className)) {
                    curEle.className = curEle.className.replace(curName, "");
                }
            }
        }
        return this;
    }
    //============工具方法=======================
    //->数据类型检测
    $.judge = function () {
        function isType(type) {
            return function (val) {//柯里化函数思想
                var reg = new RegExp("\\[object\\s+" + type + "\\]", "i");
                var res = {}.toString.call(val);
                return reg.test(res);
            }
        }
        var obj = {
            isNum: "number",
            isStr: "string",
            isBool: "boolean",
            isNull: "null",
            isUnd: "undefined",
            isObj: "object",
            isFun: "function",
            isAry: "array",
            isReg: "regexp"
        };
        var funObj = {};
        for(var key in obj){
            funObj[key] = isType(obj[key]);
        }
        return funObj;
    };
    $.isNum = $.judge().isNum;
    $.isAry = $.judge().isAry;
    $.isObj = $.judge().isObj;
    $.isFun = $.judge().isFun;
    $.isUnd = $.judge().isUnd;
    $.isNull = $.judge().isNull;
    $.isStr = $.judge().isStr;
    $.isBool = $.judge().isBool;
    //->bind:预处理机制，修改this并传参但不执行
    $.bind = function (callback, context) {
        context = context || window;
        var ags = Array.prototype.slice.call(arguments, 2);
        if (flag) {
            return callback.bind(context, ags);
        } else {//兼容IE，利用柯里化函数思想
            return function (e) {
                e = e || window.event;
                callback.call(context, ags, e);
            }
        }
    }
    //->trim:返回值为除去字符串首尾空格后的字符串
    $.trim = function (str) {
        if (/^\s+|\s+$/.test(str)) {
            return str.replace(/^\s+|\s+$/g, "");
        } else {
            return str;
        }
    }
    //->makeArray:类数组对象转换为数组
    $.makeArray = function (likeAry) {
        if (flag) {
            return Array.prototype.slice.call(likeAry);
        }
        var ary = [];
        for (var i = 0; i < likeAry.length; i++) {
            ary[ary.length] = likeAry[i];
        }
        return ary;
    }
    //->JSON:解析字符串成JSON对象
    $.JSON = function JSON(jsonStr) {
        return "JSON" in window ? window.JSON.parse(jsonStr) : eval("(" + jsonStr + ")");
    }
    //->each:支持遍历多维数组 callback(item,index) context:修改callback中的this
    $.each = function (ary, callback, context) {
        context = context || window;
        var _this = ary;
        try {
            _this.i || (_this.i = 0);
            if (_this && _this.length > 0 && callback.constructor == Function) {
                while (_this.i < _this.length) {
                    var item = _this[_this.i];
                    if (item && item.constructor == Array) {
                        $.each(item, callback, context);
                    } else {
                        callback.call(context, item, $.each.index);
                    }
                    _this.i++;
                    $.each.index++;
                }
                _this.i = null;
            }
        } catch (ex) {

        }
        $.each.index = 0;
        return _this;
    }
    //类似于全局变量，为了统计多维数组的索引
    $.each.index = 0;
    //->forEach
    $.forEach = function (ary, callback, context) {
        context = context || window;
        if (flag) {
            ary.forEach(callback, context);
            return;
        } else {
            for (var i = 0; i < ary.length; i++) {
                if (typeof callback === "function") {
                    callback.call(context, ary[i], i, ary);
                }
            }
        }
    }
    //->map
    $.map = function (ary, callback, context) {
        context = context || window;
        if (flag) {
            return ary.map(callback, context);
        } else {
            var newAry=[];
            for (var i = 0; i < ary.length; i++) {
                if (typeof callback === "function") {
                    var val =  callback.call(context, ary[i], i, ary);
                    newAry[i] = val;
                }
            }
            return newAry;
        }
    }
    //->ajax:支持get、post请求，可与后台交互数据，格式{options}
    $.ajax = function (options) {
        var xhr = null;
        var creatXHR = function () {//创建xhr
            var ary = [function () {
                return new XMLHttpRequest;
            }, function () {
                return new ActiveXObject("MSXML2.XMLHttp.6.0");
            }, function () {
                return new ActiveXObject("MSXML2.XMLHttp.3.0");
            }, function () {
                return new ActiveXObject("MSXML2.XMLHttp");
            }];
            for (var i = 0, len = ary.length; i < len; i++) {
                var cur = ary[i];
                try {
                    xhr = cur();
                    creatXHR = cur;//惰性思维
                    break;
                } catch (e) {
                }
            }
            return xhr;
        }
        var sendAjax = function (options) {
            var _defaults = {
                url: "",//访问地址
                type: "get",//仅支持get、post
                data: null,//传入数据，格式{name:"zyb",age:22}
                async: true,//异步
                timeout: null,//延迟时间
                dataType: "json",//返回数据为json格式
                cache: false,//无缓存
                getHead: null,//响应头返回(readystate == 2)时执行函数
                success: null//客户端成功接受数据(readstate == 4)时执行函数
            }
            var sendData = null;
            for (var key in options) {
                _defaults[key] = options[key];
            }
            var xhr = creatXHR();

            function params(data) {//编码数据
                var ary = [];
                for (var key in data) {
                    ary.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                }
                return ary.join("&");
            }

            if (_defaults["type"].toLowerCase() === "get" && _defaults["cache"] == false) {
                var suffix = _defaults["url"].indexOf("?") > -1 ? "&" : "?";
                if (_defaults["data"]) { //拼接传给后台的数据
                    _defaults["url"] += suffix + params(_defaults["data"]) + "&_=" + Math.random();
                } else {
                    _defaults["url"] += suffix + "_=" + Math.random();//get请求无缓冲，添加随机数
                }
            }
            if (_defaults["type"].toLowerCase() === "post") {//拼接post请求数据
                sendData = _defaults["data"] ? params(_defaults["data"]) : null;
            }
            if (_defaults["timeout"]) {//设置延迟时间
                xhr.timeout = _defaults["timeout"];
            }
            xhr.open(_defaults["type"], _defaults["url"], _defaults["async"]);
            if (_defaults["type"].toLowerCase() === "post") {//模拟web表单提交
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 2) {//客户端接受响应头
                    if (typeof _defaults["getHead"] === "function") {
                        _defaults["getHead"].call(xhr);
                    }
                }
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var val = xhr.responseText;
                        if (_defaults["dataType"] === "json") {
                            val = $.JSON(val);
                        }
                        if (typeof _defaults["success"] === "function") {
                            _defaults["success"].call(xhr, val);
                        }
                    }
                }
            }
            xhr.send(sendData);
        }
        sendAjax(options);
    }
    //==================css样式=====================
    //->setCss:设置css样式 格式 ("opacity",0.1)
    vQ.setCss = function (attr, value) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var curEle = this.elements[i];
            if (attr === "opacity") {
                curEle.style["opacity"] = value;
                curEle.style["filter"] = "alpha(opacity=" + (parseFloat(value) * 100) + ")";
            }
            if (attr === "float") {
                curEle.style["cssFloat"] = value;
                curEle.style["styleFloat"] = value;
            }
            var reg = /^width|height|top|bottom|left|right|((margin|padding)(Left|Top|Right|Bottom))$/;
            if (reg.test(attr)) {
                if (!isNaN(value)) {
                    value += "px";
                }
            }
            curEle.style[attr] = value;
        }
        return this;
    }
    //->css:获取、设置css样式  获取:("width") 设置css样式：("width"，100) 批量设置css样式：({"float":"left","opacity":0.1})
    vQ.css = function () {
        var store = this.elements;
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var curEle = this.elements[i];
            var attr = null, val = null, options = null;
            if (arguments.length === 1) {
                if (typeof arguments[0] === "string") {//getCss
                    attr = arguments[0];
                    if (flag) { //w3c
                        val = window.getComputedStyle(curEle, null)[attr];
                    } else {//ie6-8
                        if (attr === "opacity") {
                            var reg = /^alpha\(opacity = (\d+(\.\d+?:)?)\)$/;
                            oldVal = curEle.currentStyle["filter"];
                            if (oldVal) {
                                val = oldVal.match(reg)[1] / 100;
                            } else {
                                val = 1;//默认为1，style中不设置获取不到
                            }
                        } else if (attr === "left" || "top" || "width" || "height") {
                            val = curEle.currentStyle[attr];
                            if (val == "auto") {
                                val = 0;//默认为0
                            }
                        } else {
                            val = curEle.currentStyle[attr];
                        }
                    }
                    if (/^(-?\d+(\.\d+)?)(px)?$/.test(val)) {
                        val = parseFloat(val);
                    }
                    return val;
                }
                else if (Object.prototype.toString.call(arguments[0]) === "[object Object]") {
                    options = arguments[0];
                    for (var key in options) {
                        attr = key, value = options[key];
                        this.elements = [];
                        this.elements.push(curEle);
                        this.setCss(attr, value);
                    }
                    this.elements = store;
                }
            }
            else if (arguments.length === 2) {//setCss
                attr = arguments[0], value = arguments[1];
                this.elements = [];
                this.elements.push(curEle);
                this.setCss(attr, value);
                this.elements = store;
            }
        }
        return this;
    }
    //->win:获取、设置window的盒子 获取:("clientWidth") 设置:("scrollTop",100)
    vQ.win = function (attr, value) {
        if (typeof value === "undefined") {
            return document.documentElement[attr] || document.body[attr];
        } else {
            document.documentElement[attr] = value;
            document.body[attr] = value;
            return this;
        }
    }
    //->offset:指定元素距离Body的偏移量,元素数组时返回第一个元素偏移量{"left","top"}
    vQ.offset = function () {
        var curEle = this.elements[0];
        var par = curEle.offsetParent;
        var left = null, top = null;
        while (par) {
            left += curEle.offsetLeft;
            top += curEle.offsetTop;
            if (par.nodeName.toLowerCase() !== "body") {
                left += par.clientLeft;
                top += par.clientTop;
            }
            curEle = par;
            par = curEle.offsetParent;
        }
        return {
            left: left,
            top: top
        }
    }
    //->position:指定元素距离定位父元素的偏移量,多个元素时返回第一个元素偏移量
    vQ.position = function () {
        var curEle = this.elements[0];
        var left = curEle.offsetLeft;
        var top = curEle.offsetTop;
        return {
            left: left,
            top: top
        }
    }
    //==============DOM操作=================
    //->prev:获取上一个元素节点,屏蔽<script>
    vQ.prev = function () {
        var curEle = this.elements[0];
        var pre = null;
        if (flag) {
            pre = curEle.previousElementSibling;
        } else {
            pre = curEle.previousSibling;
            while (pre && pre.nodeType !== 1) {
                pre = pre.previousSibling;
            }
        }
        this.elements = [];
        this.elements[0] = pre;
        return this;
    }
    //->next:获取下一个元素节点,屏蔽<script>
    vQ.next = function () {
        var curEle = this.elements[0];
        var next = null;
        if (flag) {
            next = curEle.nextElementSibling;
        } else {
            next = curEle.nextSibling;
            while (next && next.nodeType !== 1) {
                next = next.nextSibling;
            }
        }
        this.elements = [];
        this.elements[0] = next;
        return this;
    }
    //->prevAll:获取所有的哥哥元素节点
    vQ.prevAll = function () {
        var ary = [];
        this.elements = this.elements.slice(0, 1);
        var pre = this.prev().elements[0];
        while (pre) {
            ary.unshift(pre);//unshift
            pre = this.prev().elements[0];
        }
        this.elements = ary;
        return this;
    }
    //->nextAll:获取所有的弟弟元素节点
    vQ.nextAll = function () {
        var ary = [];
        this.elements = this.elements.slice(0, 1);
        var next = this.next().elements[0];
        while (next) {
            ary.push(next);
            next = this.next().elements[0];
        }
        this.elements = ary;
        return this;
    }
    //->sibling:获取相邻的两个元素节点
    vQ.sibling = function () {
        this.elements = this.elements.slice(0, 1);
        var ary = [];
        var pre = this.prev().elements[0];
        var next = this.next().elements[0];
        pre ? ary.push(pre) : null;
        next ? ary.push(next) : null;
        this.elements = ary;
        return this;
    }
    //->siblings:获取所有的兄弟元素节点
    vQ.siblings = function () {
        var curEle = this.elements[0];
        var preAll = this.prevAll().elements;
        this.elements = [];
        this.elements[0] = curEle;
        var nextAll = this.nextAll().elements;
        this.elements = preAll.concat(nextAll);
        return this;
    }
    //->firstChild:获取第一个元素子节点
    vQ.firstChild = function () {
        var curEle = this.elements[0];
        if (flag) {
            var fir = curEle.firstElementChild;
        } else {
            fir = curEle.firstChild;
            while (fir.nodeType !== 1) {
                fir = fir.nextSibling;
            }
        }
        this.elements = [];
        this.elements[0] = fir;
        return this;

    }
    //->lastChild:获取最后一个元素子节点
    vQ.lastChild = function () {
        if (flag) {
            var last = this.elements[0].lastElementChild;
        } else {
            last = this.elements[0].lastChild;
            if (last.nodeType !== 1) {
                last = last.previousSibling;
            }
        }
        this.elements = [];
        this.elements[0] = last;
        return this;
    }
    //->append:末尾内插newEle
    vQ.append = function (newEle) {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].appendChild(newEle);
        }
        return this;
    }
    //->prepend:开头内插newEle
    vQ.prepend = function (newEle) {
        var store = this.elements;
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            this.elements = [];
            this.elements[0] = curEle;
            var fir = this.firstChild().elements[0]
            curEle.insertBefore(newEle, fir);
            this.elements = store;
        }
        return this;
    }
    //->before:同级前插newEle
    vQ.before = function (newEle) {
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            curEle.parentNode.insertBefore(newEle, curEle);
        }
        return this;
    }
    //->after:同级后插(由于DOM映射机制，操作多个元素时，只会追加到最后一个元素上）
    vQ.after = function (newEle) {
        var store = this.elements;
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            this.elements = [];
            this.elements[0] = curEle;
            var next = this.next().elements[0];
            next ? curEle.parentNode.insertBefore(newEle, next) : curEle.parentNode.appendChild(newEle);
            this.elements = store;
        }
        return this;
    }
    //=============================动画===========================
    //->常用动画算法 t: curTime， b:begin， c:change(target-begin)， d:duration
    var tween = {
        //匀速
        Linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        //指数衰减的反弹缓动
        Bounce: {
            easeIn: function (t, b, c, d) {
                return c - zhufengEffect.Bounce.easeOut(d - t, 0, c, d) + b;
            },
            easeOut: function (t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOut: function (t, b, c, d) {
                if (t < d / 2) {
                    return zhufengEffect.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                }
                return zhufengEffect.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        },
        //二次方的缓动
        Quad: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        },
        //三次方的缓动
        Cubic: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t + b;
                }
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        },
        //四次方的缓动
        Quart: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t * t + b;
                }
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            }
        },
        //五次方的缓动
        Quint: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t * t * t * t + b;
                }
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            }
        },
        //正弦曲线的缓动
        Sine: {
            easeIn: function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOut: function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            }
        },
        //指数曲线的缓动
        Expo: {
            easeIn: function (t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOut: function (t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        },
        //圆形曲线的缓动
        Circ: {
            easeIn: function (t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                }
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            }
        },
        //超过范围的三次方缓动
        Back: {
            easeIn: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) {
                    return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                }
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            }
        },
        //指数衰减的正弦曲线缓动
        Elastic: {
            easeIn: function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                var s;
                !a || a < Math.avQ(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOut: function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                var s;
                !a || a < Math.avQ(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOut: function (t, b, c, d, a, p) {
                if (t == 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                var s;
                !a || a < Math.avQ(c) ? (a = c, s = p / 4) : s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;

            }
        }

    }
    //->animate:控制动画
    // target：目标点的位置，可传入多个值，如{"left":100,"width":100,"opacity":0.1}，duration:动画运动时间,effect:tween动画库一种效果,callback:回调函数，到达目标点后执行
    //->effect传入方式，支持2种传参方式
    //1)number：0->Linear 1->Circ.easeInOut 2->Elastic.easeOut 3->Back.easeOut 4->Bounce.easeOut 5->Expo.easeIn
    //2)array：["Elastic","easeOut"]) ->tween.Elastic.easeOut
    //defalut:tween.Linear
    vQ.animate = function (target, duration, effect, callback) {
        var store = this.elements;
        for (var i = 0, len = this.elements.length; i < len; i++) {
            curEle = this.elements[i];
            var curEffect = tween.Linear;
            if (typeof effect === "number") {
                switch (effect) {
                    case 0:
                        curEffect = tween.Linear;
                        break;
                    case 1:
                        curEffect = tween.Circ.easeInOut;
                        break;
                    case 2:
                        curEffect = tween.Elastic.easeOut;
                        break;
                    case 3:
                        curEffect = tween.Back.easeOut;
                        break;
                    case 4:
                        curEffect = tween.Bounce.easeOut;
                        break;
                    case 5:
                        curEffect = tween.Expo.easeIn;
                        break;
                }
            } else if (effect instanceof Array) {
                if (effect.length === 2) {
                    curEffect = tween[effect[0]][effect[1]];
                }
            } else if (typeof effect === "function") {
                callback = effect;
            }
            var begin = {}, change = {};
            for (var key in target) {
                console.log()
                this.elements = [];
                this.elements[0] = curEle;
                begin[key] = this.css(key);
                change[key] = target[key] - begin[key];
            }
            var time = 0;
            var _this = this;
            curEle.timer = window.setInterval(function () {
                time += 10;
                if (time >= duration) {
                    _this.css(target);
                    window.clearInterval(curEle.timer);
                    callback && callback();
                    return;
                }
                for (var key in target) {
                    var curPos = curEffect(time, begin[key], change[key], duration);
                    _this.css(key, curPos);
                }
            }, 10);
        }
        return this;
    }
    // =========================事件=======================
    //->hover:鼠标移入、移出执行方法
    vQ.hover = function (mouseover, mouseout) {
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            curEle.onmouseover = mouseover;
            curEle.onmouseout = mouseout;
        }
        return this;
    }
    //->设置显示
    vQ.show = function () {
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            curEle.style.display = 'block';
        }
        return this;
    }
    //->设置隐藏
    vQ.hide = function () {
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            curEle.style.display = 'none';
        }
        return this;
    }
    //->鼠标点击执行方法
    vQ.click = function (fn) {
        for (var i = 0; i < this.elements.length; i++) {
            var curEle = this.elements[i];
            curEle.onclick = fn;
        }
        return this;
    }
    //->浏览器窗口改变执行方法
    vQ.resize = function (fn) {
        window.onresize = fn;
        return this;
    }
    //->指定元素相对窗口居中
    vQ.center = function () {
        var _this = this;

        function centerFn() {
            for (var i = 0; i < _this.elements.length; i++) {
                var curEle = _this.elements[i];
                var height = _this.css("height");
                var width = _this.css("width");
                var top = (_this.win("clientHeight") - height) / 2;
                var left = (_this.win("clientWidth") - width) / 2;
                curEle.style.top = top + "px";
                curEle.style.left = left + "px";
            }
        }

        centerFn();
        this.resize(centerFn);
        return this;
    }
    //->兼容IE6~8的DOM2级事件绑定
    vQ.on = function (type, fn) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var curEle = this.elements[i];
            if (flag) {
                curEle.addEventListener(type, fn, false);
            } else {
                if (!curEle["myEvent" + type]) {
                    curEle["myEvent" + type] = [];//创建事件池
                }
                var event = curEle["myEvent" + type];
                for (var j = 0, j_len = event.length; j < j_len; j++) {
                    var curFn = event[j];
                    if (fn === curFn) {
                        return;//如果重复，直接返回
                    }
                }
                event.push(fn);
                //->为行为绑定DOM0级方法,并传入e
                curEle["on" + type] = function (e) {
                    e = window.event;
                    e.target = e.srcElement;
                    e.pageX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
                    e.pageY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
                    e.preventDefault = function () {
                        e.returnValue = false;
                    }
                    e.stopPropagation = function () {
                        e.cancelBubble = true;
                    }
                    var event = this["myEvent" + e.type];
                    for (var i = 0, len = event.length; i < len; i++) {//顺序执行
                        event[i].call(this, e);//this问题
                    }
                }
            }
        }
        return this;
    }
    //->DOM2级解绑
    vQ.off = function (type, fn) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var curEle = this.elements[i];
            if (flag) {
                curEle.removeEventListener(type, fn, false)
            } else {
                var event = curEle["myEvent" + type];
                for (var j = 0; j < event.length; j++) {
                    var curFn = event[j];
                    if (fn === curFn) {
                        event.splice(j, 1);
                        j--;
                    }
                }
            }
        }
        return this;
    }
    //->HTML、DOM结构加载完成即执行
    vQ.ready = function (fn) {
        if (flag) {
            document.addEventListener("DomContentLoaded", function () {
                fn();
                document.removeEventListener("DomContentLoaded", arguments.callee, false);
            }, false);
        } else {
            var timer = window.setInterval(function () {
                try {
                    document.documentElement.doScroll("left");
                    fn();
                } catch (e) {
                }
            })
        }
    }
    //->插件
    vQ.extend = function (name, fn) {
        vQ[name] = fn;
    }
    window.$ = $;
}(window)

