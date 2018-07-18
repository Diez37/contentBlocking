'use strict';

/** @type {RegExp} */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STYLE_REGEXP = new RegExp('class=["\'](.*?)["\']', 'g');

var ContentBlock = function () {
  _createClass(ContentBlock, null, [{
    key: 'create',


    /**
     * @param {Object} config
     *
     * @return {ContentBlock}
     */
    value: function create(config) {
      return new ContentBlock(config);
    }

    /**
     * @param {Object} config
     */

  }]);

  function ContentBlock(config) {
    var _this = this;

    _classCallCheck(this, ContentBlock);

    /** @type {Object} */
    this.configure = Object.assign({}, {
      'urls': [],
      'keywords': [],
      'document': {
        'margin': {
          'top': '0px'
        }
      }
    }, config);

    /** @type {{urls: RegExp[], keywords: RegExp[]}} */
    this.regExps = {
      'urls': ContentBlock._regExpsGenerator(this.configure.urls),
      'keywords': ContentBlock._regExpsGenerator(this.configure.keywords)
    };

    /** @type {Object[]} */
    this.targetsStyle = [];

    /** @type {Function} */
    this.XMLHttpRequestOpen = XMLHttpRequest.prototype.open;

    this.styleObserve = new MutationObserver(function (mutations) {
      _this._onMutations(mutations);
    });

    this.xmlSerializer = new XMLSerializer();
  }

  /**
   * @param {string[]} strings
   *
   * @return {RegExp[]}
   *
   * @private
   */


  _createClass(ContentBlock, [{
    key: '_onMutations',


    /**
     * @param {Array} mutations
     *
     * @private
     */
    value: function _onMutations(mutations) {
      if (document.documentElement.style.marginTop !== this.configure.document.margin.top) {
        document.documentElement.style.marginTop = this.configure.document.margin.top;
      }

      if (document.body.style.marginTop !== this.configure.document.margin.top) {
        document.body.style.marginTop = this.configure.document.margin.top;
      }
    }

    /**
     * @return {ContentBlock}
     */

  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      var $this = this;

      XMLHttpRequest.prototype.open = function () {
        $this._onXMLHttpRequestOpen(this, arguments);
        $this.XMLHttpRequestOpen.apply(this, arguments);
      };

      document.addEventListener("DOMNodeInserted", function (event) {
        _this2._onDOMNodeInserted(event);
      }, false);

      this.styleObserve.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
      this.styleObserve.observe(document.body, { attributes: true, attributeFilter: ['style'] });

      return this;
    }

    /**
     * @param {XMLHttpRequest} xhr
     * @param {Array} args
     *
     * @private
     */

  }, {
    key: '_onXMLHttpRequestOpen',
    value: function _onXMLHttpRequestOpen(xhr, args) {
      if (this.isBlockUrl(args[1])) {
        xhr.addEventListener('progress', function () {
          xhr.abort();
        });
      }
    }

    /**
     * @param {string} url
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlockUrl',
    value: function isBlockUrl(url) {
      if (url.length === 0) {
        return false;
      }

      for (var index in this.regExps.urls) {
        if (this.regExps.urls[index].test(url)) {
          return true;
        }
      }

      return false;
    }

    /**
     * @param {Object} event
     *
     * @private
     */

  }, {
    key: '_onDOMNodeInserted',
    value: function _onDOMNodeInserted(event) {
      if (event.target.tagName === 'SCRIPT') {
        if (this.isBlockContent(this.xmlSerializer.serializeToString(event.target)) || this.isBlockUrl(event.target.src)) {
          event.target.id = 'deleting';

          ContentBlock.removeElementsById([event.target.id]);
        }
      }

      if (event.relatedNode.nodeName === 'BODY' && event.target.tagName === 'STYLE') {
        this._saveStyleTarget(event.target);
      }

      if (event.relatedNode.nodeName === 'BODY' && event.target.tagName === 'DIV') {
        if (this.isBlockContent(this.xmlSerializer.serializeToString(event.target))) {
          this.removeTarget(event.target);
        }
      }
    }

    /**
     * @param {Object} target
     *
     * @private
     */

  }, {
    key: '_saveStyleTarget',
    value: function _saveStyleTarget(target) {
      this.targetsStyle.push(target);

      if (target.id === '') {
        target.id = 'style_' + this.targetsStyle.length;
      }
    }
  }, {
    key: 'isBlockContent',


    /**
     * @param {string} content
     *
     * @return {Boolean}
     */
    value: function isBlockContent(content) {
      for (var index in this.regExps.keywords) {
        if (this.regExps.keywords[index].test(content)) {
          return true;
        }
      }

      return false;
    }

    /**
     * @param {Object} target
     */

  }, {
    key: 'removeTarget',
    value: function removeTarget(target) {
      var styleTarget = this.getStyleTargetForClassNames(this.getStyleClassNameFromTag(target.outerHTML));

      ContentBlock.removeElementsById([styleTarget.id, target.id]);
    }

    /**
     * @param {string} content
     *
     * @return {string[]}
     */

  }, {
    key: 'getStyleClassNameFromTag',
    value: function getStyleClassNameFromTag(content) {
      var res = [];

      var styleClassNames = void 0;

      while ((styleClassNames = STYLE_REGEXP.exec(content)) !== null) {
        styleClassNames.forEach(function (match, groupIndex) {
          if (groupIndex === 1) {
            match.split().forEach(function (className) {
              res.push(className.trim());
            });
          }
        });
      }

      return res;
    }

    /**
     * @param {string[]} classNames
     *
     * @return {Object}
     */

  }, {
    key: 'getStyleTargetForClassNames',
    value: function getStyleTargetForClassNames(classNames) {
      for (var styleIndex in this.targetsStyle) {
        for (var classNameIndex in classNames) {
          if (new RegExp(classNames[classNameIndex], 'g').test(this.targetsStyle[styleIndex].outerText)) {
            return this.targetsStyle[styleIndex];
          }
        }
      }

      return {};
    }

    /**
     * @param {Array} ids
     */

  }], [{
    key: '_regExpsGenerator',
    value: function _regExpsGenerator(strings) {
      var res = [];

      for (var index in strings) {
        res.push(new RegExp(strings[index], 'g'));
      }

      return res;
    }
  }, {
    key: 'removeElementsById',
    value: function removeElementsById(ids) {
      for (var index in ids) {
        var node = document.getElementById(ids[index]);
        if (node) {
          node.parentNode.removeChild(node);
        }
      }
    }
  }]);

  return ContentBlock;
}();

exports.default = ContentBlock;