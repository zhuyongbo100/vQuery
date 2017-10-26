~function(){
    var ajax = function(options){
        var xhr = null;
        var creatXHR = function () {
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
                    creatXHR = cur;
                    break;
                } catch (e) {
                }
            }
            return xhr;
        }
        var sendAjax = function(options){
            var _defaults = {
                url:"",
                type:"get",
                data:null,
                async:true,
                timeout:null,
                dataType:"json",
                cache:false,
                getHead:null,
                success:null,
            }
            for(var key in options){
                _defaults[key] = options[key];
            }
            var xhr = creatXHR();
            function params(data){
                var ary =[];
                for(var key in data){
                    ary.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                }
                return ary.join("&");
            }
            if(_defaults["type"].toLowerCase() ==="get" && _defaults["cache"] == false){
                var suffix = _defaults["url"].indexOf("?") > -1 ? "&" : "?";
                if(_defaults["data"]){
                    _defaults["url"] += suffix + params(_defaults["data"]) + "&_=" + Math.random();
                }else{
                    _defaults["url"] += suffix + "_=" + Math.random();
                }
            }
            if(_defaults["type"].toLowerCase() === "post"){
                sendData = _defaults["data"] ? params(_defaults["data"]):null;
            }
            if(_defaults["timeout"]){
                xhr.timeout = _defaults["timeout"];
            }
            xhr.open(_defaults["type"],_defaults["url"],_defaults["async"]);
            if(_defaults["type"].toLowerCase() === "post"){
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            xhr.onreadystatechange = function(){
                if(xhr.readyState ===  2){
                    if(typeof _defaults["getHead"] === "function"){
                        _defaults["getHead"].call(xhr);
                    }
                }
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        var val = xhr.responseText;
                        if(_defaults["dataType"] === "json"){
                            val = utils.JSON(val);
                        }
                        if(typeof _defaults["success"] === "function"){
                            _defaults["success"].call(xhr,val);
                        }
                    }
                }
            }
            xhr.send(null);
        }
        sendAjax(options);
    }
    window.ajax = ajax;
}();