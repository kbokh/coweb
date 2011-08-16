define(["coweb/session/bayeux/cometd","coweb/session/bayeux/CowebExtension","coweb/session/bayeux/ListenerBridge","coweb/util/Promise","coweb/util/xhr"],function(a,b,c,d,e){var f=function(a){this.DISCONNECTING=0,this.IDLE=1,this.PREPARING=2,this.PREPARED=3,this.JOINING=4,this.JOINED=5,this.UPDATING=6,this.UPDATED=7,this._debug=a.debug,this._adminUrl=a.adminUrl,this._baseUrl=a.baseUrl,this._state=this.IDLE,this._connectToken=null,this._prepPromise=null,this._joinPromise=null,this._updatePromise=null,this.disconnectPromise=null,this.prepResponse=null,this._bridge=new c({debug:this._debug,listener:a.listener,bridge:this})},g=f.prototype;g.destroy=function(){this._prepPromise=null,this._joinPromise=null,this._updatePromise=null,this._state!==this.IDLE&&this.disconnect(!0)},g.getState=function(){return this._state},g.prepare=function(a,b,c){if(this._state!==this.IDLE)throw new Error(this.id+": cannot prepare in non-idle state");this.disconnectPromise=new d,this._prepPromise=new d;var f={key:a,collab:b,cacheState:c},g={method:"POST",url:this._adminUrl,headers:{"Content-Type":"application/json;charset=UTF-8"},body:JSON.stringify(f)},h=e.send(g);h.then("_onPrepareResponse","_onPrepareError",this),this._state=this.PREPARING;return this._prepPromise},g._onPrepareResponse=function(a){var b=JSON.parse(a.xhr.responseText);if(this._state===this.PREPARING){this._state=this.PREPARED;var c=this._prepPromise;this._prepPromise=null,this.prepResponse=b,c.resolve(b)}},g._onPrepareError=function(a){this._state=this.IDLE;var b=this._prepPromise;this._prepPromise=null;var c=a.xhr.status;c===403||c===401?b.fail(new Error("not-allowed")):b.fail(new Error("server-unavailable"))},g.join=function(c){if(this._state!==this.PREPARED)throw new Error(this.id+": cannot join in unprepared state");this._joinPromise=new d,a.unregisterExtension("coweb");var e={sessionid:this.prepResponse.sessionid,updaterType:c};a.registerExtension("coweb",new b(e)),a.configure({url:this._baseUrl+this.prepResponse.sessionurl,logLevel:this._debug?"debug":"info",autoBatch:!0,appendMessageTypeToURL:!1}),a.addListener("/meta/unsuccessful",this,"_onSessionUnsuccessful"),this._connectToken=a.addListener("/meta/connect",this,"_onSessionConnect"),a.addListener("/meta/disconnect",this,"_onSessionDisconnect"),this._state=this.JOINING,a.handshake();return this._joinPromise},g._onSessionUnsuccessful=function(a){var b="";a&&a.error&&(b=a.error.slice(0,3));var c;if(b==="500")this.onDisconnected(this._state,"stream-error"),this.disconnect();else if(a.xhr&&this._state>this.IDLE){var d=a.xhr.status;d===403||d===401?c="not-allowed":d===0?c="server-unavailable":d<500?this._state>this.PREPARING&&(c="session-unavailable"):c="server-unavailable",this._onDisconnected(this._state,c),this.disconnect();var e=this._joinPromise||this._updatePromise;e&&(this._updatePromise=null,this._joinPromise=null,e.fail(new Error(c)))}},g._onSessionConnect=function(b){if(this._state===this.JOINING){this._state=this.JOINED;var c=this._joinPromise;this._joinPromise=null,c.resolve(),a.removeListener(this._connectToken),this._connectToken=null}},g._onSessionDisconnect=function(a){this._state!==this.IDLE&&this._onDisconnected(this._state,"clean-disconnect")},g.update=function(){if(this._state!==this.JOINED)throw new Error(this.id+": cannot update in unjoined state");this._state=this.UPDATING,this._updatePromise=new d,this._bridge.initiateUpdate().then("_onUpdateSuccess","_onUpdateFailure",this);return this._updatePromise},g._onUpdateSuccess=function(){if(this._state===this.UPDATING){this._state=this.UPDATED;var a=this._updatePromise;this._updatePromise=null,a.resolve()}},g._onUpdateFailure=function(a){if(this._state===this.UPDATING){this.disconnect();var b=this._updatePromise;this._updatePromise=null,b.fail(a)}},g.disconnect=function(b){if(this._state>=this.IDLE){if(this._state===this.IDLE){a.disconnect(b);return}this._state=this.DISCONNECTING,a.disconnect(b),this._state!==this.IDLE&&this._onDisconnected(this._state,"clean-disconnect")}},g._onDisconnected=function(a,b){this._state=this.IDLE,this.disconnectPromise.resolve({state:a,tag:b})};return f})