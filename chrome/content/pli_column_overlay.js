/*
 * Personal Level Indicator Plugin for Thunderbird
 * Copyright (C) 2011  Tammo van Lessen
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/* jslint moz: true */

var PLIOverlay = {
    PLI_NOT_SET: 0,
    PLI_ONLY: 1,
    PLI_GROUP: 2,
    PLI_CHAR_MODE: "gmailchars",

    init: function () {
        this.initialized = true;

        // fetch header parser
        this.headerParser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);

        // register observer
        Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService).addObserver(this, "MsgCreateDBView", false);

        // load addon preferences
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("personallevelindicator.");
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
        this.prefs.addObserver("", this, false);
        this.mode = this.prefs.getCharPref("mode");

        // observe accounts
        this.accountPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("mail.identity.");
        this.accountPrefs.QueryInterface(Components.interfaces.nsIPrefBranch);
        this.accountPrefs.addObserver("", this, false);

    },

    loadIdentities: function () {
        // load and cache all identities from all accounts
        this._identities = [];
        let accounts = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager).accounts;
        for (var i = 0; i < accounts.length; i++) {
            var account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);

            for(var identCount = 0; identCount < account.identities.length; identCount++) {
                var identity = account.identities.queryElementAt(identCount, Components.interfaces.nsIMsgIdentity);
                this._identities.push(identity.email.toLowerCase());
            }
        }
    },

    observe: function (subject, topic, data) {
        if (topic == "nsPref:changed") {
            if (subject.root.match(/identity/)) {
                // indentities changed -> reload
                this.loadIdentities();
            } else if (subject.root.match(/personallevelindicator/)) {
                // settings changed
                this.mode = this.prefs.getCharPref("mode");
            }
        } else {
            // Mail view initialized -> register column handler
            this.loadIdentities();
            gDBView.addColumnHandler("PLICol", this);
        }
    },

    extractRecipients: function (hdr, row) {
        let to = this.parseAddresses(hdr.mime2DecodedRecipients);
        let cc = this.parseAddresses(hdr.ccList);
        return to.concat(cc);
    },

    parseAddresses: function (data) {
        const addrs = {}; const names = {}; const fulls = {};
        const emails = [];
        const count = this.headerParser.parseHeadersWithArray(data, addrs, names, fulls);
        for (var i = 0; i < count; i++) {
            emails.push(addrs.value[i].toLowerCase());
        }
        return emails;
    },

    getHeaderForRow: function (row) {
        let key = gDBView.getKeyAt(row);
        return gDBView.getFolderForViewIndex(row).GetMessageHeader(key);
    },

    calcPLI: function (hdr) {
        // get a list of all recipients
        let all = this.extractRecipients(hdr);
        // get a list of own identities
        let ids = this._identities;
        // copy list of recipients and remove myself (all identities)
        let allButMe = all.filter(function(e) { return ids.indexOf(e) < 0; });
        // copy list of recipients and remove all but myself (all identities)
        let meInAll = all.filter(function(e) { return ids.indexOf(e) >= 0; });

        if (meInAll.length > 0) {
            // I'm in the list of the recipients
            if (allButMe.length > 0) {
                // ...together with others
                return this.PLI_GROUP;
            } else {
                // ...only me
                return this.PLI_ONLY;
            }
        } else {
            // I'm not in the list of recipients
            return this.PLI_NOT_SET;
        }
    },


    // nsIMsgCustomColumnHandler methods
    getCellProperties: function (row, col) {
        if (this.mode == this.PLI_CHAR_MODE) {
          return "pliChars";
        } else {
            let pli = this.calcPLI(this.getHeaderForRow(row));
            if (pli == this.PLI_NOT_SET) {
                return "pliNotSet-" + this.mode;
            } else if (pli == this.PLI_ONLY) {
                return "pliOnly-" + this.mode;
            } else if (pli == this.PLI_GROUP) {
                return "pliGroup-" + this.mode;
            } else {
                return "";
            }
        }
    },
    getRowProperties: function (row) { return ""; },
    getImageSrc: function (row, col) { },
    getCellText: function (row, col) {
        if (this.mode == this.PLI_CHAR_MODE) {
            let pli = this.calcPLI(this.getHeaderForRow(row));
            if (pli == this.PLI_NOT_SET) {
                return "";
            } else if (pli == this.PLI_ONLY) {
                return "»";
            } else if (pli == this.PLI_GROUP) {
                return "›";
            } else {
                return "-";
            }
        }
    },
    getSortStringForRow: function (hdr) {},
    getSortLongForRow: function (hdr) { return this.calcPLI(hdr); },
    isString: function () { return false; }
};

PLIOverlay.init();
