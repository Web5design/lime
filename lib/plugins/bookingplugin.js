(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.BookingPlugin = (function(_super) {
    __extends(BookingPlugin, _super);

    function BookingPlugin() {
      _ref = BookingPlugin.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BookingPlugin.prototype.init = function() {
      var annotation, _i, _len, _ref1, _ref2, _results;
      this.name = 'BookingPlugin';
      annotation = void 0;
      console.info("Initialize BusinessPlugin");
      _ref1 = this.lime.annotations;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        annotation = _ref1[_i];
        if (annotation.resource.value.indexOf("#BusinessEntity") > 0 && ((_ref2 = annotation.relation.value) === 'http://connectme.at/ontology#explicitlyShows' || _ref2 === 'http://connectme.at/ontology#explicitlyMentions' || _ref2 === 'http://connectme.at/ontology#implicitlyShows' || _ref2 === 'http://connectme.at/ontology#implicitlyMentions' || _ref2 === 'http://connectme.at/ontology#hasContent')) {
          _results.push(this.handleAnnotation(annotation));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    BookingPlugin.prototype.handleAnnotation = function(annotation) {
      var domain, nonConcept, url, widget,
        _this = this;
      $.getJSON("http://smart-ip.net/geoip-json?callback=?", function(data) {
        return _this.clientIP = data.host;
      });
      this.getGRData(annotation);
      nonConcept = annotation.resource.value;
      if (nonConcept.length >= 3) {
        url = annotation.resource.value;
        domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0].replace('www.', '');
        widget = this.lime.allocateWidgetSpace(this, {
          thumbnail: "img/shop.png",
          title: "" + domain + " offer",
          type: "BusinessWidget",
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
          return _this.expandWidget(annotation, _this.getModalContainer());
        });
        annotation.widgets[this.name] = widget;
        jQuery(annotation).bind("becomeActive", function(e) {
          var error, eventActiveLabel, eventCategory;
          if (annotation.goodRelationsDataResource) {
            if (annotation.goodRelationsDataResource.length > 0) {
              try {
                eventActiveLabel = e.target.widgets[_this.name].options.title;
                eventCategory = _this.name;
                _gaq.push(['_trackEvent', eventCategory, 'becameActive', eventActiveLabel]);
              } catch (_error) {
                error = _error;
              }
              return annotation.widgets[_this.name].setActive();
            }
          }
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
        jQuery(widget).bind("downarrow", function(e) {
          _this.bookingtabsiterator = 3 === _this.bookingtabsiterator + 1 ? 0 : _this.bookingtabsiterator + 1;
          if (_this.bookingtabsiterator === 0) {
            jQuery("#businessWho").trigger('click');
            jQuery("#businessWho").addClass('selected');
          }
          if (_this.bookingtabsiterator === 1) {
            jQuery("#businessWhat").trigger('click');
            jQuery("#businessWhat").addClass('selected');
          }
          if (_this.bookingtabsiterator === 2) {
            jQuery("#businessWhere").trigger('click');
            return jQuery("#businessWhere").addClass('selected');
          }
        });
      }
      return jQuery(widget).bind("uparrow", function(e) {
        _this.bookingtabsiterator = _this.bookingtabsiterator === 0 ? 2 : _this.bookingtabsiterator - 1;
        jQuery('.videotab.selected').removeClass('selected');
        if (_this.bookingtabsiterator === 0) {
          jQuery("#businessWho").trigger('click');
          jQuery("#businessWho").addClass('selected');
        }
        if (_this.bookingtabsiterator === 1) {
          jQuery("#businessWhat").trigger('click');
          jQuery("#businessWhat").addClass('selected');
        }
        if (_this.bookingtabsiterator === 2) {
          jQuery("#businessWhere").trigger('click');
          return jQuery("#businessWhere").addClass('selected');
        }
      });
    };

    BookingPlugin.prototype.getGRData = function(annotation) {
      var _this = this;
      return this.lime.cmf.getGRDataForTerm(annotation.resource.value, function(err, res) {
        if (err) {
          return console.warn("Error getting CMF Good Relations resources", err);
        } else {
          annotation.goodRelationsDataResource = _(res).map(function(resultset) {
            var entity;
            entity = {
              name: resultset.name.value,
              street: resultset.street.value,
              pcode: Number(resultset.pcode.value),
              city: resultset.city.value,
              country: resultset.country.value,
              telephone: resultset.telephone.value,
              email: resultset.email.value,
              description: resultset.description.value,
              geoLat: Number(resultset.geoLat.value),
              geoLong: Number(resultset.geoLong.value),
              priceValue: Number(resultset.pricevalue.value),
              priceCurrency: resultset.pricecurrency.value,
              product: resultset.product.value
            };
            return entity;
          });
          return annotation.getGRDataResource = function() {
            return this.goodRelationsDataResource;
          };
        }
      });
    };

    BookingPlugin.prototype._htmlEncode = function(str) {
      return str.replace(/[&<>"']/g, function($0) {
        return "&" + {
          "&": "amp",
          "<": "lt",
          ">": "gt",
          '"': "quot",
          "'": "#39"
        }[$0] + ";";
      });
    };

    BookingPlugin.prototype.expandWidget = function(annotation, outputElement) {
      var businessData, lime, modalContent, resource, result, startTime,
        _this = this;
      modalContent = jQuery(outputElement);
      modalContent.css("width", "600px");
      modalContent.css("height", "auto");
      lime = this.lime;
      resource = "";
      resource = annotation.resource.value;
      startTime = new Date().getTime();
      businessData = annotation.getGRDataResource();
      if (businessData.length) {
        if (businessData.length > 0) {
          result = "<div id=\"bookingWidgetExpanded\" style=\"position: relative; z-index: 900; width: 600px; height: 600px; background-color: transparent;\">\n<div id=\"forthTile\" style=\"position: relative; float: left; width: 300px; height: 300px;\">\n<div style=\"width: 100%; position: relative; height: 30px; font-size: 20px; color: #00BFFF; background-color: #696969;\">\n" + businessData[0].name + "\n</div>\n<div style=\"width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;\">\n" + businessData[0].street + ", " + businessData[0].pcode + " " + businessData[0].city + ", " + businessData[0].country + "\n</div>\n<div style=\"width: 100%; position: relative; height: 20px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;\">\n " + businessData[0].telephone + "\n</div>\n<div style=\"width: 100%; position: relative; height: 170px; font-size: 16px; background-color: #303030; color: #f1f1f1; overflow-y: scroll;\">\nÜber uns<br>\n" + businessData[0].description + "\n</div>\n<div class=\"businessContact\"  style=\"cursor: hand; cursor: pointer; width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);\">\nkontaktieren Sie uns\n</div>\n</div>\n\n<div id=\"secondTile\" style=\"width: 300px; height: 300px; position: relative; float: left; display: none;\">\n<div id=\"businessName\" style=\"width: 100%; position: relative; height: 30px; font-size: 20px; color: #FA8072; background-color: #696969;\">\n " + businessData[0].name + "\n</div>\n<div id=\"businessAddress\" style=\"width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;\">\n " + businessData[0].street + ", " + businessData[0].pcode + " " + businessData[0].city + ", " + businessData[0].country + "\n</div>\n<div id=\"businessTelephone\" style=\"width: 100%; position: relative; height: 20px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;\">\n " + businessData[0].telephone + "\n</div>\n<div id=\"businessService\" style=\"width: 100%; position: relative; height: 110px; background-color: #ffffff;\">\n<div id=\"businessService1\" style=\"width: 100%; height: 80px; font-size: 16px; background-color: #696969; position: relative; overflow-y: scroll;\">\n " + businessData[0].product + "\n</div>\n<div id=\"businessService2\" style=\"width: 100%; height: 30px; font-size: 16px; background-color: #303030; position: relative;\">\n " + businessData[0].priceValue + " " + businessData[0].priceCurrency + "\n</div>\n<div id=\"businessService3\" style=\"width: 100%; height: 20px; position: relative; display: none;\">\nService 3 - Price XXXX EUR\n</div>\n<div id=\"businessService4\" style=\"width: 100%; height: 20px; position: relative; display: none;\">\nService 4 - Price XXXX EUR\n</div>\n<div id=\"businessService5\" style=\"width: 100%; height: 20px; position: relative; display: none;\">\nService 5 - Price XXXX EUR\n</div>\n</div>\n<div id=\"businessOpeningHours\" style=\"width: 100%; position: relative; height: 60px; background-color: #303030; color: #f1f1f1;\">\n\n</div>\n  <div class=\"businessContact\" style=\"cursor: hand; cursor: pointer; width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);\">\nkontaktieren Sie uns\n  </div>\n</div>\n\n<div id=\"firstTile\" style=\"position: relative; float: left; width: 300px; height: 300px; display: none;\">\n<div style=\"width: 100%; position: relative; height: 30px; font-size: 20px; background-color: #696969; color: #90EE90;\">\n" + businessData[0].name + "\n</div>\n<div id=\"map\" style=\"width: 100%; height: 270px; position: absolute; z-index: 900; height: 89%; background-color: green;\"></div>\n</div>\n\n<div id=\"thirdTile\" style=\"width: 298px; height: 300px; float: left; position: relative; border-left:dotted 1px #bbbbbb\">\n<div id=\"businessWho\" class=\"bookingtab\" style=\"cursor: hand; cursor: pointer; width: 98%; height: 98px; position: relative; float: left; background-color: #696969; color: #00BFFF; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb\" >\nWie?\n<div id=\"businessWhoLabel\" style=\"cursor: hand; cursor: pointer; position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;\">\nÜber uns\n</div>\n</div>\n<div id=\"businessWhat\" class=\"bookingtab\" style=\"cursor: hand; cursor: pointer; width: 98%; height: 98px; float: left; position: relative; background-color: #696969; color: #FA8072; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb\">\nWas?\n<div id=\"businessWhatLabel\" style=\"cursor: hand; cursor: pointer; position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;\">\nUnser Angebot\n</div>\n</div>\n<div id=\"businessWhere\" class=\"bookingtab\" style=\"cursor: hand; cursor: pointer; width: 98%; height: 100px; position: relative; float: left; background-color: #696969; color: #90EE90; font-size: 49px; border-bottom:dotted 1px #bbbbbb; border-right:dotted 1px #bbbbbb\">\nWo?\n<div id=\"businessWhereLabel\" style=\"cursor: hand; cursor: pointer; position: absolute; z-index: 900; width: 100%; height: 50%; left: 0px; bottom: 0px; font-size: 14pt; color: white; background-color: #303030;\">\nReiseroute Karte\n</div>\n</div>\n</div>\n\n</div>\n";
          modalContent.append(result);
          this.bookingtabsiterator = 0;
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
          jQuery(".businessContact").click(function() {
            var bemail, bname, grdata, time;
            jQuery(".businessContact").text("Danke schön!");
            grdata = annotation.getGRDataResource();
            if (grdata.length) {
              if (grdata.length > 0) {
                time = jQuery.now();
                bemail = grdata[0].email;
                bname = grdata[0].name;
                return jQuery.post('http://devserver.sti2.org/connectme/logger.php?', {
                  entry: "        <div  style=\"width: 100%; position: relative; float: left; background-color: #e1e1e1; height: 30px; border-bottom: 1px dotted #696969;\" class=\"item\">\n        <div style=\"height: 100%; color: #32CD32; font-size: 16pt; background-color: #505050; width: 30px; text-align: center; position: relative; float: left;\" class=\"icon\">\n        @</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"ip\">\n" + _this.clientIP + "</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"email\">\n" + bemail + "l</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"name\">\n" + bname + "</div>\n            <div style=\"width: 200px; height: 100%; position: relative; float: left; font-size: 16px; text-align: center; border-right: 1px dotted #696969;\" class=\"time\">\n" + time + "</div>\n            </div>"
                }, function(data) {});
              }
            }
          });
          jQuery("#businessWho").click(function() {
            jQuery('.bookingtab.selected').removeClass('selected');
            jQuery("#businessWho").addClass("selected");
            jQuery("#forthTile").css("display", "block");
            jQuery("#firstTile").css("display", "none");
            jQuery("#secondTile").css("display", "none");
            return jQuery("#map").empty();
          });
          jQuery("#businessWhat").click(function() {
            jQuery('.bookingtab.selected').removeClass('selected');
            jQuery("#businessWhat").addClass("selected");
            jQuery("#forthTile").css("display", "none");
            jQuery("#firstTile").css("display", "none");
            jQuery("#secondTile").css("display", "block");
            return jQuery("#map").empty();
          });
          jQuery("#businessWhere").click(function() {
            jQuery('.bookingtab.selected').removeClass('selected');
            jQuery("#businessWhere").addClass("selected");
            jQuery("#forthTile").css("display", "none");
            jQuery("#firstTile").css("display", "block");
            jQuery("#secondTile").css("display", "none");
            if (navigator.geolocation) {
              return navigator.geolocation.getCurrentPosition((function(position) {
                var destination, directionDisplay, directionsDisplay, directionsService, grdata, i, latitude, locationName, longitude, map, mapOptions, myOptions, output, request, start, x, xmlDoc, xmlhttp;
                i = void 0;
                locationName = "Planai - Hochwurzen";
                latitude = 47.392887;
                longitude = 13.693318;
                map = void 0;
                myOptions = void 0;
                output = void 0;
                x = void 0;
                xmlDoc = void 0;
                xmlhttp = void 0;
                start = void 0;
                destination = void 0;
                directionDisplay = void 0;
                directionsService = new google.maps.DirectionsService();
                grdata = annotation.getGRDataResource();
                if (grdata.length) {
                  if (grdata.length > 0) {
                    latitude = grdata[0].geoLat;
                    longitude = grdata[0].geoLong;
                  }
                }
                output = document.getElementById("map");
                directionsDisplay = new google.maps.DirectionsRenderer();
                destination = new google.maps.LatLng(latitude, longitude);
                mapOptions = {
                  zoom: 7,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  center: destination
                };
                map = new google.maps.Map(output, mapOptions);
                start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                directionsDisplay.setMap(map);
                this.geomap = map;
                request = {
                  origin: start,
                  destination: destination,
                  travelMode: google.maps.TravelMode.DRIVING
                };
                return directionsService.route(request, function(result, status) {
                  if (status === google.maps.DirectionsStatus.OK) {
                    return directionsDisplay.setDirections(result);
                  }
                });
              }), function(error) {
                switch (error.code) {
                  case error.TIMEOUT:
                    return alert("Timeout");
                  case error.POSITION_UNAVAILABLE:
                    return alert("Position unavailable");
                  case error.PERMISSION_DENIED:
                    return alert("Permission denied");
                  case error.UNKNOWN_ERROR:
                    return alert("Unknown error");
                }
              });
            }
          });
          return jQuery("#businessWho").trigger("click");
        }
      }
    };

    return BookingPlugin;

  })(window.LimePlugin);

}).call(this);
