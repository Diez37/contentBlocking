'use strict';

/** @type {RegExp} */
const STYLE_REGEXP = new RegExp('class=["\'](.*?)["\']', 'g');

export default class ContentBlock {

  /**
   * @param {Object} config
   *
   * @return {ContentBlock}
   */
  static create(config) {
    return new ContentBlock(config);
  }

  /**
   * @param {Object} config
   */
  constructor(config) {
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
      'keywords': ContentBlock._regExpsGenerator(this.configure.keywords),
    };

    /** @type {Object[]} */
    this.targetsStyle = [];

    /** @type {Function} */
    this.XMLHttpRequestOpen = XMLHttpRequest.prototype.open;

    this.styleObserve = new MutationObserver((mutations) => {this._onMutations(mutations)});

    this.xmlSerializer = new XMLSerializer();
  }

  /**
   * @param {string[]} strings
   *
   * @return {RegExp[]}
   *
   * @private
   */
  static _regExpsGenerator(strings) {
    let res = [];

    for(let index in strings) {
      res.push(new RegExp(strings[index], 'g'));
    }

    return res;
  }

  /**
   * @param {Array} mutations
   *
   * @private
   */
  _onMutations(mutations) {
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
  run() {
    let $this = this;

    XMLHttpRequest.prototype.open = function() {
      $this._onXMLHttpRequestOpen(this, arguments);
      $this.XMLHttpRequestOpen.apply(this, arguments);
    };

    document.addEventListener("DOMNodeInserted", (event) => {this._onDOMNodeInserted(event)}, false);

    this.styleObserve.observe(document.documentElement, { attributes : true, attributeFilter : ['style'] });
    this.styleObserve.observe(document.body, { attributes : true, attributeFilter : ['style'] });

    return this;
  }

  /**
   * @param {XMLHttpRequest} xhr
   * @param {Array} args
   *
   * @private
   */
  _onXMLHttpRequestOpen(xhr, args) {
    if (this.isBlockUrl(args[1])) {
      xhr.addEventListener('progress', () => {
        xhr.abort();
      })
    }
  }

  /**
   * @param {string} url
   *
   * @return {Boolean}
   */
  isBlockUrl(url) {
    if (url.length === 0) {
      return false;
    }

    for (let index in this.regExps.urls) {
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
  _onDOMNodeInserted(event) {
    if (event.target.tagName === 'SCRIPT') {
      if (this.isBlockContent(this.xmlSerializer.serializeToString(event.target)) || this.isBlockUrl(event.target.src)) {
        event.target.id = 'deleting';

        ContentBlock.removeElementsById([event.target.id]);

        return false;
      }

      return true;
    }

    if(event.target.tagName === 'STYLE') {
      this._saveStyleTarget(event.target);

      return true;
    }

    if(event.target.tagName === 'DIV') {
      if (this.isBlockContent(this.xmlSerializer.serializeToString(event.target))) {
        this.removeTarget(event.target);

        return false;
      }

      return true;
    }

    return true;
  }

  /**
   * @param {Object} target
   *
   * @private
   */
  _saveStyleTarget(target) {
    this.targetsStyle.push(target);

    if (target.id === '') {
      target.id = 'style_' + this.targetsStyle.length;
    }
  };

  /**
   * @param {string} content
   *
   * @return {Boolean}
   */
  isBlockContent(content) {
    for (let index in this.regExps.keywords) {
      if (this.regExps.keywords[index].test(content)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {Object} target
   */
  removeTarget(target) {
    let styleTarget = this.getStyleTargetForClassNames(this.getStyleClassNameFromTag(target.outerHTML));

    ContentBlock.removeElementsById([styleTarget.id, target.id]);
  }

  /**
   * @param {string} content
   *
   * @return {string[]}
   */
  getStyleClassNameFromTag(content) {
    let res = [];

    let styleClassNames;

    while ((styleClassNames = STYLE_REGEXP.exec(content)) !== null) {
      styleClassNames.forEach(function (match, groupIndex) {
        if (groupIndex === 1) {
          match.split().forEach(function (className) {
            res.push(className.trim());
          })
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
  getStyleTargetForClassNames(classNames) {
    for (let styleIndex in this.targetsStyle) {
      for (let classNameIndex in classNames) {
        if ((new RegExp(classNames[classNameIndex], 'g')).test(this.targetsStyle[styleIndex].outerText)) {
          return this.targetsStyle[styleIndex];
        }
      }
    }

    return {};
  }

  /**
   * @param {Array} ids
   */
  static removeElementsById(ids) {
    for (let index in ids) {
      let node = document.getElementById(ids[index]);
      if (node) {
        node.parentNode.removeChild(node);
      }
    }
  };
}
