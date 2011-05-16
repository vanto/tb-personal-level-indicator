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

var PLIOverlay = {
    PLI_NOT_SET: 0,
	PLI_ONLY: 1,
	PLI_GROUP: 2,
	
	init: function () {
		this.initialized = true;
		
		// fetch header parser
		this.headerParser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);
		
		// create atoms for column styling
		this._atom = []
		with (Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService)) {
			this._atom[this.PLI_NOT_SET] = getAtom("pliNotSet");
			this._atom[this.PLI_ONLY] = getAtom("pliOnly");
			this._atom[this.PLI_GROUP] = getAtom("pliGroup");
		}
		
		// register observer
		Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService).addObserver(this, "MsgCreateDBView", false)
	},
	
	loadIdentities: function () {
		// load and cache all identities from all accounts
		this._identities = [];
		
		let accounts = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager).accounts;
		for (var i = 0; i < accounts.Count(); i++) {
			var account = accounts.QueryElementAt(i, Components.interfaces.nsIMsgAccount);

			for(var identCount = 0; identCount < account.identities.Count(); identCount++) {
				var identity = account.identities.QueryElementAt(identCount, Components.interfaces.nsIMsgIdentity);
				this._identities.push(identity.email);
			}
		}
	
	},

	observe: function (subject, topic, data) {
	    this.loadIdentities();
		gDBView.addColumnHandler("PLICol", this)
	},

	extractRecipients: function (hdr, row) {
		let to = this.parseAddresses(hdr.mime2DecodedRecipients);
		let cc = this.parseAddresses(hdr.ccList);
		return to.concat(cc);
	},

	parseAddresses: function (data) {
		const addrs = new Object; const names = new Object; const fulls = new Object;
		const emails = new Array;
		const count = this.headerParser.parseHeadersWithArray(data, addrs, names, fulls);
		for (var i = 0; i < count; i++) {
			emails.push(addrs.value[i]);
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
		let allButMe = all.filter(function(e) { return ids.indexOf(e) < 0 })
		// copy list of recipients and remove all but myself (all identities)
		let meInAll = all.filter(function(e) { return ids.indexOf(e) >= 0 })

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
	getCellProperties: function (row, col, props) {
			let pli = this.calcPLI(this.getHeaderForRow(row));
		if (pli == this.PLI_NOT_SET) {
			props.AppendElement(this._atom[this.PLI_NOT_SET]);
		} else if (pli == this.PLI_ONLY) {
			props.AppendElement(this._atom[this.PLI_ONLY]);
		} else if (pli == this.PLI_GROUP) {
			props.AppendElement(this._atom[this.PLI_GROUP]);
		}
	},
	getRowProperties: function (row, props) {},
	getImageSrc: function (row, col) {},
	getCellText: function (row, col) {},
	getSortStringForRow: function (hdr) {},
	getSortLongForRow: function (hdr) {return this.calcPLI(hdr)},
	isString: function () {return false} 
}

PLIOverlay.init()
