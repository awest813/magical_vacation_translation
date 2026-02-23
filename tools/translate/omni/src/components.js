import Export from './export.js'
import Search from './search.js'
import { Alert } from './common.js'

var MagicalTranslator = React.createClass({
  getInitialState: function() {
    return {
      script: null,
      loadError: null
    };
  },
  handleScriptSelectChange: function(e) {
    var file = e.target.files.item(0);
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.addEventListener("loadend", () => {
      try {
        var parsedScript = JSON.parse(reader.result);
        this.setState({script: parsedScript, loadError: null});
      } catch (error) {
        this.setState({
          script: null,
          loadError: `Unable to parse JSON from ${file.name}.`
        });
      }
    });
    reader.readAsText(file);
  },
  handleScriptChange: function(script) {
    this.setState({script: script});
  },
  renderMain: function() {
    return (
      <div className="row">
        <Sidebar script={this.state.script} />
        <div className="col-md-10">
          <MainPanel script={this.state.script} />
        </div>
      </div>
    );
  },
  renderScriptSelector: function() {
    return <ScriptSelector callback={this.handleScriptSelectChange}
                           loadError={this.state.loadError} />;
  },
  render: function() {
    return this.state.script ? this.renderMain() : this.renderScriptSelector();
  }
});

var ScriptSelector = React.createClass({
  render: function() {
    return (
      <form>
        <Alert message={this.props.loadError} />
        <label>Select script JSON file:</label>
        <input className="form-control" type="file"
               accept="application/json,.json"
               onChange={this.props.callback} />
        <p className="help-block">
          Load a translated JSON script to enable export tools and search.
        </p>
      </form>
    );
  }
});

var MainPanel = React.createClass({
  scriptStats: function() {
    var sectionCount = this.props.script.length;
    var lineCount = this.props.script.reduce((count, section) => count + section.length, 0);
    var translatedCount = this.props.script.reduce((count, section) => {
      return count + section.filter((line) => line.translation && line.translation.trim()).length;
    }, 0);

    return {sectionCount, lineCount, translatedCount};
  },
  render: function() {
    var stats = this.scriptStats();

    return (
      <div className="main-panel">
        <h3>Script overview</h3>
        <p className="text-muted">
          Use the sidebar to export your script or search across source text,
          translations, and comments.
        </p>
        <ul>
          <li><strong>Sections:</strong> {stats.sectionCount}</li>
          <li><strong>Total lines:</strong> {stats.lineCount}</li>
          <li><strong>Translated lines:</strong> {stats.translatedCount}</li>
        </ul>
      </div>
    );
  }
});

var Sidebar = React.createClass({
  render: function() {
    return (
      <div className="col-md-2 sidebar">
        <Export script={this.props.script} />
        <hr />
        <Search script={this.props.script} />
      </div>
    );
  }
});

var Editor = React.createClass({
  render: function() {
    return (
      <div className="row">
      <div className="col-md-2 sidebar">
        <form>
          <label> Binary format: </label>
          <div className="form-group">
            <select className="form-control">
              <option>Magical Vacation</option>
            </select>
          </div>
        </form>

        <hr />

        <form>
          <div className="form-group">
            <input type="search" className="form-control" id="search_text" placeholder="Search for..." />
          </div>
          <div className="form-group">
            <select className="form-control">
              <option>Search source</option>
              <option>Search translation</option>
              <option>Search comments</option>
            </select>
          </div>
        </form>

        <hr />

        <form>
          <div className="form-group">
            <button className="btn btn-default btn-block" id="export">Export</button>
          </div>
        </form>
      </div>

      <div className="col-md-10">
        <p>
          <label>Line:</label>
          <input id="number" disabled="true" type="number" min="0" max="0" step="1"/>
          of <span id="max_number"></span>
        </p>

        <p>
          <label>Source:</label>
          <span id="source">{this.props.script[0][28].source}</span>
        </p>

        <p>
          <label>Translation:</label>
          <textarea id="translation"></textarea>
        </p>

        <p>
          <label>Comment:</label>
          <textarea id="comment"></textarea>
        </p>

        <p id="search_results">
        </p>
      </div>
      </div>
    );
  }
});

export default MagicalTranslator;
