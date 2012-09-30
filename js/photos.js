/*global jQuery*/

var setupPhotos = (function ($) {
    function setCookie(name,value,exdays){
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie=name + "=" + c_value;
    }
    function getCookie(name){
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==name){
                return unescape(y);
            }
        }
    }
    
    
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) {
                return callback(err);
            }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    
    function favAdd() {        
        var src = this.parentNode.firstChild.src;
        
        //Function to add to fav
        
        if(getCookie(src) == 'yes'){
            setCookie(src, 'no' );
            this.className = 'icon-heart-empty';                                     
            this.title = "Add to fav";
            
        }
        else{
            setCookie(src, 'yes' );
            this.className = 'icon-heart';                         
            this.title = "Delete from fav";
        }
        
        return false;
    }; 
    function favMouseOver() {        
        var src = this.parentNode.firstChild.src;
        
        this.style.fontSize = "24px";
        
        
        
    }
    function favMouseOut() {        
        var src = this.parentNode.firstChild.src;
        
        this.style.fontSize = "22px";
        

    }
    function favCreate(src){
        var addToFav = document.createElement('a');
                                        
        if(getCookie(src) == 'yes') {
            addToFav.className = 'icon-heart';                         
            addToFav.title = "Delete from fav";
        } else {
            addToFav.className = 'icon-heart-empty';                         
            addToFav.title = "Add to fav";
        }
        
        addToFav.href = '#';     
            
        addToFav.addEventListener("click", favAdd, false);                        
            
        addToFav.addEventListener("mouseover", favMouseOver, false);
        addToFav.addEventListener("mouseout", favMouseOut, false);
            
        return addToFav;
    }
    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
            var src = img.src;
            
            var elm = document.createElement('div');
            elm.className = 'photo';
            elm.appendChild(img);
                                    
            elm.appendChild(favCreate(src));
            
            holder.appendChild(elm);
        };
    }    

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) {
                return callback(err);
            }

            each(items.map(renderPhoto), imageAppender('photos'));                                    
            
            
            callback();
        });
        
        
    };
}(jQuery));
