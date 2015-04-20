(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var YList;

YList = (function() {
  function YList(list) {
    if (list == null) {
      this._list = [];
    } else if (list.constructor === Array) {
      this._list = list;
    } else {
      throw new Error("Y.List expects an Array as a parameter");
    }
  }

  YList.prototype._name = "List";

  YList.prototype._getModel = function(types, ops) {
    if (this._model == null) {
      this._model = new ops.ListManager(this).execute();
      this._model.insert(0, this._list);
    }
    delete this._list;
    return this._model;
  };

  YList.prototype._setModel = function(_model) {
    this._model = _model;
    return delete this._list;
  };

  YList.prototype.val = function() {
    return this._model.val.apply(this._model, arguments);
  };

  YList.prototype.ref = function() {
    return this._model.ref.apply(this._model, arguments);
  };

  YList.prototype.observe = function() {
    this._model.observe.apply(this._model, arguments);
    return this;
  };

  YList.prototype.unobserve = function() {
    this._model.unobserve.apply(this._model, arguments);
    return this;
  };

  YList.prototype.insert = function(position, content) {
    if (typeof position !== "number") {
      throw new Error("Y.List.insert expects a Number as the first parameter!");
    }
    this._model.insert(position, [content]);
    return this;
  };

  YList.prototype.insertContents = function(position, contents) {
    if (typeof position !== "number") {
      throw new Error("Y.List.insert expects a Number as the first parameter!");
    }
    this._model.insert(position, contents);
    return this;
  };

  YList.prototype["delete"] = function(position, length) {
    this._model["delete"](position, length);
    return this;
  };

  YList.prototype.push = function(content) {
    this._model.push(content);
    return this;
  };

  return YList;

})();

if (typeof window !== "undefined" && window !== null) {
  if (window.Y != null) {
    window.Y.List = YList;
  } else {
    throw new Error("You must first import Y!");
  }
}

if (typeof module !== "undefined" && module !== null) {
  module.exports = YList;
}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkg6XFxHaXRIdWJcXHktbGlzdFxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiSDpcXEdpdEh1YlxceS1saXN0XFxsaWJcXHktbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLEtBQUE7O0FBQUE7QUFNZSxFQUFBLGVBQUMsSUFBRCxHQUFBO0FBQ1gsSUFBQSxJQUFPLFlBQVA7QUFDRSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBVCxDQURGO0tBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxXQUFMLEtBQW9CLEtBQXZCO0FBQ0gsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQVQsQ0FERztLQUFBLE1BQUE7QUFHSCxZQUFVLElBQUEsS0FBQSxDQUFNLHdDQUFOLENBQVYsQ0FIRztLQUhNO0VBQUEsQ0FBYjs7QUFBQSxrQkFRQSxLQUFBLEdBQU8sTUFSUCxDQUFBOztBQUFBLGtCQVVBLFNBQUEsR0FBVyxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7QUFDVCxJQUFBLElBQU8sbUJBQVA7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixJQUFoQixDQUFrQixDQUFDLE9BQW5CLENBQUEsQ0FBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxDQUFmLEVBQWtCLElBQUMsQ0FBQSxLQUFuQixDQURBLENBREY7S0FBQTtBQUFBLElBR0EsTUFBQSxDQUFBLElBQVEsQ0FBQSxLQUhSLENBQUE7V0FJQSxJQUFDLENBQUEsT0FMUTtFQUFBLENBVlgsQ0FBQTs7QUFBQSxrQkFpQkEsU0FBQSxHQUFXLFNBQUUsTUFBRixHQUFBO0FBQ1QsSUFEVSxJQUFDLENBQUEsU0FBQSxNQUNYLENBQUE7V0FBQSxNQUFBLENBQUEsSUFBUSxDQUFBLE1BREM7RUFBQSxDQWpCWCxDQUFBOztBQUFBLGtCQW9CQSxHQUFBLEdBQUssU0FBQSxHQUFBO1dBQ0gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixJQUFDLENBQUEsTUFBbkIsRUFBMkIsU0FBM0IsRUFERztFQUFBLENBcEJMLENBQUE7O0FBQUEsa0JBdUJBLEdBQUEsR0FBSyxTQUFBLEdBQUE7V0FDSCxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLElBQUMsQ0FBQSxNQUFuQixFQUEyQixTQUEzQixFQURHO0VBQUEsQ0F2QkwsQ0FBQTs7QUFBQSxrQkEyQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBaEIsQ0FBc0IsSUFBQyxDQUFBLE1BQXZCLEVBQStCLFNBQS9CLENBQUEsQ0FBQTtXQUNBLEtBRk87RUFBQSxDQTNCVCxDQUFBOztBQUFBLGtCQStCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFsQixDQUF3QixJQUFDLENBQUEsTUFBekIsRUFBaUMsU0FBakMsQ0FBQSxDQUFBO1dBQ0EsS0FGUztFQUFBLENBL0JYLENBQUE7O0FBQUEsa0JBd0NBLE1BQUEsR0FBUSxTQUFDLFFBQUQsRUFBVyxPQUFYLEdBQUE7QUFDTixJQUFBLElBQUcsTUFBQSxDQUFBLFFBQUEsS0FBcUIsUUFBeEI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLHdEQUFOLENBQVYsQ0FERjtLQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxRQUFmLEVBQXlCLENBQUMsT0FBRCxDQUF6QixDQUZBLENBQUE7V0FHQSxLQUpNO0VBQUEsQ0F4Q1IsQ0FBQTs7QUFBQSxrQkE4Q0EsY0FBQSxHQUFnQixTQUFDLFFBQUQsRUFBVyxRQUFYLEdBQUE7QUFDZCxJQUFBLElBQUcsTUFBQSxDQUFBLFFBQUEsS0FBcUIsUUFBeEI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLHdEQUFOLENBQVYsQ0FERjtLQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxRQUFmLEVBQXlCLFFBQXpCLENBRkEsQ0FBQTtXQUdBLEtBSmM7RUFBQSxDQTlDaEIsQ0FBQTs7QUFBQSxrQkFvREEsU0FBQSxHQUFRLFNBQUMsUUFBRCxFQUFXLE1BQVgsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFELENBQVAsQ0FBZSxRQUFmLEVBQXlCLE1BQXpCLENBQUEsQ0FBQTtXQUNBLEtBRk07RUFBQSxDQXBEUixDQUFBOztBQUFBLGtCQXdEQSxJQUFBLEdBQU0sU0FBQyxPQUFELEdBQUE7QUFDSixJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBQSxDQUFBO1dBQ0EsS0FGSTtFQUFBLENBeEROLENBQUE7O2VBQUE7O0lBTkYsQ0FBQTs7QUFrRUEsSUFBRyxnREFBSDtBQUNFLEVBQUEsSUFBRyxnQkFBSDtBQUNFLElBQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFULEdBQWdCLEtBQWhCLENBREY7R0FBQSxNQUFBO0FBR0UsVUFBVSxJQUFBLEtBQUEsQ0FBTSwwQkFBTixDQUFWLENBSEY7R0FERjtDQWxFQTs7QUF3RUEsSUFBRyxnREFBSDtBQUNFLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBakIsQ0FERjtDQXhFQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBZTGlzdFxyXG5cclxuICAjXHJcbiAgIyBAcHJpdmF0ZVxyXG4gICMgQHBhcmFtIHtPYmplY3R9IHVpZCBBIHVuaXF1ZSBpZGVudGlmaWVyLiBJZiB1aWQgaXMgdW5kZWZpbmVkLCBhIG5ldyB1aWQgd2lsbCBiZSBjcmVhdGVkLlxyXG4gICNcclxuICBjb25zdHJ1Y3RvcjogKGxpc3QpLT5cclxuICAgIGlmIG5vdCBsaXN0P1xyXG4gICAgICBAX2xpc3QgPSBbXVxyXG4gICAgZWxzZSBpZiBsaXN0LmNvbnN0cnVjdG9yIGlzIEFycmF5XHJcbiAgICAgIEBfbGlzdCA9IGxpc3RcclxuICAgIGVsc2VcclxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5MaXN0IGV4cGVjdHMgYW4gQXJyYXkgYXMgYSBwYXJhbWV0ZXJcIlxyXG5cclxuICBfbmFtZTogXCJMaXN0XCJcclxuXHJcbiAgX2dldE1vZGVsOiAodHlwZXMsIG9wcyktPlxyXG4gICAgaWYgbm90IEBfbW9kZWw/XHJcbiAgICAgIEBfbW9kZWwgPSBuZXcgb3BzLkxpc3RNYW5hZ2VyKEApLmV4ZWN1dGUoKVxyXG4gICAgICBAX21vZGVsLmluc2VydCAwLCBAX2xpc3RcclxuICAgIGRlbGV0ZSBAX2xpc3RcclxuICAgIEBfbW9kZWxcclxuXHJcbiAgX3NldE1vZGVsOiAoQF9tb2RlbCktPlxyXG4gICAgZGVsZXRlIEBfbGlzdFxyXG5cclxuICB2YWw6ICgpLT5cclxuICAgIEBfbW9kZWwudmFsLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xyXG5cclxuICByZWY6ICgpLT5cclxuICAgIEBfbW9kZWwucmVmLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xyXG5cclxuXHJcbiAgb2JzZXJ2ZTogKCktPlxyXG4gICAgQF9tb2RlbC5vYnNlcnZlLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xyXG4gICAgQFxyXG5cclxuICB1bm9ic2VydmU6ICgpLT5cclxuICAgIEBfbW9kZWwudW5vYnNlcnZlLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xyXG4gICAgQFxyXG5cclxuICAjXHJcbiAgIyBJbnNlcnRzIGFuIE9iamVjdCBpbnRvIHRoZSBsaXN0LlxyXG4gICNcclxuICAjIEByZXR1cm4ge0xpc3RNYW5hZ2VyIFR5cGV9IFRoaXMgU3RyaW5nIG9iamVjdC5cclxuICAjXHJcbiAgaW5zZXJ0OiAocG9zaXRpb24sIGNvbnRlbnQpLT5cclxuICAgIGlmIHR5cGVvZiBwb3NpdGlvbiBpc250IFwibnVtYmVyXCJcclxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5MaXN0Lmluc2VydCBleHBlY3RzIGEgTnVtYmVyIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIhXCJcclxuICAgIEBfbW9kZWwuaW5zZXJ0IHBvc2l0aW9uLCBbY29udGVudF1cclxuICAgIEBcclxuXHJcbiAgaW5zZXJ0Q29udGVudHM6IChwb3NpdGlvbiwgY29udGVudHMpLT5cclxuICAgIGlmIHR5cGVvZiBwb3NpdGlvbiBpc250IFwibnVtYmVyXCJcclxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiWS5MaXN0Lmluc2VydCBleHBlY3RzIGEgTnVtYmVyIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIhXCJcclxuICAgIEBfbW9kZWwuaW5zZXJ0IHBvc2l0aW9uLCBjb250ZW50c1xyXG4gICAgQFxyXG5cclxuICBkZWxldGU6IChwb3NpdGlvbiwgbGVuZ3RoKS0+XHJcbiAgICBAX21vZGVsLmRlbGV0ZSBwb3NpdGlvbiwgbGVuZ3RoXHJcbiAgICBAXHJcblxyXG4gIHB1c2g6IChjb250ZW50KS0+XHJcbiAgICBAX21vZGVsLnB1c2ggY29udGVudFxyXG4gICAgQFxyXG5cclxuaWYgd2luZG93P1xyXG4gIGlmIHdpbmRvdy5ZP1xyXG4gICAgd2luZG93LlkuTGlzdCA9IFlMaXN0XHJcbiAgZWxzZVxyXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IG11c3QgZmlyc3QgaW1wb3J0IFkhXCJcclxuXHJcbmlmIG1vZHVsZT9cclxuICBtb2R1bGUuZXhwb3J0cyA9IFlMaXN0XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG4iXX0=
