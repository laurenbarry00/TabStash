/*global chrome*/
import React, {Component} from 'react';

class Popup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      alertText: " ",
      showAdvanced: false
    }
    this.toggleAdvanced = this.toggleAdvanced.bind(this);
    this.handleStash = this.handleStash.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  toggleAdvanced() {
    this.setState({showAdvanced: !this.state.showAdvanced});
  }

  handleStash() {
    const _this = this;

    // query all tabs
    chrome.tabs.query({}, function(results) {
      let tabUrls = [];

      // get all open tabs' urls and indices
      results.forEach(function(tab) {
        tabUrls.push({
          url: tab.url,
          index: tab.index
        });
      });

      // store in chrome storage as json string
      //const openTabs = JSON.stringify(tabUrls);
      chrome.storage.local.set({tabStash: tabUrls});

      // update alert text w/ how many tabs were stored
      const alertString = tabUrls.length + " tabs stashed.";
      _this.setState({alertText: alertString});
    });
  }

  handleApply() {
    const _this = this;

    // retrieve stashed tabs from storage
    chrome.storage.local.get(["tabStash"], function(result) {
      // handle empty stash
      if (Object.keys(result).length === 0) {
        // display empty stash message
        const alertString = "Stash is empty.";
        _this.setState({alertText: alertString});
        return;
      }

      // get list of tabs
      const stashTabs = result.tabStash;
      stashTabs.forEach(function(tab) {
        // create new tab w/ index
        chrome.tabs.create({
          url: tab.url,
          index: tab.index
        });
      });
    })
  }

  handleClear() {
    // remove stash from storage
    chrome.storage.local.remove("tabStash");
    // update alert text to confirm stash clear
    this.setState({alertText: "Stash cleared."});
  }

  render() {
    const alertText = this.state.alertText;
    const menuIcon = this.state.showAdvanced ? "\u2715 Close" : "\u2630 Menu";

    const advancedMenu = this.state.showAdvanced ?
      <div className="advanced-menu">
        <button id="clear-button" title="Clear stashed tabs" onClick={this.handleClear}>Clear Stash</button>
      </div> : null;

    return (
      <div className="popup">
        <h1 id="title">TabStash</h1>
        <img src="./img/icon128.png" alt="TabStash icon" ></img>
        <p className="alert-text">{alertText}</p>
        <div className="main-buttons-container">
          <button id="stash-button" title="Stash current tabs" onClick={this.handleStash}>Stash</button>
          <button id="apply-button" title="Apply stashed tabs" onClick={this.handleApply}>Apply</button>
        </div>
        <div id="adv-menu-icon" onClick={this.toggleAdvanced}>{menuIcon}</div>
        {advancedMenu}
      </div>
    );
  }
}

export default Popup;
