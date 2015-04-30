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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rtb25hZC9tZW1lLXRvZ2V0aGVyL25vZGVfbW9kdWxlcy95LWxpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZG1vbmFkL21lbWUtdG9nZXRoZXIvbm9kZV9tb2R1bGVzL3ktbGlzdC9saWIveS1saXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsS0FBQTs7QUFBQTtBQU1lLEVBQUEsZUFBQyxJQUFELEdBQUE7QUFDWCxJQUFBLElBQU8sWUFBUDtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFULENBREY7S0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsS0FBb0IsS0FBdkI7QUFDSCxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBVCxDQURHO0tBQUEsTUFBQTtBQUdILFlBQVUsSUFBQSxLQUFBLENBQU0sd0NBQU4sQ0FBVixDQUhHO0tBSE07RUFBQSxDQUFiOztBQUFBLGtCQVFBLEtBQUEsR0FBTyxNQVJQLENBQUE7O0FBQUEsa0JBVUEsU0FBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLEdBQVIsR0FBQTtBQUNULElBQUEsSUFBTyxtQkFBUDtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLENBQWtCLENBQUMsT0FBbkIsQ0FBQSxDQUFkLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLENBQWYsRUFBa0IsSUFBQyxDQUFBLEtBQW5CLENBREEsQ0FERjtLQUFBO0FBQUEsSUFHQSxNQUFBLENBQUEsSUFBUSxDQUFBLEtBSFIsQ0FBQTtXQUlBLElBQUMsQ0FBQSxPQUxRO0VBQUEsQ0FWWCxDQUFBOztBQUFBLGtCQWlCQSxTQUFBLEdBQVcsU0FBRSxNQUFGLEdBQUE7QUFDVCxJQURVLElBQUMsQ0FBQSxTQUFBLE1BQ1gsQ0FBQTtXQUFBLE1BQUEsQ0FBQSxJQUFRLENBQUEsTUFEQztFQUFBLENBakJYLENBQUE7O0FBQUEsa0JBb0JBLEdBQUEsR0FBSyxTQUFBLEdBQUE7V0FDSCxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLElBQUMsQ0FBQSxNQUFuQixFQUEyQixTQUEzQixFQURHO0VBQUEsQ0FwQkwsQ0FBQTs7QUFBQSxrQkF1QkEsR0FBQSxHQUFLLFNBQUEsR0FBQTtXQUNILElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsSUFBQyxDQUFBLE1BQW5CLEVBQTJCLFNBQTNCLEVBREc7RUFBQSxDQXZCTCxDQUFBOztBQUFBLGtCQTJCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFoQixDQUFzQixJQUFDLENBQUEsTUFBdkIsRUFBK0IsU0FBL0IsQ0FBQSxDQUFBO1dBQ0EsS0FGTztFQUFBLENBM0JULENBQUE7O0FBQUEsa0JBK0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQWxCLENBQXdCLElBQUMsQ0FBQSxNQUF6QixFQUFpQyxTQUFqQyxDQUFBLENBQUE7V0FDQSxLQUZTO0VBQUEsQ0EvQlgsQ0FBQTs7QUFBQSxrQkF3Q0EsTUFBQSxHQUFRLFNBQUMsUUFBRCxFQUFXLE9BQVgsR0FBQTtBQUNOLElBQUEsSUFBRyxNQUFBLENBQUEsUUFBQSxLQUFxQixRQUF4QjtBQUNFLFlBQVUsSUFBQSxLQUFBLENBQU0sd0RBQU4sQ0FBVixDQURGO0tBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLFFBQWYsRUFBeUIsQ0FBQyxPQUFELENBQXpCLENBRkEsQ0FBQTtXQUdBLEtBSk07RUFBQSxDQXhDUixDQUFBOztBQUFBLGtCQThDQSxjQUFBLEdBQWdCLFNBQUMsUUFBRCxFQUFXLFFBQVgsR0FBQTtBQUNkLElBQUEsSUFBRyxNQUFBLENBQUEsUUFBQSxLQUFxQixRQUF4QjtBQUNFLFlBQVUsSUFBQSxLQUFBLENBQU0sd0RBQU4sQ0FBVixDQURGO0tBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLFFBQWYsRUFBeUIsUUFBekIsQ0FGQSxDQUFBO1dBR0EsS0FKYztFQUFBLENBOUNoQixDQUFBOztBQUFBLGtCQW9EQSxTQUFBLEdBQVEsU0FBQyxRQUFELEVBQVcsTUFBWCxHQUFBO0FBQ04sSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQUQsQ0FBUCxDQUFlLFFBQWYsRUFBeUIsTUFBekIsQ0FBQSxDQUFBO1dBQ0EsS0FGTTtFQUFBLENBcERSLENBQUE7O0FBQUEsa0JBd0RBLElBQUEsR0FBTSxTQUFDLE9BQUQsR0FBQTtBQUNKLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsT0FBYixDQUFBLENBQUE7V0FDQSxLQUZJO0VBQUEsQ0F4RE4sQ0FBQTs7ZUFBQTs7SUFORixDQUFBOztBQWtFQSxJQUFHLGdEQUFIO0FBQ0UsRUFBQSxJQUFHLGdCQUFIO0FBQ0UsSUFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQVQsR0FBZ0IsS0FBaEIsQ0FERjtHQUFBLE1BQUE7QUFHRSxVQUFVLElBQUEsS0FBQSxDQUFNLDBCQUFOLENBQVYsQ0FIRjtHQURGO0NBbEVBOztBQXdFQSxJQUFHLGdEQUFIO0FBQ0UsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFqQixDQURGO0NBeEVBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIFlMaXN0XG5cbiAgI1xuICAjIEBwcml2YXRlXG4gICMgQHBhcmFtIHtPYmplY3R9IHVpZCBBIHVuaXF1ZSBpZGVudGlmaWVyLiBJZiB1aWQgaXMgdW5kZWZpbmVkLCBhIG5ldyB1aWQgd2lsbCBiZSBjcmVhdGVkLlxuICAjXG4gIGNvbnN0cnVjdG9yOiAobGlzdCktPlxuICAgIGlmIG5vdCBsaXN0P1xuICAgICAgQF9saXN0ID0gW11cbiAgICBlbHNlIGlmIGxpc3QuY29uc3RydWN0b3IgaXMgQXJyYXlcbiAgICAgIEBfbGlzdCA9IGxpc3RcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLkxpc3QgZXhwZWN0cyBhbiBBcnJheSBhcyBhIHBhcmFtZXRlclwiXG5cbiAgX25hbWU6IFwiTGlzdFwiXG5cbiAgX2dldE1vZGVsOiAodHlwZXMsIG9wcyktPlxuICAgIGlmIG5vdCBAX21vZGVsP1xuICAgICAgQF9tb2RlbCA9IG5ldyBvcHMuTGlzdE1hbmFnZXIoQCkuZXhlY3V0ZSgpXG4gICAgICBAX21vZGVsLmluc2VydCAwLCBAX2xpc3RcbiAgICBkZWxldGUgQF9saXN0XG4gICAgQF9tb2RlbFxuXG4gIF9zZXRNb2RlbDogKEBfbW9kZWwpLT5cbiAgICBkZWxldGUgQF9saXN0XG5cbiAgdmFsOiAoKS0+XG4gICAgQF9tb2RlbC52YWwuYXBwbHkgQF9tb2RlbCwgYXJndW1lbnRzXG5cbiAgcmVmOiAoKS0+XG4gICAgQF9tb2RlbC5yZWYuYXBwbHkgQF9tb2RlbCwgYXJndW1lbnRzXG5cblxuICBvYnNlcnZlOiAoKS0+XG4gICAgQF9tb2RlbC5vYnNlcnZlLmFwcGx5IEBfbW9kZWwsIGFyZ3VtZW50c1xuICAgIEBcblxuICB1bm9ic2VydmU6ICgpLT5cbiAgICBAX21vZGVsLnVub2JzZXJ2ZS5hcHBseSBAX21vZGVsLCBhcmd1bWVudHNcbiAgICBAXG5cbiAgI1xuICAjIEluc2VydHMgYW4gT2JqZWN0IGludG8gdGhlIGxpc3QuXG4gICNcbiAgIyBAcmV0dXJuIHtMaXN0TWFuYWdlciBUeXBlfSBUaGlzIFN0cmluZyBvYmplY3QuXG4gICNcbiAgaW5zZXJ0OiAocG9zaXRpb24sIGNvbnRlbnQpLT5cbiAgICBpZiB0eXBlb2YgcG9zaXRpb24gaXNudCBcIm51bWJlclwiXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLkxpc3QuaW5zZXJ0IGV4cGVjdHMgYSBOdW1iZXIgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciFcIlxuICAgIEBfbW9kZWwuaW5zZXJ0IHBvc2l0aW9uLCBbY29udGVudF1cbiAgICBAXG5cbiAgaW5zZXJ0Q29udGVudHM6IChwb3NpdGlvbiwgY29udGVudHMpLT5cbiAgICBpZiB0eXBlb2YgcG9zaXRpb24gaXNudCBcIm51bWJlclwiXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJZLkxpc3QuaW5zZXJ0IGV4cGVjdHMgYSBOdW1iZXIgYXMgdGhlIGZpcnN0IHBhcmFtZXRlciFcIlxuICAgIEBfbW9kZWwuaW5zZXJ0IHBvc2l0aW9uLCBjb250ZW50c1xuICAgIEBcblxuICBkZWxldGU6IChwb3NpdGlvbiwgbGVuZ3RoKS0+XG4gICAgQF9tb2RlbC5kZWxldGUgcG9zaXRpb24sIGxlbmd0aFxuICAgIEBcblxuICBwdXNoOiAoY29udGVudCktPlxuICAgIEBfbW9kZWwucHVzaCBjb250ZW50XG4gICAgQFxuXG5pZiB3aW5kb3c/XG4gIGlmIHdpbmRvdy5ZP1xuICAgIHdpbmRvdy5ZLkxpc3QgPSBZTGlzdFxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiWW91IG11c3QgZmlyc3QgaW1wb3J0IFkhXCJcblxuaWYgbW9kdWxlP1xuICBtb2R1bGUuZXhwb3J0cyA9IFlMaXN0XG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
