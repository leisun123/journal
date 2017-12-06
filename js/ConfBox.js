goog.provide("sf.ui.ConfBox");

goog.require("sf.t");

goog.require("goog.dom");
goog.require("goog.style");
goog.require("goog.events");
goog.require("goog.dom.classlist");
goog.require("goog.dom.dataset");
goog.require("goog.Uri.QueryData");
goog.require("goog.net.XhrIo");
goog.require("goog.net.EventType");

var dom = goog.dom,
    style = goog.style,
    events = goog.events,
    dataset = goog.dataset,
    classlist = goog.classlit;

var Tab = function(confBox, tabEl) {

    goog.events.listen(tabEl, "click", function(e) {
        e.preventDefault();
        var name = goog.dom.dataset.get(tabEl, "name");
        confBox.loadTab(name);
    });

};

sf.ui.ConfBox = function() {

    this.tabEls = document.querySelectorAll(".conf-box-tab");

    for (var i=0; i<this.tabEls.length; i++) {
        var tabEl = this.tabEls[i];

        new Tab(this, tabEl);
    }

};

sf.ui.ConfBox.prototype.getTab = function(name) {

    for (var i=0; i<this.tabEls.length; i++) {
        var tabEl = this.tabEls[i];

        if (goog.dom.dataset.get(tabEl, "name") === name) {
            return tabEl;
        }
    }

    return null;

};

sf.ui.ConfBox.prototype.selectTab = function(name) {

    var targetTabEl = this.getTab(name);

    if (!targetTabEl) return;

    for (var i=0; i<this.tabEls.length; i++) {
        var tabEl = this.tabEls[i];

        goog.dom.classlist.remove(tabEl, "selected");
    }

    goog.dom.classlist.add(targetTabEl, "selected");

};

sf.ui.ConfBox.prototype.loadPage = function(page) {
    console.log(page);
    var url = "/conferences/" + location.pathname.match(/\d+/)[0] + "/" + page;
    console.log(url);
    var xhr = new goog.net.XhrIo();

    goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e) {
        var xhr = e.target;
        this.handleResponse_(xhr, goog.net.EventType.SUCCESS);
    }, false, this);

    goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e) {
        var xhr = e.target;
        this.handleResponse_(xhr, goog.net.EventType.ERROR);
    }, false, this);

    goog.events.listenOnce(xhr, goog.net.EventType.COMPLETE, function(e) {
        var xhr = e.target;
        this.handleResponse_(xhr, goog.net.EventType.COMPLETE);
    }, false, this);


    xhr.send(url, "GET");

};

sf.ui.ConfBox.prototype.loadTab = function(name) {

    var tabEl = this.getTab(name);

    if (!tabEl) return;

    var page = goog.dom.dataset.get(tabEl, "page");

    if (!page) return;

    this.selectTab(name);
    this.loadPage(page);

};

sf.ui.ConfBox.prototype.renderErrorPage_ = function() {

    document.getElementById("conf-box-main").innerHTML = sf.t.errorPage();

};

sf.ui.ConfBox.prototype.addRemoteScript_ = function(script, callback) {
    var head = document.getElementsByTagName("head")[0] ||
            document.documentElement,
        localScript = document.createElement("script");

    localScript.src = script.src;
    head.appendChild(localScript);

    localScript.onreadystatechange = callback;
    localScript.onload = callback;
};

sf.ui.ConfBox.prototype.addScripts_ = function(scripts) {

    if (scripts.length <= 0) return;

    var script = scripts[0],
        data = (script.text || script.textContent || script.innerHTML || "" );;

    if (script.src !== '') {
        this.addRemoteScript_(script, function() {
            this.addScripts_(Array.prototype.slice.call(scripts, 1));
        }.bind(this));
    } else {
        try {
            eval(data);
        } catch (e) {

        }
        this.addScripts_(Array.prototype.slice.call(scripts, 1));
    }

};

sf.ui.ConfBox.prototype.renderPage_ = function(domText) {

    var id = "conf-box-main-container",
        frag = document.createElement("html"),
        containerEl = document.getElementById(id);

    frag.innerHTML = domText;
    containerEl.innerHTML = domText;

    window.frag = frag;

    // execute scripts
    var scripts = frag.querySelectorAll("script");

    this.addScripts_(scripts);

};

sf.ui.ConfBox.prototype.handleResponse_ = function(xhr, type) {

    if (type === goog.net.EventType.SUCCESS) {
        this.renderPage_(xhr.getResponseText());
    } else if (type === goog.net.EventType.ERROR) {
        this.renderErrorPage_();
    }

};