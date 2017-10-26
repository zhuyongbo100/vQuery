var utils = (function(){
    var flag = "getComputedStyle" in window;

    //->makeArray:把类数组集合转换为数组
    function makeArray(likeAry) {
        if (flag) {
            return Array.prototype.slice.call(likeAry, 0);
        }
        var ary = [];
        for (var i = 0; i < likeAry.length; i++) {
            ary[ary.length] = likeAry[i];
        }
        return ary;
    }

   //->把JSON格式字符串转换为JSON格式对象
    function JSON(jsonStr){
        return "JSON" in window ?JSON.parse(jsonStr) :eval("("+jsonStr+")");
    }

    //->win:操作浏览器的盒子模型信息
    function win(attr,value){
        if(value == "undefined"){
            return document.documentElement[attr] || document.body[attr];
        }else{
            document.documentElement[attr] = value;
            document.body[attr] = value;
        }
    }

    //->offsetBody:获取页面中任意元素距离BODY的偏移
    function offsetBody(curEle){
        var par = curEle.offsetParent;
        var left = null,top = null;
        while(par){
            left += curEle.offsetLeft;
            top  += curEle.offsetTop;
            if(par.nodeName.toLowerCase() !== "body"){
                left += par.clientLeft;
                top  += par.clientTop;
            }
            curEle = par;
            par = curEle.offsetParent;
        }
        return {
            left:left,
            top:top
        }
    }

    //->children:获取所有的元素子节点
    function children(curEle,tag) {
        var ary =[];
        if(flag){
            ary = this.makeArray(curEle.children);
        }else{
            var childNodes = curEle.childNodes;
            for(var i = 0,len = childNodes.length; i<len; i++){
                var curNode = childNodes[i];
                if(curNode.nodeType === 1){
                    ary.push(curNode);
                }
            }
        }
        if(typeof tag != "undefined"){
            for(var j = 0; j < ary.length; j++) {
                var cur = ary[j];
                if(cur.nodeName !== tag.toUpperCase()){
                    ary.splice(j,1);
                    j--;
                }
            }
        }
        return ary;
    }

    //->prev:获取上一个哥哥元素节点
    function prev(curEle){
        var pre = null;
        if(flag){
            pre = curEle.previousElementSibling;
        }else{
            pre = curEle.previousSibling;
            while(pre && pre.nodeType !== 1){
                pre = curEle.previousSibling;
            }
        }
        return pre;
    }

    //->next:获取下一个弟弟元素节点
    function next(curEle){
        var next = null;
        if(flag){
            next = curEle.nextElementSibling;
        }else{
            next = curEle.nextSibling;
            while(next && next.nodeType !== 1){
                next = curEle.nextSibling;
            }
        }
        return next;
    }

    //->prevAll:获取所有的哥哥元素节点
    function prevAll(curEle){
        var ary = [];
        var pre = this.prev(curEle);
        while(pre){
            ary.unshift(pre);//unshift
            pre = this.prev(pre);
        }
        return ary;
    }
    function nextAll(curEle){
        var ary =[];
        var next = this.next(curEle);
        while(next){
            ary.push(next);
            next = this.next(next);
        }
        return ary;
    }

    //->sibling:获取相邻的两个元素节点
    function sibling(curEle){
        var ary =[];
        var pre = this.prev(curEle);
        var next = this.next(curEle);
        pre ?ary.push(pre) :null;
        next ?ary.push(next) :null;
        return ary;
    }

    //->siblings:获取所有的兄弟元素节点
    function siblings(curEle){
        var preAll = this.prevAll(curEle);
        var nextAll = this.nextAll(curEle);
        return preAll.concat(nextAll);
    }

    //->index:获取当前元素的索引
    function index(curEle){
        return this.prevAll(curEle).length;
    }

    //->firstChild:获取第一个元素子节点
    function firstChild(curEle){
        var children = this.children(curEle);
        return children.length > 0  ? children[0] :null;
    }

    //->lastChild:获取最后一个元素子节点
    function lastChild(curEle){
        var children = this.children(curEle);
        return children.length > 0 ? children[children.length-1] :null;
    }

    //->append:向指定容器的末尾追加元素
    function append(container,newEle){
        container.appendChild(newEle);
    }

    //->prepend:向指定容器的开头追加元素
    function prepend(container,newEle){
        var fir = this.firstChild(container);
        fir ? container.insertBefore(newEle,fir):container.appendChild(newEle);

    }

    //->insertBefore:把新元素(newEle)追加到指定元素(oldEle)的前面
    function insertBefore(newEle,oldEle){
        oldEle.parentNode.insertBefore(newEle,oldEle);
    }

    //->insertAfter:把新元素(newEle)追加到指定元素(oldEle)的后面
    function insertAfter(newEle,oldEle){
        var next = this.next(oldEle);
        next ? oldEle.parentNode.insertBefore(newEle,next): oldEle.parentNode.appendChild(newEle);
    }

    //->hasClass:验证当前元素中是否包含className这个样式类名
    function  hasClass(curEle,className){
        var cn = curEle.className;
        var reg = new RegExp("(^|\\s+)" + className + "(\\s+|$)");
        return reg.test(cn);
    }

    //->去除字符串首尾空格
    function trim(str){
        return str.replace(/^\s+|\s+$/g,"");
    }

    //->addClass:给元素增加样式类名
    function addClass(curEle,className){
        var cn = this.trim(className);
        var ary = cn.split(/\s+/);
        for(var i = 0,len = ary.length; i<len; i++){
            var curName = ary[i];
            if(!this.hasClass(curEle,curName)){
                curEle.className += " " + curName;
            }
        }
    }

    //->removeClass:给元素移除样式类名
    function removeClass(curEle,className){
        var cn = this.trim(className);
        var ary = cn.split(/\s+/);
        for(var i =0,len = ary.length; i<len; i++){
            var curName = ary[i];
            if(this.hasClass(curEle,curName)){
                curEle.className = curEle.className.replace(curName,"");
            }
        }
    }

    //->getElementsByClass:通过元素的样式类名获取一组元素集合
    function getElementsByClass(strClass,context){
        var context = context || document;
        var ary = [];
        var nodes = context.getElementsByTagName("*");
        if(flag){
            ary = this.makeArray(context.getElementsByClassName(strClass));
        }else{
            var scAry = this.trim(strClass).split(/\s+/);
            var isOk = null;
            for(var i = 0,len = nodes.length; i<len; i++){
                isOk = true;
                curNode = nodes[i];
                for(var j =0; j < scAry.length; j++){
                    curSc = scAry[j];
                    if(!this.hasClass(curNode,curSc)) {
                        isOk = false;
                        break;
                    }
                }
                isOk ? ary.push(curNode) :null;
            }

        }
        return ary;
    }

    //->getCss:获取元素的样式值
    function getCss(curEle,attr){
        if(flag){
            var val = window.getComputedStyle(curEle,null)[attr];
        }else{
            if(attr === "opacity"){
                var reg = /^alpha\(opacity=(\d+(\.\d+?:)?)\)$/;
                oldVal = curEle.currentStyle["filter"];
                val = oldVal.replace(reg,function(){
                    return parseFloat(arguments[1]/100);
                });
            }else{
                val = curEle.currentStyle[attr];
            }
        }
        if(/^(-?\d+(\.\d+)?)(px)?$/.test(val)){
            val = parseFloat(val);
        }
        return val;
    }

    //->setCss:给当前元素的某一个样式属性设置值(增加在行内样式上的)
    function setCss(curEle,attr, value){
        if(attr === "opacity"){
            curEle.style["opacity"] = value;
            curEle.style["alpha"] = "alpha(opacity=" + value*100 + ")";
            return;
        }
        if(attr === "float"){
            curEle.style["cssFloat"] = value;
            curEle.style["styleFloat"] = value;
            return;
        }
        var reg = /^width|height|top|bottom|left|right|((margin|padding)(Left|Top|Right|Bottom))$/;
        if(reg.test(attr)){
            if(!isNaN(value)){
                value +="px";
            }
        }
        curEle.style[attr] = value;
    }

    //->setGroupCss:给当前元素批量的设置样式属性值
    function setGroupCss(curEle,options){
        for(var key in options){
            this.setCss(curEle,key,options[key]);
        }
    }

    //->css:此方法实现了获取、单独设置、批量设置元素的样式值
    function css(curEle){
        var arg = [].slice.call(arguments);
        if(arg.length == 2){
            if(typeof arg[1] === "string") {
                return this.getCss(curEle, arg[1]);
            }
            if(Object.prototype.toString.call(arg[1]) === "[object Object]"){
                this.setGroupCss(curEle,arg[1]);
            }
        }
        if(arg.length === 3){
            this.setCss(curEle,arg[1],arg[2]);
        }

    }
    return {
        makeArray:makeArray,
        JSON:JSON,
        win:win,
        offsetBody:offsetBody,
        children:children,
        prev:prev,
        next:next,
        prevAll:prevAll,
        nextAll:nextAll,
        sibling:sibling,
        siblings:siblings,
        index:index,
        firstChild:firstChild,
        lastChild:lastChild,
        append:append,
        prepend:prepend,
        insertBefore:insertBefore,
        insertAfter:insertAfter,
        hasClass:hasClass,
        trim:trim,
        addClass:addClass,
        removeClass:removeClass,
        getElementsByClassName:getElementsByClass,
        getCss:getCss,
        setCss:setCss,
        setGroupCss:setGroupCss,
        css:css,
    }
})();