(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.DBPediaInfoForTVPlugin = (function(_super) {
    __extends(DBPediaInfoForTVPlugin, _super);

    function DBPediaInfoForTVPlugin() {
      _ref = DBPediaInfoForTVPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DBPediaInfoForTVPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'DBPediaInfoForTVPlugin';
      console.info("Initialize " + this.name);
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("dbpedia") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DBPediaInfoForTVPlugin.prototype.handleAnnotation = function(annotation) {
      var _this = this;
      return annotation.entityPromise.done(function() {
        var nonConcept, widget;
        nonConcept = annotation.getDescription();
        nonConcept = nonConcept.replace("No description found.", "");
        if (nonConcept.length >= 3) {
          widget = _this.lime.allocateWidgetSpace(_this, {
            thumbnail: "img/info.png",
            title: "" + (annotation.getLabel()) + " Info",
            type: "DbpediaInfoForTVWidget",
            sortBy: function() {
              return 10000 * annotation.start + annotation.end;
            }
          });
          widget.annotation = annotation;
          jQuery(widget).bind('activate', function(e) {
            var error, eventCategory, eventClickedLabel;
            try {
              eventClickedLabel = e.target.options.title;
              eventCategory = _this.name;
              _gaq.push(['_trackEvent', eventCategory, 'clicked', eventClickedLabel]);
            } catch (_error) {
              error = _error;
            }
            return _this.showAbstractInModalWindow(annotation, _this.getModalContainer());
          });
          annotation.widgets[_this.name] = widget;
          jQuery(annotation).bind("becomeActive", function(e) {
            var error, eventActiveLabel, eventCategory;
            try {
              eventActiveLabel = e.target.widgets[_this.name].options.title;
              eventCategory = _this.name;
              _gaq.push(['_trackEvent', eventCategory, 'becameActive', eventActiveLabel]);
            } catch (_error) {
              error = _error;
            }
            return annotation.widgets[_this.name].setActive();
          });
          jQuery(annotation).bind("becomeInactive", function(e) {
            var error, eventActiveLabel, eventCategory;
            try {
              eventActiveLabel = e.target.widgets[_this.name].options.title;
              eventCategory = _this.name;
              _gaq.push(['_trackEvent', eventCategory, 'becomeInactive', eventActiveLabel]);
            } catch (_error) {
              error = _error;
            }
            return annotation.widgets[_this.name].setInactive();
          });
          _this.getLSIImages(annotation);
          jQuery(widget).bind("leftarrow", function(e) {
            return jQuery("#lefticon").trigger('click');
          });
          return jQuery(widget).bind("rightarrow", function(e) {
            return jQuery("#righticon").trigger('click');
          });
        }
      });
    };

    DBPediaInfoForTVPlugin.prototype.getLSIImages = function(annotation) {
      var _this = this;
      return this.lime.cmf.getLSIImagesForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting LSI images resources", err);
        } else {
          console.info("LSI resources for", annotation, res);
          annotation.lsiImageResources = _(res).map(function(resultset) {
            var entity;
            entity = {
              image: resultset.image.value
            };
            return entity;
          });
          return annotation.getLsiImagesResources = function() {
            return this.lsiImageResources;
          };
        }
      });
    };

    DBPediaInfoForTVPlugin.prototype.showAbstractInModalWindow = function(annotation, outputElement) {
      var comment, depiction, i, label, lime, lsiImageList, maintext, modalContent, n, page, pagetext, result, startTime, textsum, tmptext, word, _i, _len,
        _this = this;
      modalContent = jQuery(outputElement);
      modalContent.css("width", "450px");
      modalContent.css("height", "auto");
      this.index = 0;
      startTime = new Date().getTime();
      label = annotation.getLabel();
      page = annotation.getPage();
      /*
      -- added 29.apr.2013 --
       LSIimages = list of images from the LSI that target the current annotation's DBPedia resource URI
       example:
       LAIImages = annotation.getLSIVideosFromTerm (annotation.resource.value,cb)
      
      a LSIImages can have the following structure:
      LSIImages = [
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
      
                    {
                    image:"imageURI",
                    hasKeyword: {"DBPedia resource URI 1", "DBPedia resource URI 2", "DBPedia resource URI 3", ... }
                    },
                    ...
                  ]
      */

      lime = this.lime;
      comment = annotation.getDescription();
      maintext = comment;
      pagetext = [];
      if (maintext.length >= 260) {
        n = maintext.length;
        if (maintext.length >= 260) {
          tmptext = maintext.split(" ");
          n = tmptext.length;
          textsum = "";
          i = 0;
          for (_i = 0, _len = tmptext.length; _i < _len; _i++) {
            word = tmptext[_i];
            if (textsum.length < 260) {
              textsum += word + " ";
            } else {
              pagetext.push(textsum);
              textsum = "";
            }
          }
          maintext = pagetext[0];
        }
      }
      console.log(pagetext);
      depiction = annotation.getDepiction({
        without: 'thumb'
      });
      if (depiction === null) {
        depiction = "img/noimagenew.png";
      }
      lsiImageList = (typeof annotation.getLsiImagesResources === "function" ? annotation.getLsiImagesResources() : void 0) || [];
      console.log("Asociated images ", label, lsiImageList);
      /*
        -- added 29.apr.2013 --
        Extend interface logic (below) to fit LSIImages by creating a new tile with 1 or more images
      */

      if (pagetext.length < 1) {
        result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255); font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: rgb(82, 207, 255); height: auto;\">\n         Info</div>\n         <div id=\"infoMainTextContent\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + maintext + "\n         </div>\n         </div>\n         </div>";
        /*
        result = """
                 <div id="infoWidgetExpanded" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                 <span id="infoMainTextContent" >#{maintext}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; right: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png');"></div>
                 </div>
        
                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="text-align:center; position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>
        
                 </div>
                 """
        */

      } else {
        /*
        result = """
                 <div id="infoWidgetExpanded" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; position: relative; height: 600px; width: auto; ">
                 <div id="infoMainText" style="position: relative; float: right; background-color: #242424; width: 300px; height: 300px; font-family: caviardreamsregular;">
                 <span id="infoMainTextContent" >#{pagetext[@index]}</span>
                 <div style="position: absolute; z-index: 900; width: 100px; height: 50px; left: 0px; bottom: 0px; background-repeat: no-repeat; background-position: center center; background-size: contain; background-image: url('img/120px-DBpediaLogo.svg.png'); background-color: #3f3e3e;"></div>
                 <div id="pageNumber" style="position: absolute; z-index: 900; width: 50px; height: 35px; left: 135px; bottom: 0px; background: transparent;">#{@index+1}/#{pagetext.length}</div>
                 <div id="righticon" unselectable="on" style=" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">&gt;</span>
                 </div>
                 </div>
        
                 <div id="infoMainPicture" style="position: relative; float: right; width: 300px; height: 300px; background-color: #6ab1e7;">
                 <div id="pic" style="position: relative; float: left; height: 100%; background-image: url('#{depiction}'); background-repeat: no-repeat; background-position: center center; background-size: cover; width: 100%;">
                 <div id="icon" style="border-right: 1px dotted lightgray; float: left; background-color: #3f3e3e; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">i</span>
                 </div>
                 <div id="lefticon" unselectable="on" style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;">
                 <span style="position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(112, 196, 243);">&lt;</span>
                 </div>
                 </div>
                 <div style="position: absolute; left: 0px; bottom: 0; width: 300px; height: 100px;">
                 <div id="titlebackground" style="float: left; position: absolute; z-index: 900; width: 100%; bottom: 0px; background-color: #000000; left: 0px; top: 0px; height: 100%; opacity: 0.5;">
                 </div>
                 <span id="titletext" style="text-align:center; font-family: CaviarDreamsBold; font-size: 29px; line-height: 140%; position: absolute; z-index: 900; left: 5px; width: 100%; bottom: 0px; height: 100%; color: #fcf7f7; opacity: 1.0;">#{label}</span></div>
                 </div>
        
        
                 </div>
                 """
        */

        result = "         <div id=\"ifoWidgetExpanded\" style=\"border: 1px dotted lightgray; position: relative;height: auto; width: 100%;\">\n         <div id=\"infoWidget\" style=\"background-color: rgba(37, 37, 37, 0.7); height: 40px; left: 0px; width: 100%; position: relative; float: left;\">\n         <div class=\"infoWidgeticon\" style=\"border-right: 1px dotted lightgray; position: relative; height: 100%; float: left; background-color: #3f3e3e; width: 8%;\">\n         <span data-dojo-type=\"shapes.Text\" id=\"iconLabel\" style=\"font: Times; position: relative; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255); font-family: 'Times New Roman',Times,serif; font-style: italic;\">i</span>\n         </div>\n         <div class=\"infoWidgetTitle\" style=\"font: Arial; position: relative; float: left; height: 100%; width: 86%; font-family: Arial,Helvetica,sans-serif; font-size: 26px; color: white; font-weight: normal; text-align: left; vertical-align: middle; text-indent: 1em; line-height: 140%;\">\n" + label + "</div>\n         </div>\n         <div id=\"infoText\" style=\"padding: 10px; position: relative; float: left; background-color: rgba(68, 68, 68, 0.7); height: auto; font-style: normal; width: 96%;\">\n         <div id=\"infoTextBioTitle\" style=\"font: Helvetica; position: relative; float: left; width: 100%; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: rgb(82, 207, 255); height: auto;\">\n         Info</div>\n           <div id=\"infoMainTextContent\" style=\"font: Helvetica; font-family: Arial,Helvetica,sans-serif; font-size: 18px; color: #f1f1f1; float: left; line-height: normal; position: relative; height: auto; width: 100%;\">\n" + pagetext[this.index] + "\n           </div>\n         <div id=\"widgetControler\" style=\"position: relative; height: 60px; width: 100%; float:left\">\n         </div>\n\n         <div id=\"righticon\" unselectable=\"on\" style=\" -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;cursor: hand; cursor: pointer; border-right: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; right: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255);\">&gt;</span>\n         </div>\n         <div id=\"lefticon\" unselectable=\"on\" style=\"-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: hand; cursor: pointer; display: none; border-left: 1px dotted lightgray; background-color: #000000; position: absolute; z-index: 9000; left: 0px; bottom: 0px; width: 50px; height: 50px;\">\n         <span style=\"position: relative; font-family: 'Times New Roman',Times,serif; font-style: italic; font-weight: bold; font-size: 23px; top: 21%; left: 45%; color: rgb(82, 207, 255);\">&lt;</span>\n         </div>\n         <div id=\"pageNumber\" style=\"position: absolute; z-index: 900; width: 50px; height: 35px; left: 45%; bottom: 0px; background: transparent;\">" + (this.index + 1) + "/" + pagetext.length + "</div>\n        </div>\n        </div>";
      }
      modalContent.append(result);
      jQuery(".close").click(function(e) {
        var endTime, error, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        try {
          _gaq.push(['_trackEvent', _this.name, 'viewed', eventLabel, timeSpent]);
          return _gaq.push(['_trackTiming', _this.name, eventLabel, timeSpent, 'viewed']);
        } catch (_error) {
          error = _error;
        }
      });
      jQuery('#mask').click(function(e) {
        var endTime, error, eventLabel, timeSpent;
        endTime = new Date().getTime();
        timeSpent = endTime - startTime;
        eventLabel = annotation.widgets[_this.name].options.title;
        try {
          _gaq.push(['_trackEvent', _this.name, 'viewed', eventLabel, timeSpent]);
          return _gaq.push(['_trackTiming', _this.name, eventLabel, timeSpent, 'viewed']);
        } catch (_error) {
          error = _error;
        }
      });
      jQuery('#righticon').click(function() {
        _this.index++;
        if (_this.index === 1) {
          jQuery('#lefticon').css("display", "block");
        }
        if (_this.index >= pagetext.length - 1) {
          _this.index = pagetext.length - 1;
          jQuery('#righticon').css("display", "none");
        }
        maintext = pagetext[_this.index];
        jQuery("#infoMainTextContent").text(maintext);
        return jQuery("#pageNumber").text("" + (_this.index + 1) + "/" + pagetext.length);
      });
      return jQuery('#lefticon').click(function() {
        _this.index--;
        if (_this.index === pagetext.length - 2) {
          jQuery('#righticon').css("display", "block");
        }
        if (_this.index <= 0) {
          _this.index = 0;
          jQuery('#lefticon').css("display", "none");
        }
        maintext = pagetext[_this.index];
        jQuery("#infoMainTextContent").text(maintext);
        return jQuery("#pageNumber").text("" + (_this.index + 1) + "/" + pagetext.length);
      });
    };

    return DBPediaInfoForTVPlugin;

  })(window.LimePlugin);

}).call(this);
