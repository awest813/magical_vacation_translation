'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _export = require('./export.js');

var _export2 = _interopRequireDefault(_export);

var _search = require('./search.js');

var _search2 = _interopRequireDefault(_search);

var _common = require('./common.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MagicalTranslator = React.createClass({
  displayName: 'MagicalTranslator',

  getInitialState: function getInitialState() {
    return {
      script: null,
      loadError: null
    };
  },
  handleScriptSelectChange: function handleScriptSelectChange(e) {
    var _this = this;

    var file = e.target.files.item(0);
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.addEventListener("loadend", function () {
      try {
        var parsedScript = JSON.parse(reader.result);
        _this.setState({ script: parsedScript, loadError: null });
      } catch (error) {
        _this.setState({
          script: null,
          loadError: 'Unable to parse JSON from ' + file.name + '.'
        });
      }
    });
    reader.readAsText(file);
  },
  handleScriptChange: function handleScriptChange(script) {
    this.setState({ script: script });
  },
  renderMain: function renderMain() {
    return React.createElement(
      'div',
      { className: 'row' },
      React.createElement(Sidebar, { script: this.state.script }),
      React.createElement(
        'div',
        { className: 'col-md-10' },
        React.createElement(MainPanel, { script: this.state.script })
      )
    );
  },
  renderScriptSelector: function renderScriptSelector() {
    return React.createElement(ScriptSelector, { callback: this.handleScriptSelectChange,
      loadError: this.state.loadError });
  },
  render: function render() {
    return this.state.script ? this.renderMain() : this.renderScriptSelector();
  }
});

var ScriptSelector = React.createClass({
  displayName: 'ScriptSelector',

  render: function render() {
    return React.createElement(
      'form',
      null,
      React.createElement(_common.Alert, { message: this.props.loadError }),
      React.createElement(
        'label',
        null,
        'Select script JSON file:'
      ),
      React.createElement('input', { className: 'form-control', type: 'file',
        accept: 'application/json,.json',
        onChange: this.props.callback }),
      React.createElement(
        'p',
        { className: 'help-block' },
        'Load a translated JSON script to enable export tools and search.'
      )
    );
  }
});


var MainPanel = React.createClass({
  displayName: 'MainPanel',

  scriptStats: function scriptStats() {
    var sectionCount = this.props.script.length;
    var lineCount = this.props.script.reduce(function (count, section) {
      return count + section.length;
    }, 0);
    var translatedCount = this.props.script.reduce(function (count, section) {
      return count + section.filter(function (line) {
        return line.translation && line.translation.trim();
      }).length;
    }, 0);

    return { sectionCount: sectionCount, lineCount: lineCount, translatedCount: translatedCount };
  },
  render: function render() {
    var stats = this.scriptStats();

    return React.createElement(
      'div',
      { className: 'main-panel' },
      React.createElement(
        'h3',
        null,
        'Script overview'
      ),
      React.createElement(
        'p',
        { className: 'text-muted' },
        'Use the sidebar to export your script or search across source text, translations, and comments.'
      ),
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          null,
          React.createElement(
            'strong',
            null,
            'Sections:'
          ),
          ' ',
          stats.sectionCount
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'strong',
            null,
            'Total lines:'
          ),
          ' ',
          stats.lineCount
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'strong',
            null,
            'Translated lines:'
          ),
          ' ',
          stats.translatedCount
        )
      )
    );
  }
});

var Sidebar = React.createClass({
  displayName: 'Sidebar',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'col-md-2 sidebar' },
      React.createElement(_export2.default, { script: this.props.script }),
      React.createElement('hr', null),
      React.createElement(_search2.default, { script: this.props.script })
    );
  }
});

var Editor = React.createClass({
  displayName: 'Editor',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'row' },
      React.createElement(
        'div',
        { className: 'col-md-2 sidebar' },
        React.createElement(
          'form',
          null,
          React.createElement(
            'label',
            null,
            ' Binary format: '
          ),
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'select',
              { className: 'form-control' },
              React.createElement(
                'option',
                null,
                'Magical Vacation'
              )
            )
          )
        ),
        React.createElement('hr', null),
        React.createElement(
          'form',
          null,
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement('input', { type: 'search', className: 'form-control', id: 'search_text', placeholder: 'Search for...' })
          ),
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'select',
              { className: 'form-control' },
              React.createElement(
                'option',
                null,
                'Search source'
              ),
              React.createElement(
                'option',
                null,
                'Search translation'
              ),
              React.createElement(
                'option',
                null,
                'Search comments'
              )
            )
          )
        ),
        React.createElement('hr', null),
        React.createElement(
          'form',
          null,
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'button',
              { className: 'btn btn-default btn-block', id: 'export' },
              'Export'
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'col-md-10' },
        React.createElement(
          'p',
          null,
          React.createElement(
            'label',
            null,
            'Line:'
          ),
          React.createElement('input', { id: 'number', disabled: 'true', type: 'number', min: '0', max: '0', step: '1' }),
          'of ',
          React.createElement('span', { id: 'max_number' })
        ),
        React.createElement(
          'p',
          null,
          React.createElement(
            'label',
            null,
            'Source:'
          ),
          React.createElement(
            'span',
            { id: 'source' },
            this.props.script[0][28].source
          )
        ),
        React.createElement(
          'p',
          null,
          React.createElement(
            'label',
            null,
            'Translation:'
          ),
          React.createElement('textarea', { id: 'translation' })
        ),
        React.createElement(
          'p',
          null,
          React.createElement(
            'label',
            null,
            'Comment:'
          ),
          React.createElement('textarea', { id: 'comment' })
        ),
        React.createElement('p', { id: 'search_results' })
      )
    );
  }
});

exports.default = MagicalTranslator;