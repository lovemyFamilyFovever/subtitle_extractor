//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof require !== "undefined" ? require : a)[b] }) : x)(function(x) {
	if (typeof require !== "undefined") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + x + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
});
//#endregion
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
/**
* @vue/shared v3.5.31
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/* @__NO_SIDE_EFFECTS__ */
function makeMap(str) {
	const map = /* @__PURE__ */ Object.create(null);
	for (const key of str.split(",")) map[key] = 1;
	return (val) => val in map;
}
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var NOOP = () => {};
var NO = () => false;
var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
var isModelListener = (key) => key.startsWith("onUpdate:");
var extend = Object.assign;
var remove = (arr, el) => {
	const i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
};
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isSet = (val) => toTypeString(val) === "[object Set]";
var isDate = (val) => toTypeString(val) === "[object Date]";
var isFunction = (val) => typeof val === "function";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var isPromise = (val) => {
	return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
	return toTypeString(value).slice(8, -1);
};
var isPlainObject = (val) => toTypeString(val) === "[object Object]";
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
var cacheStringFunction = (fn) => {
	const cache = /* @__PURE__ */ Object.create(null);
	return ((str) => {
		return cache[str] || (cache[str] = fn(str));
	});
};
var camelizeRE = /-\w/g;
var camelize = cacheStringFunction((str) => {
	return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
});
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = cacheStringFunction((str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
});
var toHandlerKey = cacheStringFunction((str) => {
	return str ? `on${capitalize(str)}` : ``;
});
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
var invokeArrayFns = (fns, ...arg) => {
	for (let i = 0; i < fns.length; i++) fns[i](...arg);
};
var def = (obj, key, value, writable = false) => {
	Object.defineProperty(obj, key, {
		configurable: true,
		enumerable: false,
		writable,
		value
	});
};
var looseToNumber = (val) => {
	const n = parseFloat(val);
	return isNaN(n) ? val : n;
};
var toNumber = (val) => {
	const n = isString(val) ? Number(val) : NaN;
	return isNaN(n) ? val : n;
};
var _globalThis;
var getGlobalThis = () => {
	return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
	if (isArray(value)) {
		const res = {};
		for (let i = 0; i < value.length; i++) {
			const item = value[i];
			const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
			if (normalized) for (const key in normalized) res[key] = normalized[key];
		}
		return res;
	} else if (isString(value) || isObject(value)) return value;
}
var listDelimiterRE = /;(?![^(]*\))/g;
var propertyDelimiterRE = /:([^]+)/;
var styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
	const ret = {};
	cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
		if (item) {
			const tmp = item.split(propertyDelimiterRE);
			tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
		}
	});
	return ret;
}
function normalizeClass(value) {
	let res = "";
	if (isString(value)) res = value;
	else if (isArray(value)) for (let i = 0; i < value.length; i++) {
		const normalized = normalizeClass(value[i]);
		if (normalized) res += normalized + " ";
	}
	else if (isObject(value)) {
		for (const name in value) if (value[name]) res += name + " ";
	}
	return res.trim();
}
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
specialBooleanAttrs + "";
function includeBooleanAttr(value) {
	return !!value || value === "";
}
function looseCompareArrays(a, b) {
	if (a.length !== b.length) return false;
	let equal = true;
	for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i]);
	return equal;
}
function looseEqual(a, b) {
	if (a === b) return true;
	let aValidType = isDate(a);
	let bValidType = isDate(b);
	if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
	aValidType = isSymbol(a);
	bValidType = isSymbol(b);
	if (aValidType || bValidType) return a === b;
	aValidType = isArray(a);
	bValidType = isArray(b);
	if (aValidType || bValidType) return aValidType && bValidType ? looseCompareArrays(a, b) : false;
	aValidType = isObject(a);
	bValidType = isObject(b);
	if (aValidType || bValidType) {
		if (!aValidType || !bValidType) return false;
		if (Object.keys(a).length !== Object.keys(b).length) return false;
		for (const key in a) {
			const aHasKey = a.hasOwnProperty(key);
			const bHasKey = b.hasOwnProperty(key);
			if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) return false;
		}
	}
	return String(a) === String(b);
}
var isRef$1 = (val) => {
	return !!(val && val["__v_isRef"] === true);
};
var toDisplayString = (val) => {
	return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
var replacer = (_key, val) => {
	if (isRef$1(val)) return replacer(_key, val.value);
	else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
		entries[stringifySymbol(key, i) + " =>"] = val2;
		return entries;
	}, {}) };
	else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
	else if (isSymbol(val)) return stringifySymbol(val);
	else if (isObject(val) && !isArray(val) && !isPlainObject(val)) return String(val);
	return val;
};
var stringifySymbol = (v, i = "") => {
	var _a;
	return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
};
//#endregion
//#region node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
/**
* @vue/reactivity v3.5.31
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
var activeEffectScope;
var EffectScope = class {
	constructor(detached = false) {
		this.detached = detached;
		/**
		* @internal
		*/
		this._active = true;
		/**
		* @internal track `on` calls, allow `on` call multiple times
		*/
		this._on = 0;
		/**
		* @internal
		*/
		this.effects = [];
		/**
		* @internal
		*/
		this.cleanups = [];
		this._isPaused = false;
		this.__v_skip = true;
		this.parent = activeEffectScope;
		if (!detached && activeEffectScope) this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = true;
			let i, l;
			if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].pause();
			for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
		}
	}
	/**
	* Resumes the effect scope, including all child scopes and effects.
	*/
	resume() {
		if (this._active) {
			if (this._isPaused) {
				this._isPaused = false;
				let i, l;
				if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].resume();
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].resume();
			}
		}
	}
	run(fn) {
		if (this._active) {
			const currentEffectScope = activeEffectScope;
			try {
				activeEffectScope = this;
				return fn();
			} finally {
				activeEffectScope = currentEffectScope;
			}
		}
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	on() {
		if (++this._on === 1) {
			this.prevScope = activeEffectScope;
			activeEffectScope = this;
		}
	}
	/**
	* This should only be called on non-detached scopes
	* @internal
	*/
	off() {
		if (this._on > 0 && --this._on === 0) {
			activeEffectScope = this.prevScope;
			this.prevScope = void 0;
		}
	}
	stop(fromParent) {
		if (this._active) {
			this._active = false;
			let i, l;
			for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
			this.effects.length = 0;
			for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
			this.cleanups.length = 0;
			if (this.scopes) {
				for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].stop(true);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !fromParent) {
				const last = this.parent.scopes.pop();
				if (last && last !== this) {
					this.parent.scopes[this.index] = last;
					last.index = this.index;
				}
			}
			this.parent = void 0;
		}
	}
};
function getCurrentScope() {
	return activeEffectScope;
}
var activeSub;
var pausedQueueEffects = /* @__PURE__ */ new WeakSet();
var ReactiveEffect = class {
	constructor(fn) {
		this.fn = fn;
		/**
		* @internal
		*/
		this.deps = void 0;
		/**
		* @internal
		*/
		this.depsTail = void 0;
		/**
		* @internal
		*/
		this.flags = 5;
		/**
		* @internal
		*/
		this.next = void 0;
		/**
		* @internal
		*/
		this.cleanup = void 0;
		this.scheduler = void 0;
		if (activeEffectScope && activeEffectScope.active) activeEffectScope.effects.push(this);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		if (this.flags & 64) {
			this.flags &= -65;
			if (pausedQueueEffects.has(this)) {
				pausedQueueEffects.delete(this);
				this.trigger();
			}
		}
	}
	/**
	* @internal
	*/
	notify() {
		if (this.flags & 2 && !(this.flags & 32)) return;
		if (!(this.flags & 8)) batch(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2;
		cleanupEffect(this);
		prepareDeps(this);
		const prevEffect = activeSub;
		const prevShouldTrack = shouldTrack;
		activeSub = this;
		shouldTrack = true;
		try {
			return this.fn();
		} finally {
			cleanupDeps(this);
			activeSub = prevEffect;
			shouldTrack = prevShouldTrack;
			this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let link = this.deps; link; link = link.nextDep) removeSub(link);
			this.deps = this.depsTail = void 0;
			cleanupEffect(this);
			this.onStop && this.onStop();
			this.flags &= -2;
		}
	}
	trigger() {
		if (this.flags & 64) pausedQueueEffects.add(this);
		else if (this.scheduler) this.scheduler();
		else this.runIfDirty();
	}
	/**
	* @internal
	*/
	runIfDirty() {
		if (isDirty(this)) this.run();
	}
	get dirty() {
		return isDirty(this);
	}
};
var batchDepth = 0;
var batchedSub;
var batchedComputed;
function batch(sub, isComputed = false) {
	sub.flags |= 8;
	if (isComputed) {
		sub.next = batchedComputed;
		batchedComputed = sub;
		return;
	}
	sub.next = batchedSub;
	batchedSub = sub;
}
function startBatch() {
	batchDepth++;
}
function endBatch() {
	if (--batchDepth > 0) return;
	if (batchedComputed) {
		let e = batchedComputed;
		batchedComputed = void 0;
		while (e) {
			const next = e.next;
			e.next = void 0;
			e.flags &= -9;
			e = next;
		}
	}
	let error;
	while (batchedSub) {
		let e = batchedSub;
		batchedSub = void 0;
		while (e) {
			const next = e.next;
			e.next = void 0;
			e.flags &= -9;
			if (e.flags & 1) try {
				e.trigger();
			} catch (err) {
				if (!error) error = err;
			}
			e = next;
		}
	}
	if (error) throw error;
}
function prepareDeps(sub) {
	for (let link = sub.deps; link; link = link.nextDep) {
		link.version = -1;
		link.prevActiveLink = link.dep.activeLink;
		link.dep.activeLink = link;
	}
}
function cleanupDeps(sub) {
	let head;
	let tail = sub.depsTail;
	let link = tail;
	while (link) {
		const prev = link.prevDep;
		if (link.version === -1) {
			if (link === tail) tail = prev;
			removeSub(link);
			removeDep(link);
		} else head = link;
		link.dep.activeLink = link.prevActiveLink;
		link.prevActiveLink = void 0;
		link = prev;
	}
	sub.deps = head;
	sub.depsTail = tail;
}
function isDirty(sub) {
	for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
	if (sub._dirty) return true;
	return false;
}
function refreshComputed(computed) {
	if (computed.flags & 4 && !(computed.flags & 16)) return;
	computed.flags &= -17;
	if (computed.globalVersion === globalVersion) return;
	computed.globalVersion = globalVersion;
	if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) return;
	computed.flags |= 2;
	const dep = computed.dep;
	const prevSub = activeSub;
	const prevShouldTrack = shouldTrack;
	activeSub = computed;
	shouldTrack = true;
	try {
		prepareDeps(computed);
		const value = computed.fn(computed._value);
		if (dep.version === 0 || hasChanged(value, computed._value)) {
			computed.flags |= 128;
			computed._value = value;
			dep.version++;
		}
	} catch (err) {
		dep.version++;
		throw err;
	} finally {
		activeSub = prevSub;
		shouldTrack = prevShouldTrack;
		cleanupDeps(computed);
		computed.flags &= -3;
	}
}
function removeSub(link, soft = false) {
	const { dep, prevSub, nextSub } = link;
	if (prevSub) {
		prevSub.nextSub = nextSub;
		link.prevSub = void 0;
	}
	if (nextSub) {
		nextSub.prevSub = prevSub;
		link.nextSub = void 0;
	}
	if (dep.subs === link) {
		dep.subs = prevSub;
		if (!prevSub && dep.computed) {
			dep.computed.flags &= -5;
			for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
		}
	}
	if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
}
function removeDep(link) {
	const { prevDep, nextDep } = link;
	if (prevDep) {
		prevDep.nextDep = nextDep;
		link.prevDep = void 0;
	}
	if (nextDep) {
		nextDep.prevDep = prevDep;
		link.nextDep = void 0;
	}
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
	trackStack.push(shouldTrack);
	shouldTrack = false;
}
function resetTracking() {
	const last = trackStack.pop();
	shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
	const { cleanup } = e;
	e.cleanup = void 0;
	if (cleanup) {
		const prevSub = activeSub;
		activeSub = void 0;
		try {
			cleanup();
		} finally {
			activeSub = prevSub;
		}
	}
}
var globalVersion = 0;
var Link = class {
	constructor(sub, dep) {
		this.sub = sub;
		this.dep = dep;
		this.version = dep.version;
		this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
};
var Dep = class {
	constructor(computed) {
		this.computed = computed;
		this.version = 0;
		/**
		* Link between this dep and the current active effect
		*/
		this.activeLink = void 0;
		/**
		* Doubly linked list representing the subscribing effects (tail)
		*/
		this.subs = void 0;
		/**
		* For object property deps cleanup
		*/
		this.map = void 0;
		this.key = void 0;
		/**
		* Subscriber counter
		*/
		this.sc = 0;
		/**
		* @internal
		*/
		this.__v_skip = true;
	}
	track(debugInfo) {
		if (!activeSub || !shouldTrack || activeSub === this.computed) return;
		let link = this.activeLink;
		if (link === void 0 || link.sub !== activeSub) {
			link = this.activeLink = new Link(activeSub, this);
			if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
			else {
				link.prevDep = activeSub.depsTail;
				activeSub.depsTail.nextDep = link;
				activeSub.depsTail = link;
			}
			addSub(link);
		} else if (link.version === -1) {
			link.version = this.version;
			if (link.nextDep) {
				const next = link.nextDep;
				next.prevDep = link.prevDep;
				if (link.prevDep) link.prevDep.nextDep = next;
				link.prevDep = activeSub.depsTail;
				link.nextDep = void 0;
				activeSub.depsTail.nextDep = link;
				activeSub.depsTail = link;
				if (activeSub.deps === link) activeSub.deps = next;
			}
		}
		return link;
	}
	trigger(debugInfo) {
		this.version++;
		globalVersion++;
		this.notify(debugInfo);
	}
	notify(debugInfo) {
		startBatch();
		try {
			for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
		} finally {
			endBatch();
		}
	}
};
function addSub(link) {
	link.dep.sc++;
	if (link.sub.flags & 4) {
		const computed = link.dep.computed;
		if (computed && !link.dep.subs) {
			computed.flags |= 20;
			for (let l = computed.deps; l; l = l.nextDep) addSub(l);
		}
		const currentTail = link.dep.subs;
		if (currentTail !== link) {
			link.prevSub = currentTail;
			if (currentTail) currentTail.nextSub = link;
		}
		link.dep.subs = link;
	}
}
var targetMap = /* @__PURE__ */ new WeakMap();
var ITERATE_KEY = /* @__PURE__ */ Symbol("");
var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol("");
var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol("");
function track(target, type, key) {
	if (shouldTrack && activeSub) {
		let depsMap = targetMap.get(target);
		if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
		let dep = depsMap.get(key);
		if (!dep) {
			depsMap.set(key, dep = new Dep());
			dep.map = depsMap;
			dep.key = key;
		}
		dep.track();
	}
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
	const depsMap = targetMap.get(target);
	if (!depsMap) {
		globalVersion++;
		return;
	}
	const run = (dep) => {
		if (dep) dep.trigger();
	};
	startBatch();
	if (type === "clear") depsMap.forEach(run);
	else {
		const targetIsArray = isArray(target);
		const isArrayIndex = targetIsArray && isIntegerKey(key);
		if (targetIsArray && key === "length") {
			const newLength = Number(newValue);
			depsMap.forEach((dep, key2) => {
				if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
			});
		} else {
			if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
			if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
			switch (type) {
				case "add":
					if (!targetIsArray) {
						run(depsMap.get(ITERATE_KEY));
						if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
					} else if (isArrayIndex) run(depsMap.get("length"));
					break;
				case "delete":
					if (!targetIsArray) {
						run(depsMap.get(ITERATE_KEY));
						if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
					}
					break;
				case "set":
					if (isMap(target)) run(depsMap.get(ITERATE_KEY));
					break;
			}
		}
	}
	endBatch();
}
function reactiveReadArray(array) {
	const raw = /* @__PURE__ */ toRaw(array);
	if (raw === array) return raw;
	track(raw, "iterate", ARRAY_ITERATE_KEY);
	return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
	track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
	return arr;
}
function toWrapped(target, item) {
	if (/* @__PURE__ */ isReadonly(target)) return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
	return toReactive(item);
}
var arrayInstrumentations = {
	__proto__: null,
	[Symbol.iterator]() {
		return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
	},
	concat(...args) {
		return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
	},
	entries() {
		return iterator(this, "entries", (value) => {
			value[1] = toWrapped(this, value[1]);
			return value;
		});
	},
	every(fn, thisArg) {
		return apply(this, "every", fn, thisArg, void 0, arguments);
	},
	filter(fn, thisArg) {
		return apply(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
	},
	find(fn, thisArg) {
		return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
	},
	findIndex(fn, thisArg) {
		return apply(this, "findIndex", fn, thisArg, void 0, arguments);
	},
	findLast(fn, thisArg) {
		return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
	},
	findLastIndex(fn, thisArg) {
		return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
	},
	forEach(fn, thisArg) {
		return apply(this, "forEach", fn, thisArg, void 0, arguments);
	},
	includes(...args) {
		return searchProxy(this, "includes", args);
	},
	indexOf(...args) {
		return searchProxy(this, "indexOf", args);
	},
	join(separator) {
		return reactiveReadArray(this).join(separator);
	},
	lastIndexOf(...args) {
		return searchProxy(this, "lastIndexOf", args);
	},
	map(fn, thisArg) {
		return apply(this, "map", fn, thisArg, void 0, arguments);
	},
	pop() {
		return noTracking(this, "pop");
	},
	push(...args) {
		return noTracking(this, "push", args);
	},
	reduce(fn, ...args) {
		return reduce(this, "reduce", fn, args);
	},
	reduceRight(fn, ...args) {
		return reduce(this, "reduceRight", fn, args);
	},
	shift() {
		return noTracking(this, "shift");
	},
	some(fn, thisArg) {
		return apply(this, "some", fn, thisArg, void 0, arguments);
	},
	splice(...args) {
		return noTracking(this, "splice", args);
	},
	toReversed() {
		return reactiveReadArray(this).toReversed();
	},
	toSorted(comparer) {
		return reactiveReadArray(this).toSorted(comparer);
	},
	toSpliced(...args) {
		return reactiveReadArray(this).toSpliced(...args);
	},
	unshift(...args) {
		return noTracking(this, "unshift", args);
	},
	values() {
		return iterator(this, "values", (item) => toWrapped(this, item));
	}
};
function iterator(self, method, wrapValue) {
	const arr = shallowReadArray(self);
	const iter = arr[method]();
	if (arr !== self && !/* @__PURE__ */ isShallow(self)) {
		iter._next = iter.next;
		iter.next = () => {
			const result = iter._next();
			if (!result.done) result.value = wrapValue(result.value);
			return result;
		};
	}
	return iter;
}
var arrayProto = Array.prototype;
function apply(self, method, fn, thisArg, wrappedRetFn, args) {
	const arr = shallowReadArray(self);
	const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
	const methodFn = arr[method];
	if (methodFn !== arrayProto[method]) {
		const result2 = methodFn.apply(self, args);
		return needsWrap ? toReactive(result2) : result2;
	}
	let wrappedFn = fn;
	if (arr !== self) {
		if (needsWrap) wrappedFn = function(item, index) {
			return fn.call(this, toWrapped(self, item), index, self);
		};
		else if (fn.length > 2) wrappedFn = function(item, index) {
			return fn.call(this, item, index, self);
		};
	}
	const result = methodFn.call(arr, wrappedFn, thisArg);
	return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self, method, fn, args) {
	const arr = shallowReadArray(self);
	const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
	let wrappedFn = fn;
	let wrapInitialAccumulator = false;
	if (arr !== self) {
		if (needsWrap) {
			wrapInitialAccumulator = args.length === 0;
			wrappedFn = function(acc, item, index) {
				if (wrapInitialAccumulator) {
					wrapInitialAccumulator = false;
					acc = toWrapped(self, acc);
				}
				return fn.call(this, acc, toWrapped(self, item), index, self);
			};
		} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
			return fn.call(this, acc, item, index, self);
		};
	}
	const result = arr[method](wrappedFn, ...args);
	return wrapInitialAccumulator ? toWrapped(self, result) : result;
}
function searchProxy(self, method, args) {
	const arr = /* @__PURE__ */ toRaw(self);
	track(arr, "iterate", ARRAY_ITERATE_KEY);
	const res = arr[method](...args);
	if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
		args[0] = /* @__PURE__ */ toRaw(args[0]);
		return arr[method](...args);
	}
	return res;
}
function noTracking(self, method, args = []) {
	pauseTracking();
	startBatch();
	const res = (/* @__PURE__ */ toRaw(self))[method].apply(self, args);
	endBatch();
	resetTracking();
	return res;
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
function hasOwnProperty(key) {
	if (!isSymbol(key)) key = String(key);
	const obj = /* @__PURE__ */ toRaw(this);
	track(obj, "has", key);
	return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
	constructor(_isReadonly = false, _isShallow = false) {
		this._isReadonly = _isReadonly;
		this._isShallow = _isShallow;
	}
	get(target, key, receiver) {
		if (key === "__v_skip") return target["__v_skip"];
		const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
		if (key === "__v_isReactive") return !isReadonly2;
		else if (key === "__v_isReadonly") return isReadonly2;
		else if (key === "__v_isShallow") return isShallow2;
		else if (key === "__v_raw") {
			if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
			return;
		}
		const targetIsArray = isArray(target);
		if (!isReadonly2) {
			let fn;
			if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
			if (key === "hasOwnProperty") return hasOwnProperty;
		}
		const res = Reflect.get(target, key, /* @__PURE__ */ isRef(target) ? target : receiver);
		if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
		if (!isReadonly2) track(target, "get", key);
		if (isShallow2) return res;
		if (/* @__PURE__ */ isRef(res)) {
			const value = targetIsArray && isIntegerKey(key) ? res : res.value;
			return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
		}
		if (isObject(res)) return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
		return res;
	}
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
	constructor(isShallow2 = false) {
		super(false, isShallow2);
	}
	set(target, key, value, receiver) {
		let oldValue = target[key];
		const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
		if (!this._isShallow) {
			const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
			if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
				oldValue = /* @__PURE__ */ toRaw(oldValue);
				value = /* @__PURE__ */ toRaw(value);
			}
			if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) if (isOldValueReadonly) return true;
			else {
				oldValue.value = value;
				return true;
			}
		}
		const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
		const result = Reflect.set(target, key, value, /* @__PURE__ */ isRef(target) ? target : receiver);
		if (target === /* @__PURE__ */ toRaw(receiver)) {
			if (!hadKey) trigger(target, "add", key, value);
			else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
		}
		return result;
	}
	deleteProperty(target, key) {
		const hadKey = hasOwn(target, key);
		const oldValue = target[key];
		const result = Reflect.deleteProperty(target, key);
		if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
		return result;
	}
	has(target, key) {
		const result = Reflect.has(target, key);
		if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
		return result;
	}
	ownKeys(target) {
		track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
		return Reflect.ownKeys(target);
	}
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
	constructor(isShallow2 = false) {
		super(true, isShallow2);
	}
	set(target, key) {
		return true;
	}
	deleteProperty(target, key) {
		return true;
	}
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
var shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
	return function(...args) {
		const target = this["__v_raw"];
		const rawTarget = /* @__PURE__ */ toRaw(target);
		const targetIsMap = isMap(rawTarget);
		const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
		const isKeyOnly = method === "keys" && targetIsMap;
		const innerIterator = target[method](...args);
		const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
		!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
		return extend(Object.create(innerIterator), { next() {
			const { value, done } = innerIterator.next();
			return done ? {
				value,
				done
			} : {
				value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
				done
			};
		} });
	};
}
function createReadonlyMethod(type) {
	return function(...args) {
		return type === "delete" ? false : type === "clear" ? void 0 : this;
	};
}
function createInstrumentations(readonly, shallow) {
	const instrumentations = {
		get(key) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const rawKey = /* @__PURE__ */ toRaw(key);
			if (!readonly) {
				if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
				track(rawTarget, "get", rawKey);
			}
			const { has } = getProto(rawTarget);
			const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
			if (has.call(rawTarget, key)) return wrap(target.get(key));
			else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
			else if (target !== rawTarget) target.get(key);
		},
		get size() {
			const target = this["__v_raw"];
			!readonly && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
			return target.size;
		},
		has(key) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const rawKey = /* @__PURE__ */ toRaw(key);
			if (!readonly) {
				if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
				track(rawTarget, "has", rawKey);
			}
			return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
		},
		forEach(callback, thisArg) {
			const observed = this;
			const target = observed["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
			!readonly && track(rawTarget, "iterate", ITERATE_KEY);
			return target.forEach((value, key) => {
				return callback.call(thisArg, wrap(value), wrap(key), observed);
			});
		}
	};
	extend(instrumentations, readonly ? {
		add: createReadonlyMethod("add"),
		set: createReadonlyMethod("set"),
		delete: createReadonlyMethod("delete"),
		clear: createReadonlyMethod("clear")
	} : {
		add(value) {
			const target = /* @__PURE__ */ toRaw(this);
			const proto = getProto(target);
			const rawValue = /* @__PURE__ */ toRaw(value);
			const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
			if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
				target.add(valueToAdd);
				trigger(target, "add", valueToAdd, valueToAdd);
			}
			return this;
		},
		set(key, value) {
			if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) value = /* @__PURE__ */ toRaw(value);
			const target = /* @__PURE__ */ toRaw(this);
			const { has, get } = getProto(target);
			let hadKey = has.call(target, key);
			if (!hadKey) {
				key = /* @__PURE__ */ toRaw(key);
				hadKey = has.call(target, key);
			}
			const oldValue = get.call(target, key);
			target.set(key, value);
			if (!hadKey) trigger(target, "add", key, value);
			else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			return this;
		},
		delete(key) {
			const target = /* @__PURE__ */ toRaw(this);
			const { has, get } = getProto(target);
			let hadKey = has.call(target, key);
			if (!hadKey) {
				key = /* @__PURE__ */ toRaw(key);
				hadKey = has.call(target, key);
			}
			const oldValue = get ? get.call(target, key) : void 0;
			const result = target.delete(key);
			if (hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		},
		clear() {
			const target = /* @__PURE__ */ toRaw(this);
			const hadItems = target.size !== 0;
			const oldTarget = void 0;
			const result = target.clear();
			if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
			return result;
		}
	});
	[
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((method) => {
		instrumentations[method] = createIterableMethod(method, readonly, shallow);
	});
	return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
	const instrumentations = createInstrumentations(isReadonly2, shallow);
	return (target, key, receiver) => {
		if (key === "__v_isReactive") return !isReadonly2;
		else if (key === "__v_isReadonly") return isReadonly2;
		else if (key === "__v_raw") return target;
		return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
	};
}
var mutableCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, false) };
var shallowCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, true) };
var readonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, false) };
var reactiveMap = /* @__PURE__ */ new WeakMap();
var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
var readonlyMap = /* @__PURE__ */ new WeakMap();
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
	switch (rawType) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
function getTargetType(value) {
	return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
/* @__NO_SIDE_EFFECTS__ */
function reactive(target) {
	if (/* @__PURE__ */ isReadonly(target)) return target;
	return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/* @__NO_SIDE_EFFECTS__ */
function shallowReactive(target) {
	return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
/* @__NO_SIDE_EFFECTS__ */
function readonly(target) {
	return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
	if (!isObject(target)) return target;
	if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
	const targetType = getTargetType(target);
	if (targetType === 0) return target;
	const existingProxy = proxyMap.get(target);
	if (existingProxy) return existingProxy;
	const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
	proxyMap.set(target, proxy);
	return proxy;
}
/* @__NO_SIDE_EFFECTS__ */
function isReactive(value) {
	if (/* @__PURE__ */ isReadonly(value)) return /* @__PURE__ */ isReactive(value["__v_raw"]);
	return !!(value && value["__v_isReactive"]);
}
/* @__NO_SIDE_EFFECTS__ */
function isReadonly(value) {
	return !!(value && value["__v_isReadonly"]);
}
/* @__NO_SIDE_EFFECTS__ */
function isShallow(value) {
	return !!(value && value["__v_isShallow"]);
}
/* @__NO_SIDE_EFFECTS__ */
function isProxy(value) {
	return value ? !!value["__v_raw"] : false;
}
/* @__NO_SIDE_EFFECTS__ */
function toRaw(observed) {
	const raw = observed && observed["__v_raw"];
	return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
	if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
	return value;
}
var toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
var toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
/* @__NO_SIDE_EFFECTS__ */
function isRef(r) {
	return r ? r["__v_isRef"] === true : false;
}
/* @__NO_SIDE_EFFECTS__ */
function ref(value) {
	return createRef(value, false);
}
function createRef(rawValue, shallow) {
	if (/* @__PURE__ */ isRef(rawValue)) return rawValue;
	return new RefImpl(rawValue, shallow);
}
var RefImpl = class {
	constructor(value, isShallow2) {
		this.dep = new Dep();
		this["__v_isRef"] = true;
		this["__v_isShallow"] = false;
		this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
		this._value = isShallow2 ? value : toReactive(value);
		this["__v_isShallow"] = isShallow2;
	}
	get value() {
		this.dep.track();
		return this._value;
	}
	set value(newValue) {
		const oldValue = this._rawValue;
		const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
		newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
		if (hasChanged(newValue, oldValue)) {
			this._rawValue = newValue;
			this._value = useDirectValue ? newValue : toReactive(newValue);
			this.dep.trigger();
		}
	}
};
function unref(ref2) {
	return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
var shallowUnwrapHandlers = {
	get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
	set: (target, key, value, receiver) => {
		const oldValue = target[key];
		if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
			oldValue.value = value;
			return true;
		} else return Reflect.set(target, key, value, receiver);
	}
};
function proxyRefs(objectWithRefs) {
	return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
var ComputedRefImpl = class {
	constructor(fn, setter, isSSR) {
		this.fn = fn;
		this.setter = setter;
		/**
		* @internal
		*/
		this._value = void 0;
		/**
		* @internal
		*/
		this.dep = new Dep(this);
		/**
		* @internal
		*/
		this.__v_isRef = true;
		/**
		* @internal
		*/
		this.deps = void 0;
		/**
		* @internal
		*/
		this.depsTail = void 0;
		/**
		* @internal
		*/
		this.flags = 16;
		/**
		* @internal
		*/
		this.globalVersion = globalVersion - 1;
		/**
		* @internal
		*/
		this.next = void 0;
		this.effect = this;
		this["__v_isReadonly"] = !setter;
		this.isSSR = isSSR;
	}
	/**
	* @internal
	*/
	notify() {
		this.flags |= 16;
		if (!(this.flags & 8) && activeSub !== this) {
			batch(this, true);
			return true;
		}
	}
	get value() {
		const link = this.dep.track();
		refreshComputed(this);
		if (link) link.version = this.dep.version;
		return this._value;
	}
	set value(newValue) {
		if (this.setter) this.setter(newValue);
	}
};
/* @__NO_SIDE_EFFECTS__ */
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
	let getter;
	let setter;
	if (isFunction(getterOrOptions)) getter = getterOrOptions;
	else {
		getter = getterOrOptions.get;
		setter = getterOrOptions.set;
	}
	return new ComputedRefImpl(getter, setter, isSSR);
}
var INITIAL_WATCHER_VALUE = {};
var cleanupMap = /* @__PURE__ */ new WeakMap();
var activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
	if (owner) {
		let cleanups = cleanupMap.get(owner);
		if (!cleanups) cleanupMap.set(owner, cleanups = []);
		cleanups.push(cleanupFn);
	}
}
function watch$1(source, cb, options = EMPTY_OBJ) {
	const { immediate, deep, once, scheduler, augmentJob, call } = options;
	const reactiveGetter = (source2) => {
		if (deep) return source2;
		if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0) return traverse(source2, 1);
		return traverse(source2);
	};
	let effect;
	let getter;
	let cleanup;
	let boundCleanup;
	let forceTrigger = false;
	let isMultiSource = false;
	if (/* @__PURE__ */ isRef(source)) {
		getter = () => source.value;
		forceTrigger = /* @__PURE__ */ isShallow(source);
	} else if (/* @__PURE__ */ isReactive(source)) {
		getter = () => reactiveGetter(source);
		forceTrigger = true;
	} else if (isArray(source)) {
		isMultiSource = true;
		forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
		getter = () => source.map((s) => {
			if (/* @__PURE__ */ isRef(s)) return s.value;
			else if (/* @__PURE__ */ isReactive(s)) return reactiveGetter(s);
			else if (isFunction(s)) return call ? call(s, 2) : s();
		});
	} else if (isFunction(source)) if (cb) getter = call ? () => call(source, 2) : source;
	else getter = () => {
		if (cleanup) {
			pauseTracking();
			try {
				cleanup();
			} finally {
				resetTracking();
			}
		}
		const currentEffect = activeWatcher;
		activeWatcher = effect;
		try {
			return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
		} finally {
			activeWatcher = currentEffect;
		}
	};
	else getter = NOOP;
	if (cb && deep) {
		const baseGetter = getter;
		const depth = deep === true ? Infinity : deep;
		getter = () => traverse(baseGetter(), depth);
	}
	const scope = getCurrentScope();
	const watchHandle = () => {
		effect.stop();
		if (scope && scope.active) remove(scope.effects, effect);
	};
	if (once && cb) {
		const _cb = cb;
		cb = (...args) => {
			_cb(...args);
			watchHandle();
		};
	}
	let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
	const job = (immediateFirstRun) => {
		if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) return;
		if (cb) {
			const newValue = effect.run();
			if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
				if (cleanup) cleanup();
				const currentWatcher = activeWatcher;
				activeWatcher = effect;
				try {
					const args = [
						newValue,
						oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
						boundCleanup
					];
					oldValue = newValue;
					call ? call(cb, 3, args) : cb(...args);
				} finally {
					activeWatcher = currentWatcher;
				}
			}
		} else effect.run();
	};
	if (augmentJob) augmentJob(job);
	effect = new ReactiveEffect(getter);
	effect.scheduler = scheduler ? () => scheduler(job, false) : job;
	boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
	cleanup = effect.onStop = () => {
		const cleanups = cleanupMap.get(effect);
		if (cleanups) {
			if (call) call(cleanups, 4);
			else for (const cleanup2 of cleanups) cleanup2();
			cleanupMap.delete(effect);
		}
	};
	if (cb) if (immediate) job(true);
	else oldValue = effect.run();
	else if (scheduler) scheduler(job.bind(null, true), true);
	else effect.run();
	watchHandle.pause = effect.pause.bind(effect);
	watchHandle.resume = effect.resume.bind(effect);
	watchHandle.stop = watchHandle;
	return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
	if (depth <= 0 || !isObject(value) || value["__v_skip"]) return value;
	seen = seen || /* @__PURE__ */ new Map();
	if ((seen.get(value) || 0) >= depth) return value;
	seen.set(value, depth);
	depth--;
	if (/* @__PURE__ */ isRef(value)) traverse(value.value, depth, seen);
	else if (isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
	else if (isSet(value) || isMap(value)) value.forEach((v) => {
		traverse(v, depth, seen);
	});
	else if (isPlainObject(value)) {
		for (const key in value) traverse(value[key], depth, seen);
		for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
	}
	return value;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
/**
* @vue/runtime-core v3.5.31
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function callWithErrorHandling(fn, instance, type, args) {
	try {
		return args ? fn(...args) : fn();
	} catch (err) {
		handleError(err, instance, type);
	}
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
	if (isFunction(fn)) {
		const res = callWithErrorHandling(fn, instance, type, args);
		if (res && isPromise(res)) res.catch((err) => {
			handleError(err, instance, type);
		});
		return res;
	}
	if (isArray(fn)) {
		const values = [];
		for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
		return values;
	}
}
function handleError(err, instance, type, throwInDev = true) {
	const contextVNode = instance ? instance.vnode : null;
	const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
	if (instance) {
		let cur = instance.parent;
		const exposedInstance = instance.proxy;
		const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
		while (cur) {
			const errorCapturedHooks = cur.ec;
			if (errorCapturedHooks) {
				for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
			}
			cur = cur.parent;
		}
		if (errorHandler) {
			pauseTracking();
			callWithErrorHandling(errorHandler, null, 10, [
				err,
				exposedInstance,
				errorInfo
			]);
			resetTracking();
			return;
		}
	}
	logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
	if (throwInProd) throw err;
	else console.error(err);
}
var queue = [];
var flushIndex = -1;
var pendingPostFlushCbs = [];
var activePostFlushCbs = null;
var postFlushIndex = 0;
var resolvedPromise = /* @__PURE__ */ Promise.resolve();
var currentFlushPromise = null;
function nextTick(fn) {
	const p = currentFlushPromise || resolvedPromise;
	return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
function findInsertionIndex(id) {
	let start = flushIndex + 1;
	let end = queue.length;
	while (start < end) {
		const middle = start + end >>> 1;
		const middleJob = queue[middle];
		const middleJobId = getId(middleJob);
		if (middleJobId < id || middleJobId === id && middleJob.flags & 2) start = middle + 1;
		else end = middle;
	}
	return start;
}
function queueJob(job) {
	if (!(job.flags & 1)) {
		const jobId = getId(job);
		const lastJob = queue[queue.length - 1];
		if (!lastJob || !(job.flags & 2) && jobId >= getId(lastJob)) queue.push(job);
		else queue.splice(findInsertionIndex(jobId), 0, job);
		job.flags |= 1;
		queueFlush();
	}
}
function queueFlush() {
	if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs);
}
function queuePostFlushCb(cb) {
	if (!isArray(cb)) {
		if (activePostFlushCbs && cb.id === -1) activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
		else if (!(cb.flags & 1)) {
			pendingPostFlushCbs.push(cb);
			cb.flags |= 1;
		}
	} else pendingPostFlushCbs.push(...cb);
	queueFlush();
}
function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
	for (; i < queue.length; i++) {
		const cb = queue[i];
		if (cb && cb.flags & 2) {
			if (instance && cb.id !== instance.uid) continue;
			queue.splice(i, 1);
			i--;
			if (cb.flags & 4) cb.flags &= -2;
			cb();
			if (!(cb.flags & 4)) cb.flags &= -2;
		}
	}
}
function flushPostFlushCbs(seen) {
	if (pendingPostFlushCbs.length) {
		const deduped = [...new Set(pendingPostFlushCbs)].sort((a, b) => getId(a) - getId(b));
		pendingPostFlushCbs.length = 0;
		if (activePostFlushCbs) {
			activePostFlushCbs.push(...deduped);
			return;
		}
		activePostFlushCbs = deduped;
		for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
			const cb = activePostFlushCbs[postFlushIndex];
			if (cb.flags & 4) cb.flags &= -2;
			if (!(cb.flags & 8)) cb();
			cb.flags &= -2;
		}
		activePostFlushCbs = null;
		postFlushIndex = 0;
	}
}
var getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
	try {
		for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
			const job = queue[flushIndex];
			if (job && !(job.flags & 8)) {
				if (job.flags & 4) job.flags &= -2;
				callWithErrorHandling(job, job.i, job.i ? 15 : 14);
				if (!(job.flags & 4)) job.flags &= -2;
			}
		}
	} finally {
		for (; flushIndex < queue.length; flushIndex++) {
			const job = queue[flushIndex];
			if (job) job.flags &= -2;
		}
		flushIndex = -1;
		queue.length = 0;
		flushPostFlushCbs(seen);
		currentFlushPromise = null;
		if (queue.length || pendingPostFlushCbs.length) flushJobs(seen);
	}
}
var currentRenderingInstance = null;
var currentScopeId = null;
function setCurrentRenderingInstance(instance) {
	const prev = currentRenderingInstance;
	currentRenderingInstance = instance;
	currentScopeId = instance && instance.type.__scopeId || null;
	return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
	if (!ctx) return fn;
	if (fn._n) return fn;
	const renderFnWithContext = (...args) => {
		if (renderFnWithContext._d) setBlockTracking(-1);
		const prevInstance = setCurrentRenderingInstance(ctx);
		let res;
		try {
			res = fn(...args);
		} finally {
			setCurrentRenderingInstance(prevInstance);
			if (renderFnWithContext._d) setBlockTracking(1);
		}
		return res;
	};
	renderFnWithContext._n = true;
	renderFnWithContext._c = true;
	renderFnWithContext._d = true;
	return renderFnWithContext;
}
function withDirectives(vnode, directives) {
	if (currentRenderingInstance === null) return vnode;
	const instance = getComponentPublicInstance(currentRenderingInstance);
	const bindings = vnode.dirs || (vnode.dirs = []);
	for (let i = 0; i < directives.length; i++) {
		let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
		if (dir) {
			if (isFunction(dir)) dir = {
				mounted: dir,
				updated: dir
			};
			if (dir.deep) traverse(value);
			bindings.push({
				dir,
				instance,
				value,
				oldValue: void 0,
				arg,
				modifiers
			});
		}
	}
	return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
	const bindings = vnode.dirs;
	const oldBindings = prevVNode && prevVNode.dirs;
	for (let i = 0; i < bindings.length; i++) {
		const binding = bindings[i];
		if (oldBindings) binding.oldValue = oldBindings[i].value;
		let hook = binding.dir[name];
		if (hook) {
			pauseTracking();
			callWithAsyncErrorHandling(hook, instance, 8, [
				vnode.el,
				binding,
				vnode,
				prevVNode
			]);
			resetTracking();
		}
	}
}
function provide(key, value) {
	if (currentInstance) {
		let provides = currentInstance.provides;
		const parentProvides = currentInstance.parent && currentInstance.parent.provides;
		if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
		provides[key] = value;
	}
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
	const instance = getCurrentInstance();
	if (instance || currentApp) {
		let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
		if (provides && key in provides) return provides[key];
		else if (arguments.length > 1) return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
	}
}
var ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
var useSSRContext = () => {
	{
		const ctx = inject(ssrContextKey);
		if (!ctx) {}
		return ctx;
	}
};
function watch(source, cb, options) {
	return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
	const { immediate, deep, flush, once } = options;
	const baseWatchOptions = extend({}, options);
	const runsImmediately = cb && immediate || !cb && flush !== "post";
	let ssrCleanup;
	if (isInSSRComponentSetup) {
		if (flush === "sync") {
			const ctx = useSSRContext();
			ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
		} else if (!runsImmediately) {
			const watchStopHandle = () => {};
			watchStopHandle.stop = NOOP;
			watchStopHandle.resume = NOOP;
			watchStopHandle.pause = NOOP;
			return watchStopHandle;
		}
	}
	const instance = currentInstance;
	baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
	let isPre = false;
	if (flush === "post") baseWatchOptions.scheduler = (job) => {
		queuePostRenderEffect(job, instance && instance.suspense);
	};
	else if (flush !== "sync") {
		isPre = true;
		baseWatchOptions.scheduler = (job, isFirstRun) => {
			if (isFirstRun) job();
			else queueJob(job);
		};
	}
	baseWatchOptions.augmentJob = (job) => {
		if (cb) job.flags |= 4;
		if (isPre) {
			job.flags |= 2;
			if (instance) {
				job.id = instance.uid;
				job.i = instance;
			}
		}
	};
	const watchHandle = watch$1(source, cb, baseWatchOptions);
	if (isInSSRComponentSetup) {
		if (ssrCleanup) ssrCleanup.push(watchHandle);
		else if (runsImmediately) watchHandle();
	}
	return watchHandle;
}
function instanceWatch(source, value, options) {
	const publicThis = this.proxy;
	const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
	let cb;
	if (isFunction(value)) cb = value;
	else {
		cb = value.handler;
		options = value;
	}
	const reset = setCurrentInstance(this);
	const res = doWatch(getter, cb.bind(publicThis), options);
	reset();
	return res;
}
function createPathGetter(ctx, path) {
	const segments = path.split(".");
	return () => {
		let cur = ctx;
		for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
		return cur;
	};
}
var TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
var isTeleport = (type) => type.__isTeleport;
var isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
var isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
var isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
var isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
var resolveTarget = (props, select) => {
	const targetSelector = props && props.to;
	if (isString(targetSelector)) if (!select) return null;
	else return select(targetSelector);
	else return targetSelector;
};
var TeleportImpl = {
	name: "Teleport",
	__isTeleport: true,
	process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
		const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment } } = internals;
		const disabled = isTeleportDisabled(n2.props);
		let { shapeFlag, children, dynamicChildren } = n2;
		if (n1 == null) {
			const placeholder = n2.el = createText("");
			const mainAnchor = n2.anchor = createText("");
			insert(placeholder, container, anchor);
			insert(mainAnchor, container, anchor);
			const mount = (container2, anchor2) => {
				if (shapeFlag & 16) mountChildren(children, container2, anchor2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			};
			const mountToTarget = () => {
				const target = n2.target = resolveTarget(n2.props, querySelector);
				const targetAnchor = prepareAnchor(target, n2, createText, insert);
				if (target) {
					if (namespace !== "svg" && isTargetSVG(target)) namespace = "svg";
					else if (namespace !== "mathml" && isTargetMathML(target)) namespace = "mathml";
					if (parentComponent && parentComponent.isCE) (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
					if (!disabled) {
						mount(target, targetAnchor);
						updateCssVars(n2, false);
					}
				}
			};
			if (disabled) {
				mount(container, mainAnchor);
				updateCssVars(n2, true);
			}
			if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
				n2.el.__isMounted = false;
				queuePostRenderEffect(() => {
					if (n2.el.__isMounted !== false) return;
					mountToTarget();
					delete n2.el.__isMounted;
				}, parentSuspense);
			} else mountToTarget();
		} else {
			n2.el = n1.el;
			n2.targetStart = n1.targetStart;
			const mainAnchor = n2.anchor = n1.anchor;
			const target = n2.target = n1.target;
			const targetAnchor = n2.targetAnchor = n1.targetAnchor;
			if (n1.el.__isMounted === false) {
				queuePostRenderEffect(() => {
					TeleportImpl.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				}, parentSuspense);
				return;
			}
			const wasDisabled = isTeleportDisabled(n1.props);
			const currentContainer = wasDisabled ? container : target;
			const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
			if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
			else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
			if (dynamicChildren) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, namespace, slotScopeIds);
				traverseStaticChildren(n1, n2, true);
			} else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, false);
			if (disabled) {
				if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, 1);
				else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
			} else if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
				const nextTarget = n2.target = resolveTarget(n2.props, querySelector);
				if (nextTarget) moveTeleport(n2, nextTarget, null, internals, 0);
			} else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, 1);
			updateCssVars(n2, disabled);
		}
	},
	remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
		const { shapeFlag, children, anchor, targetStart, targetAnchor, target, props } = vnode;
		if (target) {
			hostRemove(targetStart);
			hostRemove(targetAnchor);
		}
		doRemove && hostRemove(anchor);
		if (shapeFlag & 16) {
			const shouldRemove = doRemove || !isTeleportDisabled(props);
			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				unmount(child, parentComponent, parentSuspense, shouldRemove, !!child.dynamicChildren);
			}
		}
	},
	move: moveTeleport,
	hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
	if (moveType === 0) insert(vnode.targetAnchor, container, parentAnchor);
	const { el, anchor, shapeFlag, children, props } = vnode;
	const isReorder = moveType === 2;
	if (isReorder) insert(el, container, parentAnchor);
	if (!isReorder || isTeleportDisabled(props)) {
		if (shapeFlag & 16) for (let i = 0; i < children.length; i++) move(children[i], container, parentAnchor, 2);
	}
	if (isReorder) insert(anchor, container, parentAnchor);
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector, insert, createText } }, hydrateChildren) {
	function hydrateAnchor(target2, targetNode) {
		let targetAnchor = targetNode;
		while (targetAnchor) {
			if (targetAnchor && targetAnchor.nodeType === 8) {
				if (targetAnchor.data === "teleport start anchor") vnode.targetStart = targetAnchor;
				else if (targetAnchor.data === "teleport anchor") {
					vnode.targetAnchor = targetAnchor;
					target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
					break;
				}
			}
			targetAnchor = nextSibling(targetAnchor);
		}
	}
	function hydrateDisabledTeleport(node2, vnode2) {
		vnode2.anchor = hydrateChildren(nextSibling(node2), vnode2, parentNode(node2), parentComponent, parentSuspense, slotScopeIds, optimized);
	}
	const target = vnode.target = resolveTarget(vnode.props, querySelector);
	const disabled = isTeleportDisabled(vnode.props);
	if (target) {
		const targetNode = target._lpa || target.firstChild;
		if (vnode.shapeFlag & 16) if (disabled) {
			hydrateDisabledTeleport(node, vnode);
			hydrateAnchor(target, targetNode);
			if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert, parentNode(node) === target ? node : null);
		} else {
			vnode.anchor = nextSibling(node);
			hydrateAnchor(target, targetNode);
			if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert);
			hydrateChildren(targetNode && nextSibling(targetNode), vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
		}
		updateCssVars(vnode, disabled);
	} else if (disabled) {
		if (vnode.shapeFlag & 16) {
			hydrateDisabledTeleport(node, vnode);
			vnode.targetStart = node;
			vnode.targetAnchor = nextSibling(node);
		}
	}
	return vnode.anchor && nextSibling(vnode.anchor);
}
var Teleport = TeleportImpl;
function updateCssVars(vnode, isDisabled) {
	const ctx = vnode.ctx;
	if (ctx && ctx.ut) {
		let node, anchor;
		if (isDisabled) {
			node = vnode.el;
			anchor = vnode.anchor;
		} else {
			node = vnode.targetStart;
			anchor = vnode.targetAnchor;
		}
		while (node && node !== anchor) {
			if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
			node = node.nextSibling;
		}
		ctx.ut();
	}
}
function prepareAnchor(target, vnode, createText, insert, anchor = null) {
	const targetStart = vnode.targetStart = createText("");
	const targetAnchor = vnode.targetAnchor = createText("");
	targetStart[TeleportEndKey] = targetAnchor;
	if (target) {
		insert(targetStart, target, anchor);
		insert(targetAnchor, target, anchor);
	}
	return targetAnchor;
}
var leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
var enterCbKey$1 = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
	const state = {
		isMounted: false,
		isLeaving: false,
		isUnmounting: false,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	onMounted(() => {
		state.isMounted = true;
	});
	onBeforeUnmount(() => {
		state.isUnmounting = true;
	});
	return state;
}
var TransitionHookValidator = [Function, Array];
var BaseTransitionPropsValidators = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: TransitionHookValidator,
	onEnter: TransitionHookValidator,
	onAfterEnter: TransitionHookValidator,
	onEnterCancelled: TransitionHookValidator,
	onBeforeLeave: TransitionHookValidator,
	onLeave: TransitionHookValidator,
	onAfterLeave: TransitionHookValidator,
	onLeaveCancelled: TransitionHookValidator,
	onBeforeAppear: TransitionHookValidator,
	onAppear: TransitionHookValidator,
	onAfterAppear: TransitionHookValidator,
	onAppearCancelled: TransitionHookValidator
};
function getLeavingNodesForType(state, vnode) {
	const { leavingVNodes } = state;
	let leavingVNodesCache = leavingVNodes.get(vnode.type);
	if (!leavingVNodesCache) {
		leavingVNodesCache = /* @__PURE__ */ Object.create(null);
		leavingVNodes.set(vnode.type, leavingVNodesCache);
	}
	return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
	const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
	const key = String(vnode.key);
	const leavingVNodesCache = getLeavingNodesForType(state, vnode);
	const callHook = (hook, args) => {
		hook && callWithAsyncErrorHandling(hook, instance, 9, args);
	};
	const callAsyncHook = (hook, args) => {
		const done = args[1];
		callHook(hook, args);
		if (isArray(hook)) {
			if (hook.every((hook2) => hook2.length <= 1)) done();
		} else if (hook.length <= 1) done();
	};
	const hooks = {
		mode,
		persisted,
		beforeEnter(el) {
			let hook = onBeforeEnter;
			if (!state.isMounted) if (appear) hook = onBeforeAppear || onBeforeEnter;
			else return;
			if (el[leaveCbKey]) el[leaveCbKey](true);
			const leavingVNode = leavingVNodesCache[key];
			if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) leavingVNode.el[leaveCbKey]();
			callHook(hook, [el]);
		},
		enter(el) {
			if (leavingVNodesCache[key] === vnode) return;
			let hook = onEnter;
			let afterHook = onAfterEnter;
			let cancelHook = onEnterCancelled;
			if (!state.isMounted) if (appear) {
				hook = onAppear || onEnter;
				afterHook = onAfterAppear || onAfterEnter;
				cancelHook = onAppearCancelled || onEnterCancelled;
			} else return;
			let called = false;
			el[enterCbKey$1] = (cancelled) => {
				if (called) return;
				called = true;
				if (cancelled) callHook(cancelHook, [el]);
				else callHook(afterHook, [el]);
				if (hooks.delayedLeave) hooks.delayedLeave();
				el[enterCbKey$1] = void 0;
			};
			const done = el[enterCbKey$1].bind(null, false);
			if (hook) callAsyncHook(hook, [el, done]);
			else done();
		},
		leave(el, remove) {
			const key2 = String(vnode.key);
			if (el[enterCbKey$1]) el[enterCbKey$1](true);
			if (state.isUnmounting) return remove();
			callHook(onBeforeLeave, [el]);
			let called = false;
			el[leaveCbKey] = (cancelled) => {
				if (called) return;
				called = true;
				remove();
				if (cancelled) callHook(onLeaveCancelled, [el]);
				else callHook(onAfterLeave, [el]);
				el[leaveCbKey] = void 0;
				if (leavingVNodesCache[key2] === vnode) delete leavingVNodesCache[key2];
			};
			const done = el[leaveCbKey].bind(null, false);
			leavingVNodesCache[key2] = vnode;
			if (onLeave) callAsyncHook(onLeave, [el, done]);
			else done();
		},
		clone(vnode2) {
			const hooks2 = resolveTransitionHooks(vnode2, props, state, instance, postClone);
			if (postClone) postClone(hooks2);
			return hooks2;
		}
	};
	return hooks;
}
function setTransitionHooks(vnode, hooks) {
	if (vnode.shapeFlag & 6 && vnode.component) {
		vnode.transition = hooks;
		setTransitionHooks(vnode.component.subTree, hooks);
	} else if (vnode.shapeFlag & 128) {
		vnode.ssContent.transition = hooks.clone(vnode.ssContent);
		vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
	} else vnode.transition = hooks;
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
	let ret = [];
	let keyedFragmentCount = 0;
	for (let i = 0; i < children.length; i++) {
		let child = children[i];
		const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
		if (child.type === Fragment) {
			if (child.patchFlag & 128) keyedFragmentCount++;
			ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
		} else if (keepComment || child.type !== Comment) ret.push(key != null ? cloneVNode(child, { key }) : child);
	}
	if (keyedFragmentCount > 1) for (let i = 0; i < ret.length; i++) ret[i].patchFlag = -2;
	return ret;
}
function markAsyncBoundary(instance) {
	instance.ids = [
		instance.ids[0] + instance.ids[2]++ + "-",
		0,
		0
	];
}
function isTemplateRefKey(refs, key) {
	let desc;
	return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
	if (isArray(rawRef)) {
		rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
		return;
	}
	if (isAsyncWrapper(vnode) && !isUnmount) {
		if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
		return;
	}
	const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
	const value = isUnmount ? null : refValue;
	const { i: owner, r: ref } = rawRef;
	const oldRef = oldRawRef && oldRawRef.r;
	const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
	const setupState = owner.setupState;
	const rawSetupState = /* @__PURE__ */ toRaw(setupState);
	const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
		if (isTemplateRefKey(refs, key)) return false;
		return hasOwn(rawSetupState, key);
	};
	const canSetRef = (ref2, key) => {
		if (key && isTemplateRefKey(refs, key)) return false;
		return true;
	};
	if (oldRef != null && oldRef !== ref) {
		invalidatePendingSetRef(oldRawRef);
		if (isString(oldRef)) {
			refs[oldRef] = null;
			if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
		} else if (/* @__PURE__ */ isRef(oldRef)) {
			const oldRawRefAtom = oldRawRef;
			if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
			if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
		}
	}
	if (isFunction(ref)) callWithErrorHandling(ref, owner, 12, [value, refs]);
	else {
		const _isString = isString(ref);
		const _isRef = /* @__PURE__ */ isRef(ref);
		if (_isString || _isRef) {
			const doSet = () => {
				if (rawRef.f) {
					const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
					if (isUnmount) isArray(existing) && remove(existing, refValue);
					else if (!isArray(existing)) if (_isString) {
						refs[ref] = [refValue];
						if (canSetSetupRef(ref)) setupState[ref] = refs[ref];
					} else {
						const newVal = [refValue];
						if (canSetRef(ref, rawRef.k)) ref.value = newVal;
						if (rawRef.k) refs[rawRef.k] = newVal;
					}
					else if (!existing.includes(refValue)) existing.push(refValue);
				} else if (_isString) {
					refs[ref] = value;
					if (canSetSetupRef(ref)) setupState[ref] = value;
				} else if (_isRef) {
					if (canSetRef(ref, rawRef.k)) ref.value = value;
					if (rawRef.k) refs[rawRef.k] = value;
				}
			};
			if (value) {
				const job = () => {
					doSet();
					pendingSetRefMap.delete(rawRef);
				};
				job.id = -1;
				pendingSetRefMap.set(rawRef, job);
				queuePostRenderEffect(job, parentSuspense);
			} else {
				invalidatePendingSetRef(rawRef);
				doSet();
			}
		}
	}
}
function invalidatePendingSetRef(rawRef) {
	const pendingSetRef = pendingSetRefMap.get(rawRef);
	if (pendingSetRef) {
		pendingSetRef.flags |= 8;
		pendingSetRefMap.delete(rawRef);
	}
}
getGlobalThis().requestIdleCallback;
getGlobalThis().cancelIdleCallback;
var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
	registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
	registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
	const wrappedHook = hook.__wdc || (hook.__wdc = () => {
		let current = target;
		while (current) {
			if (current.isDeactivated) return;
			current = current.parent;
		}
		return hook();
	});
	injectHook(type, wrappedHook, target);
	if (target) {
		let current = target.parent;
		while (current && current.parent) {
			if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
			current = current.parent;
		}
	}
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
	const injected = injectHook(type, hook, keepAliveRoot, true);
	onUnmounted(() => {
		remove(keepAliveRoot[type], injected);
	}, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
	if (target) {
		const hooks = target[type] || (target[type] = []);
		const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
			pauseTracking();
			const reset = setCurrentInstance(target);
			const res = callWithAsyncErrorHandling(hook, target, type, args);
			reset();
			resetTracking();
			return res;
		});
		if (prepend) hooks.unshift(wrappedHook);
		else hooks.push(wrappedHook);
		return wrappedHook;
	}
}
var createHook = (lifecycle) => (hook, target = currentInstance) => {
	if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
};
var onBeforeMount = createHook("bm");
var onMounted = createHook("m");
var onBeforeUpdate = createHook("bu");
var onUpdated = createHook("u");
var onBeforeUnmount = createHook("bum");
var onUnmounted = createHook("um");
var onServerPrefetch = createHook("sp");
var onRenderTriggered = createHook("rtg");
var onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
	injectHook("ec", hook, target);
}
var NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function renderList(source, renderItem, cache, index) {
	let ret;
	const cached = cache && cache[index];
	const sourceIsArray = isArray(source);
	if (sourceIsArray || isString(source)) {
		const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
		let needsWrap = false;
		let isReadonlySource = false;
		if (sourceIsReactiveArray) {
			needsWrap = !/* @__PURE__ */ isShallow(source);
			isReadonlySource = /* @__PURE__ */ isReadonly(source);
			source = shallowReadArray(source);
		}
		ret = new Array(source.length);
		for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
	} else if (typeof source === "number") {
		ret = new Array(source);
		for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
	} else if (isObject(source)) if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
	else {
		const keys = Object.keys(source);
		ret = new Array(keys.length);
		for (let i = 0, l = keys.length; i < l; i++) {
			const key = keys[i];
			ret[i] = renderItem(source[key], key, i, cached && cached[i]);
		}
	}
	else ret = [];
	if (cache) cache[index] = ret;
	return ret;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
	if (currentRenderingInstance.ce || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.ce) {
		const hasProps = Object.keys(props).length > 0;
		if (name !== "default") props.name = name;
		return openBlock(), createBlock(Fragment, null, [createVNode("slot", props, fallback && fallback())], hasProps ? -2 : 64);
	}
	let slot = slots[name];
	if (slot && slot._c) slot._d = false;
	openBlock();
	const validSlotContent = slot && ensureValidVNode(slot(props));
	const slotKey = props.key || validSlotContent && validSlotContent.key;
	const rendered = createBlock(Fragment, { key: (slotKey && !isSymbol(slotKey) ? slotKey : `_${name}`) + (!validSlotContent && fallback ? "_fb" : "") }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
	if (!noSlotted && rendered.scopeId) rendered.slotScopeIds = [rendered.scopeId + "-s"];
	if (slot && slot._c) slot._d = true;
	return rendered;
}
function ensureValidVNode(vnodes) {
	return vnodes.some((child) => {
		if (!isVNode(child)) return true;
		if (child.type === Comment) return false;
		if (child.type === Fragment && !ensureValidVNode(child.children)) return false;
		return true;
	}) ? vnodes : null;
}
var getPublicInstance = (i) => {
	if (!i) return null;
	if (isStatefulComponent(i)) return getComponentPublicInstance(i);
	return getPublicInstance(i.parent);
};
var publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
	$: (i) => i,
	$el: (i) => i.vnode.el,
	$data: (i) => i.data,
	$props: (i) => i.props,
	$attrs: (i) => i.attrs,
	$slots: (i) => i.slots,
	$refs: (i) => i.refs,
	$parent: (i) => getPublicInstance(i.parent),
	$root: (i) => getPublicInstance(i.root),
	$host: (i) => i.ce,
	$emit: (i) => i.emit,
	$options: (i) => resolveMergedOptions(i),
	$forceUpdate: (i) => i.f || (i.f = () => {
		queueJob(i.update);
	}),
	$nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
	$watch: (i) => instanceWatch.bind(i)
});
var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
var PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		if (key === "__v_skip") return true;
		const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
		if (key[0] !== "$") {
			const n = accessCache[key];
			if (n !== void 0) switch (n) {
				case 1: return setupState[key];
				case 2: return data[key];
				case 4: return ctx[key];
				case 3: return props[key];
			}
			else if (hasSetupBinding(setupState, key)) {
				accessCache[key] = 1;
				return setupState[key];
			} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
				accessCache[key] = 2;
				return data[key];
			} else if (hasOwn(props, key)) {
				accessCache[key] = 3;
				return props[key];
			} else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
				accessCache[key] = 4;
				return ctx[key];
			} else if (shouldCacheAccess) accessCache[key] = 0;
		}
		const publicGetter = publicPropertiesMap[key];
		let cssModule, globalProperties;
		if (publicGetter) {
			if (key === "$attrs") track(instance.attrs, "get", "");
			return publicGetter(instance);
		} else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
		else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
			accessCache[key] = 4;
			return ctx[key];
		} else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) return globalProperties[key];
	},
	set({ _: instance }, key, value) {
		const { data, setupState, ctx } = instance;
		if (hasSetupBinding(setupState, key)) {
			setupState[key] = value;
			return true;
		} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
			data[key] = value;
			return true;
		} else if (hasOwn(instance.props, key)) return false;
		if (key[0] === "$" && key.slice(1) in instance) return false;
		else ctx[key] = value;
		return true;
	},
	has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
		let cssModules;
		return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
	},
	defineProperty(target, key, descriptor) {
		if (descriptor.get != null) target._.accessCache[key] = 0;
		else if (hasOwn(descriptor, "value")) this.set(target, key, descriptor.value, null);
		return Reflect.defineProperty(target, key, descriptor);
	}
};
function normalizePropsOrEmits(props) {
	return isArray(props) ? props.reduce((normalized, p) => (normalized[p] = null, normalized), {}) : props;
}
var shouldCacheAccess = true;
function applyOptions(instance) {
	const options = resolveMergedOptions(instance);
	const publicThis = instance.proxy;
	const ctx = instance.ctx;
	shouldCacheAccess = false;
	if (options.beforeCreate) callHook$1(options.beforeCreate, instance, "bc");
	const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose, inheritAttrs, components, directives, filters } = options;
	const checkDuplicateProperties = null;
	if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
	if (methods) for (const key in methods) {
		const methodHandler = methods[key];
		if (isFunction(methodHandler)) ctx[key] = methodHandler.bind(publicThis);
	}
	if (dataOptions) {
		const data = dataOptions.call(publicThis, publicThis);
		if (!isObject(data)) {} else instance.data = /* @__PURE__ */ reactive(data);
	}
	shouldCacheAccess = true;
	if (computedOptions) for (const key in computedOptions) {
		const opt = computedOptions[key];
		const c = computed({
			get: isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP,
			set: !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP
		});
		Object.defineProperty(ctx, key, {
			enumerable: true,
			configurable: true,
			get: () => c.value,
			set: (v) => c.value = v
		});
	}
	if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
	if (provideOptions) {
		const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
		Reflect.ownKeys(provides).forEach((key) => {
			provide(key, provides[key]);
		});
	}
	if (created) callHook$1(created, instance, "c");
	function registerLifecycleHook(register, hook) {
		if (isArray(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
		else if (hook) register(hook.bind(publicThis));
	}
	registerLifecycleHook(onBeforeMount, beforeMount);
	registerLifecycleHook(onMounted, mounted);
	registerLifecycleHook(onBeforeUpdate, beforeUpdate);
	registerLifecycleHook(onUpdated, updated);
	registerLifecycleHook(onActivated, activated);
	registerLifecycleHook(onDeactivated, deactivated);
	registerLifecycleHook(onErrorCaptured, errorCaptured);
	registerLifecycleHook(onRenderTracked, renderTracked);
	registerLifecycleHook(onRenderTriggered, renderTriggered);
	registerLifecycleHook(onBeforeUnmount, beforeUnmount);
	registerLifecycleHook(onUnmounted, unmounted);
	registerLifecycleHook(onServerPrefetch, serverPrefetch);
	if (isArray(expose)) {
		if (expose.length) {
			const exposed = instance.exposed || (instance.exposed = {});
			expose.forEach((key) => {
				Object.defineProperty(exposed, key, {
					get: () => publicThis[key],
					set: (val) => publicThis[key] = val,
					enumerable: true
				});
			});
		} else if (!instance.exposed) instance.exposed = {};
	}
	if (render && instance.render === NOOP) instance.render = render;
	if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
	if (components) instance.components = components;
	if (directives) instance.directives = directives;
	if (serverPrefetch) markAsyncBoundary(instance);
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
	if (isArray(injectOptions)) injectOptions = normalizeInject(injectOptions);
	for (const key in injectOptions) {
		const opt = injectOptions[key];
		let injected;
		if (isObject(opt)) if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
		else injected = inject(opt.from || key);
		else injected = inject(opt);
		if (/* @__PURE__ */ isRef(injected)) Object.defineProperty(ctx, key, {
			enumerable: true,
			configurable: true,
			get: () => injected.value,
			set: (v) => injected.value = v
		});
		else ctx[key] = injected;
	}
}
function callHook$1(hook, instance, type) {
	callWithAsyncErrorHandling(isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
	let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
	if (isString(raw)) {
		const handler = ctx[raw];
		if (isFunction(handler)) watch(getter, handler);
	} else if (isFunction(raw)) watch(getter, raw.bind(publicThis));
	else if (isObject(raw)) if (isArray(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
	else {
		const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
		if (isFunction(handler)) watch(getter, handler, raw);
	}
}
function resolveMergedOptions(instance) {
	const base = instance.type;
	const { mixins, extends: extendsOptions } = base;
	const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
	const cached = cache.get(base);
	let resolved;
	if (cached) resolved = cached;
	else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
	else {
		resolved = {};
		if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
		mergeOptions(resolved, base, optionMergeStrategies);
	}
	if (isObject(base)) cache.set(base, resolved);
	return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
	const { mixins, extends: extendsOptions } = from;
	if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
	if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
	for (const key in from) if (asMixin && key === "expose") {} else {
		const strat = internalOptionMergeStrats[key] || strats && strats[key];
		to[key] = strat ? strat(to[key], from[key]) : from[key];
	}
	return to;
}
var internalOptionMergeStrats = {
	data: mergeDataFn,
	props: mergeEmitsOrPropsOptions,
	emits: mergeEmitsOrPropsOptions,
	methods: mergeObjectOptions,
	computed: mergeObjectOptions,
	beforeCreate: mergeAsArray,
	created: mergeAsArray,
	beforeMount: mergeAsArray,
	mounted: mergeAsArray,
	beforeUpdate: mergeAsArray,
	updated: mergeAsArray,
	beforeDestroy: mergeAsArray,
	beforeUnmount: mergeAsArray,
	destroyed: mergeAsArray,
	unmounted: mergeAsArray,
	activated: mergeAsArray,
	deactivated: mergeAsArray,
	errorCaptured: mergeAsArray,
	serverPrefetch: mergeAsArray,
	components: mergeObjectOptions,
	directives: mergeObjectOptions,
	watch: mergeWatchOptions,
	provide: mergeDataFn,
	inject: mergeInject
};
function mergeDataFn(to, from) {
	if (!from) return to;
	if (!to) return from;
	return function mergedDataFn() {
		return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
	};
}
function mergeInject(to, from) {
	return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
	if (isArray(raw)) {
		const res = {};
		for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
		return res;
	}
	return raw;
}
function mergeAsArray(to, from) {
	return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
	return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
	if (to) {
		if (isArray(to) && isArray(from)) return [.../* @__PURE__ */ new Set([...to, ...from])];
		return extend(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
	} else return from;
}
function mergeWatchOptions(to, from) {
	if (!to) return from;
	if (!from) return to;
	const merged = extend(/* @__PURE__ */ Object.create(null), to);
	for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
	return merged;
}
function createAppContext() {
	return {
		app: null,
		config: {
			isNativeTag: NO,
			performance: false,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var uid$1 = 0;
function createAppAPI(render, hydrate) {
	return function createApp(rootComponent, rootProps = null) {
		if (!isFunction(rootComponent)) rootComponent = extend({}, rootComponent);
		if (rootProps != null && !isObject(rootProps)) rootProps = null;
		const context = createAppContext();
		const installedPlugins = /* @__PURE__ */ new WeakSet();
		const pluginCleanupFns = [];
		let isMounted = false;
		const app = context.app = {
			_uid: uid$1++,
			_component: rootComponent,
			_props: rootProps,
			_container: null,
			_context: context,
			_instance: null,
			version,
			get config() {
				return context.config;
			},
			set config(v) {},
			use(plugin, ...options) {
				if (installedPlugins.has(plugin)) {} else if (plugin && isFunction(plugin.install)) {
					installedPlugins.add(plugin);
					plugin.install(app, ...options);
				} else if (isFunction(plugin)) {
					installedPlugins.add(plugin);
					plugin(app, ...options);
				}
				return app;
			},
			mixin(mixin) {
				if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
				return app;
			},
			component(name, component) {
				if (!component) return context.components[name];
				context.components[name] = component;
				return app;
			},
			directive(name, directive) {
				if (!directive) return context.directives[name];
				context.directives[name] = directive;
				return app;
			},
			mount(rootContainer, isHydrate, namespace) {
				if (!isMounted) {
					const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
					vnode.appContext = context;
					if (namespace === true) namespace = "svg";
					else if (namespace === false) namespace = void 0;
					if (isHydrate && hydrate) hydrate(vnode, rootContainer);
					else render(vnode, rootContainer, namespace);
					isMounted = true;
					app._container = rootContainer;
					rootContainer.__vue_app__ = app;
					return getComponentPublicInstance(vnode.component);
				}
			},
			onUnmount(cleanupFn) {
				pluginCleanupFns.push(cleanupFn);
			},
			unmount() {
				if (isMounted) {
					callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
					render(null, app._container);
					delete app._container.__vue_app__;
				}
			},
			provide(key, value) {
				context.provides[key] = value;
				return app;
			},
			runWithContext(fn) {
				const lastApp = currentApp;
				currentApp = app;
				try {
					return fn();
				} finally {
					currentApp = lastApp;
				}
			}
		};
		return app;
	};
}
var currentApp = null;
var getModelModifiers = (props, modelName) => {
	return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
	if (instance.isUnmounted) return;
	const props = instance.vnode.props || EMPTY_OBJ;
	let args = rawArgs;
	const isModelListener = event.startsWith("update:");
	const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
	if (modifiers) {
		if (modifiers.trim) args = rawArgs.map((a) => isString(a) ? a.trim() : a);
		if (modifiers.number) args = rawArgs.map(looseToNumber);
	}
	let handlerName;
	let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
	if (!handler && isModelListener) handler = props[handlerName = toHandlerKey(hyphenate(event))];
	if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
	const onceHandler = props[handlerName + `Once`];
	if (onceHandler) {
		if (!instance.emitted) instance.emitted = {};
		else if (instance.emitted[handlerName]) return;
		instance.emitted[handlerName] = true;
		callWithAsyncErrorHandling(onceHandler, instance, 6, args);
	}
}
var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
	const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
	const cached = cache.get(comp);
	if (cached !== void 0) return cached;
	const raw = comp.emits;
	let normalized = {};
	let hasExtends = false;
	if (!isFunction(comp)) {
		const extendEmits = (raw2) => {
			const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
			if (normalizedFromExtend) {
				hasExtends = true;
				extend(normalized, normalizedFromExtend);
			}
		};
		if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
		if (comp.extends) extendEmits(comp.extends);
		if (comp.mixins) comp.mixins.forEach(extendEmits);
	}
	if (!raw && !hasExtends) {
		if (isObject(comp)) cache.set(comp, null);
		return null;
	}
	if (isArray(raw)) raw.forEach((key) => normalized[key] = null);
	else extend(normalized, raw);
	if (isObject(comp)) cache.set(comp, normalized);
	return normalized;
}
function isEmitListener(options, key) {
	if (!options || !isOn(key)) return false;
	key = key.slice(2).replace(/Once$/, "");
	return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function renderComponentRoot(instance) {
	const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
	const prev = setCurrentRenderingInstance(instance);
	let result;
	let fallthroughAttrs;
	try {
		if (vnode.shapeFlag & 4) {
			const proxyToUse = withProxy || proxy;
			const thisProxy = proxyToUse;
			result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, props, setupState, data, ctx));
			fallthroughAttrs = attrs;
		} else {
			const render2 = Component;
			result = normalizeVNode(render2.length > 1 ? render2(props, {
				attrs,
				slots,
				emit
			}) : render2(props, null));
			fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
		}
	} catch (err) {
		blockStack.length = 0;
		handleError(err, instance, 1);
		result = createVNode(Comment);
	}
	let root = result;
	if (fallthroughAttrs && inheritAttrs !== false) {
		const keys = Object.keys(fallthroughAttrs);
		const { shapeFlag } = root;
		if (keys.length) {
			if (shapeFlag & 7) {
				if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
				root = cloneVNode(root, fallthroughAttrs, false, true);
			}
		}
	}
	if (vnode.dirs) {
		root = cloneVNode(root, null, false, true);
		root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
	}
	if (vnode.transition) setTransitionHooks(root, vnode.transition);
	result = root;
	setCurrentRenderingInstance(prev);
	return result;
}
var getFunctionalFallthrough = (attrs) => {
	let res;
	for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
	return res;
};
var filterModelListeners = (attrs, props) => {
	const res = {};
	for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
	return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
	const { props: prevProps, children: prevChildren, component } = prevVNode;
	const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
	const emits = component.emitsOptions;
	if (nextVNode.dirs || nextVNode.transition) return true;
	if (optimized && patchFlag >= 0) {
		if (patchFlag & 1024) return true;
		if (patchFlag & 16) {
			if (!prevProps) return !!nextProps;
			return hasPropsChanged(prevProps, nextProps, emits);
		} else if (patchFlag & 8) {
			const dynamicProps = nextVNode.dynamicProps;
			for (let i = 0; i < dynamicProps.length; i++) {
				const key = dynamicProps[i];
				if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
			}
		}
	} else {
		if (prevChildren || nextChildren) {
			if (!nextChildren || !nextChildren.$stable) return true;
		}
		if (prevProps === nextProps) return false;
		if (!prevProps) return !!nextProps;
		if (!nextProps) return true;
		return hasPropsChanged(prevProps, nextProps, emits);
	}
	return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
	const nextKeys = Object.keys(nextProps);
	if (nextKeys.length !== Object.keys(prevProps).length) return true;
	for (let i = 0; i < nextKeys.length; i++) {
		const key = nextKeys[i];
		if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
	}
	return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
	const nextProp = nextProps[key];
	const prevProp = prevProps[key];
	if (key === "style" && isObject(nextProp) && isObject(prevProp)) return !looseEqual(nextProp, prevProp);
	return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
	while (parent) {
		const root = parent.subTree;
		if (root.suspense && root.suspense.activeBranch === vnode) {
			root.suspense.vnode.el = root.el = el;
			vnode = root;
		}
		if (root === vnode) {
			(vnode = parent.vnode).el = el;
			parent = parent.parent;
		} else break;
	}
	if (suspense && suspense.activeBranch === vnode) suspense.vnode.el = el;
}
var internalObjectProto = {};
var createInternalObject = () => Object.create(internalObjectProto);
var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
	const props = {};
	const attrs = createInternalObject();
	instance.propsDefaults = /* @__PURE__ */ Object.create(null);
	setFullProps(instance, rawProps, props, attrs);
	for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
	if (isStateful) instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
	else if (!instance.type.props) instance.props = attrs;
	else instance.props = props;
	instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
	const { props, attrs, vnode: { patchFlag } } = instance;
	const rawCurrentProps = /* @__PURE__ */ toRaw(props);
	const [options] = instance.propsOptions;
	let hasAttrsChanged = false;
	if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
		if (patchFlag & 8) {
			const propsToUpdate = instance.vnode.dynamicProps;
			for (let i = 0; i < propsToUpdate.length; i++) {
				let key = propsToUpdate[i];
				if (isEmitListener(instance.emitsOptions, key)) continue;
				const value = rawProps[key];
				if (options) if (hasOwn(attrs, key)) {
					if (value !== attrs[key]) {
						attrs[key] = value;
						hasAttrsChanged = true;
					}
				} else {
					const camelizedKey = camelize(key);
					props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
				}
				else if (value !== attrs[key]) {
					attrs[key] = value;
					hasAttrsChanged = true;
				}
			}
		}
	} else {
		if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
		let kebabKey;
		for (const key in rawCurrentProps) if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) if (options) {
			if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
		} else delete props[key];
		if (attrs !== rawCurrentProps) {
			for (const key in attrs) if (!rawProps || !hasOwn(rawProps, key) && true) {
				delete attrs[key];
				hasAttrsChanged = true;
			}
		}
	}
	if (hasAttrsChanged) trigger(instance.attrs, "set", "");
}
function setFullProps(instance, rawProps, props, attrs) {
	const [options, needCastKeys] = instance.propsOptions;
	let hasAttrsChanged = false;
	let rawCastValues;
	if (rawProps) for (let key in rawProps) {
		if (isReservedProp(key)) continue;
		const value = rawProps[key];
		let camelKey;
		if (options && hasOwn(options, camelKey = camelize(key))) if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
		else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
		else if (!isEmitListener(instance.emitsOptions, key)) {
			if (!(key in attrs) || value !== attrs[key]) {
				attrs[key] = value;
				hasAttrsChanged = true;
			}
		}
	}
	if (needCastKeys) {
		const rawCurrentProps = /* @__PURE__ */ toRaw(props);
		const castValues = rawCastValues || EMPTY_OBJ;
		for (let i = 0; i < needCastKeys.length; i++) {
			const key = needCastKeys[i];
			props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
		}
	}
	return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
	const opt = options[key];
	if (opt != null) {
		const hasDefault = hasOwn(opt, "default");
		if (hasDefault && value === void 0) {
			const defaultValue = opt.default;
			if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
				const { propsDefaults } = instance;
				if (key in propsDefaults) value = propsDefaults[key];
				else {
					const reset = setCurrentInstance(instance);
					value = propsDefaults[key] = defaultValue.call(null, props);
					reset();
				}
			} else value = defaultValue;
			if (instance.ce) instance.ce._setProp(key, value);
		}
		if (opt[0]) {
			if (isAbsent && !hasDefault) value = false;
			else if (opt[1] && (value === "" || value === hyphenate(key))) value = true;
		}
	}
	return value;
}
var mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
	const cache = asMixin ? mixinPropsCache : appContext.propsCache;
	const cached = cache.get(comp);
	if (cached) return cached;
	const raw = comp.props;
	const normalized = {};
	const needCastKeys = [];
	let hasExtends = false;
	if (!isFunction(comp)) {
		const extendProps = (raw2) => {
			hasExtends = true;
			const [props, keys] = normalizePropsOptions(raw2, appContext, true);
			extend(normalized, props);
			if (keys) needCastKeys.push(...keys);
		};
		if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
		if (comp.extends) extendProps(comp.extends);
		if (comp.mixins) comp.mixins.forEach(extendProps);
	}
	if (!raw && !hasExtends) {
		if (isObject(comp)) cache.set(comp, EMPTY_ARR);
		return EMPTY_ARR;
	}
	if (isArray(raw)) for (let i = 0; i < raw.length; i++) {
		const normalizedKey = camelize(raw[i]);
		if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
	}
	else if (raw) for (const key in raw) {
		const normalizedKey = camelize(key);
		if (validatePropName(normalizedKey)) {
			const opt = raw[key];
			const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
			const propType = prop.type;
			let shouldCast = false;
			let shouldCastTrue = true;
			if (isArray(propType)) for (let index = 0; index < propType.length; ++index) {
				const type = propType[index];
				const typeName = isFunction(type) && type.name;
				if (typeName === "Boolean") {
					shouldCast = true;
					break;
				} else if (typeName === "String") shouldCastTrue = false;
			}
			else shouldCast = isFunction(propType) && propType.name === "Boolean";
			prop[0] = shouldCast;
			prop[1] = shouldCastTrue;
			if (shouldCast || hasOwn(prop, "default")) needCastKeys.push(normalizedKey);
		}
	}
	const res = [normalized, needCastKeys];
	if (isObject(comp)) cache.set(comp, res);
	return res;
}
function validatePropName(key) {
	if (key[0] !== "$" && !isReservedProp(key)) return true;
	return false;
}
var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
var normalizeSlot = (key, rawSlot, ctx) => {
	if (rawSlot._n) return rawSlot;
	const normalized = withCtx((...args) => {
		return normalizeSlotValue(rawSlot(...args));
	}, ctx);
	normalized._c = false;
	return normalized;
};
var normalizeObjectSlots = (rawSlots, slots, instance) => {
	const ctx = rawSlots._ctx;
	for (const key in rawSlots) {
		if (isInternalKey(key)) continue;
		const value = rawSlots[key];
		if (isFunction(value)) slots[key] = normalizeSlot(key, value, ctx);
		else if (value != null) {
			const normalized = normalizeSlotValue(value);
			slots[key] = () => normalized;
		}
	}
};
var normalizeVNodeSlots = (instance, children) => {
	const normalized = normalizeSlotValue(children);
	instance.slots.default = () => normalized;
};
var assignSlots = (slots, children, optimized) => {
	for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
};
var initSlots = (instance, children, optimized) => {
	const slots = instance.slots = createInternalObject();
	if (instance.vnode.shapeFlag & 32) {
		const type = children._;
		if (type) {
			assignSlots(slots, children, optimized);
			if (optimized) def(slots, "_", type, true);
		} else normalizeObjectSlots(children, slots);
	} else if (children) normalizeVNodeSlots(instance, children);
};
var updateSlots = (instance, children, optimized) => {
	const { vnode, slots } = instance;
	let needDeletionCheck = true;
	let deletionComparisonTarget = EMPTY_OBJ;
	if (vnode.shapeFlag & 32) {
		const type = children._;
		if (type) if (optimized && type === 1) needDeletionCheck = false;
		else assignSlots(slots, children, optimized);
		else {
			needDeletionCheck = !children.$stable;
			normalizeObjectSlots(children, slots);
		}
		deletionComparisonTarget = children;
	} else if (children) {
		normalizeVNodeSlots(instance, children);
		deletionComparisonTarget = { default: 1 };
	}
	if (needDeletionCheck) {
		for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
	}
};
function initFeatureFlags() {}
var queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
	return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
	initFeatureFlags();
	const target = getGlobalThis();
	target.__VUE__ = true;
	const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
	const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
		if (n1 === n2) return;
		if (n1 && !isSameVNodeType(n1, n2)) {
			anchor = getNextHostNode(n1);
			unmount(n1, parentComponent, parentSuspense, true);
			n1 = null;
		}
		if (n2.patchFlag === -2) {
			optimized = false;
			n2.dynamicChildren = null;
		}
		const { type, ref, shapeFlag } = n2;
		switch (type) {
			case Text:
				processText(n1, n2, container, anchor);
				break;
			case Comment:
				processCommentNode(n1, n2, container, anchor);
				break;
			case Static:
				if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
				break;
			case Fragment:
				processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				break;
			default: if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
			else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
		}
		if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
		else if (ref == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense, n1, true);
	};
	const processText = (n1, n2, container, anchor) => {
		if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
		else {
			const el = n2.el = n1.el;
			if (n2.children !== n1.children) hostSetText(el, n2.children);
		}
	};
	const processCommentNode = (n1, n2, container, anchor) => {
		if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
		else n2.el = n1.el;
	};
	const mountStaticNode = (n2, container, anchor, namespace) => {
		[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
	};
	const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
		let next;
		while (el && el !== anchor) {
			next = hostNextSibling(el);
			hostInsert(el, container, nextSibling);
			el = next;
		}
		hostInsert(anchor, container, nextSibling);
	};
	const removeStaticNode = ({ el, anchor }) => {
		let next;
		while (el && el !== anchor) {
			next = hostNextSibling(el);
			hostRemove(el);
			el = next;
		}
		hostRemove(anchor);
	};
	const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		if (n2.type === "svg") namespace = "svg";
		else if (n2.type === "math") namespace = "mathml";
		if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		else {
			const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
			try {
				if (customElement) customElement._beginPatch();
				patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			} finally {
				if (customElement) customElement._endPatch();
			}
		}
	};
	const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		let el;
		let vnodeHook;
		const { props, shapeFlag, transition, dirs } = vnode;
		el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
		if (shapeFlag & 8) hostSetElementText(el, vnode.children);
		else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
		if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
		setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
		if (props) {
			for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
			if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
			if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
		}
		if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
		const needCallTransitionHooks = needTransition(parentSuspense, transition);
		if (needCallTransitionHooks) transition.beforeEnter(el);
		hostInsert(el, container, anchor);
		if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) queuePostRenderEffect(() => {
			try {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
				needCallTransitionHooks && transition.enter(el);
				dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
			} finally {}
		}, parentSuspense);
	};
	const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
		if (scopeId) hostSetScopeId(el, scopeId);
		if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
		if (parentComponent) {
			let subTree = parentComponent.subTree;
			if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
				const parentVNode = parentComponent.vnode;
				setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
			}
		}
	};
	const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
		for (let i = start; i < children.length; i++) patch(null, children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
	};
	const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		const el = n2.el = n1.el;
		let { patchFlag, dynamicChildren, dirs } = n2;
		patchFlag |= n1.patchFlag & 16;
		const oldProps = n1.props || EMPTY_OBJ;
		const newProps = n2.props || EMPTY_OBJ;
		let vnodeHook;
		parentComponent && toggleRecurse(parentComponent, false);
		if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
		if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
		parentComponent && toggleRecurse(parentComponent, true);
		if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
		if (dynamicChildren) patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
		else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
		if (patchFlag > 0) {
			if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
			else {
				if (patchFlag & 2) {
					if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
				}
				if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
				if (patchFlag & 8) {
					const propsToUpdate = n2.dynamicProps;
					for (let i = 0; i < propsToUpdate.length; i++) {
						const key = propsToUpdate[i];
						const prev = oldProps[key];
						const next = newProps[key];
						if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
					}
				}
			}
			if (patchFlag & 1) {
				if (n1.children !== n2.children) hostSetElementText(el, n2.children);
			}
		} else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
		if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
			vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
			dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
		}, parentSuspense);
	};
	const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
		for (let i = 0; i < newChildren.length; i++) {
			const oldVNode = oldChildren[i];
			const newVNode = newChildren[i];
			patch(oldVNode, newVNode, oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldVNode.el) : fallbackContainer, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
		}
	};
	const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
		if (oldProps !== newProps) {
			if (oldProps !== EMPTY_OBJ) {
				for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
			}
			for (const key in newProps) {
				if (isReservedProp(key)) continue;
				const next = newProps[key];
				const prev = oldProps[key];
				if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
			}
			if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
		}
	};
	const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
		const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
		let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
		if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
		if (n1 == null) {
			hostInsert(fragmentStartAnchor, container, anchor);
			hostInsert(fragmentEndAnchor, container, anchor);
			mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		} else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
			patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
			if (n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
		} else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
	};
	const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		n2.slotScopeIds = slotScopeIds;
		if (n1 == null) if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
		else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
		else updateComponent(n1, n2, optimized);
	};
	const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
		const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
		if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
		setupComponent(instance, false, optimized);
		if (instance.asyncDep) {
			parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
			if (!initialVNode.el) {
				const placeholder = instance.subTree = createVNode(Comment);
				processCommentNode(null, placeholder, container, anchor);
				initialVNode.placeholder = placeholder.el;
			}
		} else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
	};
	const updateComponent = (n1, n2, optimized) => {
		const instance = n2.component = n1.component;
		if (shouldUpdateComponent(n1, n2, optimized)) if (instance.asyncDep && !instance.asyncResolved) {
			updateComponentPreRender(instance, n2, optimized);
			return;
		} else {
			instance.next = n2;
			instance.update();
		}
		else {
			n2.el = n1.el;
			instance.vnode = n2;
		}
	};
	const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
		const componentUpdateFn = () => {
			if (!instance.isMounted) {
				let vnodeHook;
				const { el, props } = initialVNode;
				const { bm, m, parent, root, type } = instance;
				const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
				toggleRecurse(instance, false);
				if (bm) invokeArrayFns(bm);
				if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
				toggleRecurse(instance, true);
				if (el && hydrateNode) {
					const hydrateSubTree = () => {
						instance.subTree = renderComponentRoot(instance);
						hydrateNode(el, instance.subTree, instance, parentSuspense, null);
					};
					if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
					else hydrateSubTree();
				} else {
					if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type, instance.parent ? instance.parent.type : void 0);
					const subTree = instance.subTree = renderComponentRoot(instance);
					patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
					initialVNode.el = subTree.el;
				}
				if (m) queuePostRenderEffect(m, parentSuspense);
				if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
					const scopedInitialVNode = initialVNode;
					queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
				}
				if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
				instance.isMounted = true;
				initialVNode = container = anchor = null;
			} else {
				let { next, bu, u, parent, vnode } = instance;
				{
					const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
					if (nonHydratedAsyncRoot) {
						if (next) {
							next.el = vnode.el;
							updateComponentPreRender(instance, next, optimized);
						}
						nonHydratedAsyncRoot.asyncDep.then(() => {
							queuePostRenderEffect(() => {
								if (!instance.isUnmounted) update();
							}, parentSuspense);
						});
						return;
					}
				}
				let originNext = next;
				let vnodeHook;
				toggleRecurse(instance, false);
				if (next) {
					next.el = vnode.el;
					updateComponentPreRender(instance, next, optimized);
				} else next = vnode;
				if (bu) invokeArrayFns(bu);
				if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
				toggleRecurse(instance, true);
				const nextTree = renderComponentRoot(instance);
				const prevTree = instance.subTree;
				instance.subTree = nextTree;
				patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, namespace);
				next.el = nextTree.el;
				if (originNext === null) updateHOCHostEl(instance, nextTree.el);
				if (u) queuePostRenderEffect(u, parentSuspense);
				if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
			}
		};
		instance.scope.on();
		const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
		instance.scope.off();
		const update = instance.update = effect.run.bind(effect);
		const job = instance.job = effect.runIfDirty.bind(effect);
		job.i = instance;
		job.id = instance.uid;
		effect.scheduler = () => queueJob(job);
		toggleRecurse(instance, true);
		update();
	};
	const updateComponentPreRender = (instance, nextVNode, optimized) => {
		nextVNode.component = instance;
		const prevProps = instance.vnode.props;
		instance.vnode = nextVNode;
		instance.next = null;
		updateProps(instance, nextVNode.props, prevProps, optimized);
		updateSlots(instance, nextVNode.children, optimized);
		pauseTracking();
		flushPreFlushCbs(instance);
		resetTracking();
	};
	const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
		const c1 = n1 && n1.children;
		const prevShapeFlag = n1 ? n1.shapeFlag : 0;
		const c2 = n2.children;
		const { patchFlag, shapeFlag } = n2;
		if (patchFlag > 0) {
			if (patchFlag & 128) {
				patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				return;
			} else if (patchFlag & 256) {
				patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				return;
			}
		}
		if (shapeFlag & 8) {
			if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
			if (c2 !== c1) hostSetElementText(container, c2);
		} else if (prevShapeFlag & 16) if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		else unmountChildren(c1, parentComponent, parentSuspense, true);
		else {
			if (prevShapeFlag & 8) hostSetElementText(container, "");
			if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		}
	};
	const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		c1 = c1 || EMPTY_ARR;
		c2 = c2 || EMPTY_ARR;
		const oldLength = c1.length;
		const newLength = c2.length;
		const commonLength = Math.min(oldLength, newLength);
		let i;
		for (i = 0; i < commonLength; i++) {
			const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
			patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		}
		if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
		else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
	};
	const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
		let i = 0;
		const l2 = c2.length;
		let e1 = c1.length - 1;
		let e2 = l2 - 1;
		while (i <= e1 && i <= e2) {
			const n1 = c1[i];
			const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
			if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else break;
			i++;
		}
		while (i <= e1 && i <= e2) {
			const n1 = c1[e1];
			const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
			if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else break;
			e1--;
			e2--;
		}
		if (i > e1) {
			if (i <= e2) {
				const nextPos = e2 + 1;
				const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
				while (i <= e2) {
					patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					i++;
				}
			}
		} else if (i > e2) while (i <= e1) {
			unmount(c1[i], parentComponent, parentSuspense, true);
			i++;
		}
		else {
			const s1 = i;
			const s2 = i;
			const keyToNewIndexMap = /* @__PURE__ */ new Map();
			for (i = s2; i <= e2; i++) {
				const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				if (nextChild.key != null) keyToNewIndexMap.set(nextChild.key, i);
			}
			let j;
			let patched = 0;
			const toBePatched = e2 - s2 + 1;
			let moved = false;
			let maxNewIndexSoFar = 0;
			const newIndexToOldIndexMap = new Array(toBePatched);
			for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
			for (i = s1; i <= e1; i++) {
				const prevChild = c1[i];
				if (patched >= toBePatched) {
					unmount(prevChild, parentComponent, parentSuspense, true);
					continue;
				}
				let newIndex;
				if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
				else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
					newIndex = j;
					break;
				}
				if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
				else {
					newIndexToOldIndexMap[newIndex - s2] = i + 1;
					if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
					else moved = true;
					patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					patched++;
				}
			}
			const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
			j = increasingNewIndexSequence.length - 1;
			for (i = toBePatched - 1; i >= 0; i--) {
				const nextIndex = s2 + i;
				const nextChild = c2[nextIndex];
				const anchorVNode = c2[nextIndex + 1];
				const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
				if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (moved) if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
				else j--;
			}
		}
	};
	const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
		const { el, type, transition, children, shapeFlag } = vnode;
		if (shapeFlag & 6) {
			move(vnode.component.subTree, container, anchor, moveType);
			return;
		}
		if (shapeFlag & 128) {
			vnode.suspense.move(container, anchor, moveType);
			return;
		}
		if (shapeFlag & 64) {
			type.move(vnode, container, anchor, internals);
			return;
		}
		if (type === Fragment) {
			hostInsert(el, container, anchor);
			for (let i = 0; i < children.length; i++) move(children[i], container, anchor, moveType);
			hostInsert(vnode.anchor, container, anchor);
			return;
		}
		if (type === Static) {
			moveStaticNode(vnode, container, anchor);
			return;
		}
		if (moveType !== 2 && shapeFlag & 1 && transition) if (moveType === 0) {
			transition.beforeEnter(el);
			hostInsert(el, container, anchor);
			queuePostRenderEffect(() => transition.enter(el), parentSuspense);
		} else {
			const { leave, delayLeave, afterLeave } = transition;
			const remove2 = () => {
				if (vnode.ctx.isUnmounted) hostRemove(el);
				else hostInsert(el, container, anchor);
			};
			const performLeave = () => {
				if (el._isLeaving) el[leaveCbKey](true);
				leave(el, () => {
					remove2();
					afterLeave && afterLeave();
				});
			};
			if (delayLeave) delayLeave(el, remove2, performLeave);
			else performLeave();
		}
		else hostInsert(el, container, anchor);
	};
	const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
		const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex, memo } = vnode;
		if (patchFlag === -2) optimized = false;
		if (ref != null) {
			pauseTracking();
			setRef(ref, null, parentSuspense, vnode, true);
			resetTracking();
		}
		if (cacheIndex != null) parentComponent.renderCache[cacheIndex] = void 0;
		if (shapeFlag & 256) {
			parentComponent.ctx.deactivate(vnode);
			return;
		}
		const shouldInvokeDirs = shapeFlag & 1 && dirs;
		const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
		let vnodeHook;
		if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
		if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
		else {
			if (shapeFlag & 128) {
				vnode.suspense.unmount(parentSuspense, doRemove);
				return;
			}
			if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
			if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, internals, doRemove);
			else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
			else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
			if (doRemove) remove(vnode);
		}
		const shouldInvalidateMemo = memo != null && cacheIndex == null;
		if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) queuePostRenderEffect(() => {
			vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
			shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
			if (shouldInvalidateMemo) vnode.el = null;
		}, parentSuspense);
	};
	const remove = (vnode) => {
		const { type, el, anchor, transition } = vnode;
		if (type === Fragment) {
			removeFragment(el, anchor);
			return;
		}
		if (type === Static) {
			removeStaticNode(vnode);
			return;
		}
		const performRemove = () => {
			hostRemove(el);
			if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
		};
		if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
			const { leave, delayLeave } = transition;
			const performLeave = () => leave(el, performRemove);
			if (delayLeave) delayLeave(vnode.el, performRemove, performLeave);
			else performLeave();
		} else performRemove();
	};
	const removeFragment = (cur, end) => {
		let next;
		while (cur !== end) {
			next = hostNextSibling(cur);
			hostRemove(cur);
			cur = next;
		}
		hostRemove(end);
	};
	const unmountComponent = (instance, parentSuspense, doRemove) => {
		const { bum, scope, job, subTree, um, m, a } = instance;
		invalidateMount(m);
		invalidateMount(a);
		if (bum) invokeArrayFns(bum);
		scope.stop();
		if (job) {
			job.flags |= 8;
			unmount(subTree, instance, parentSuspense, doRemove);
		}
		if (um) queuePostRenderEffect(um, parentSuspense);
		queuePostRenderEffect(() => {
			instance.isUnmounted = true;
		}, parentSuspense);
	};
	const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
		for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
	};
	const getNextHostNode = (vnode) => {
		if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
		if (vnode.shapeFlag & 128) return vnode.suspense.next();
		const el = hostNextSibling(vnode.anchor || vnode.el);
		const teleportEnd = el && el[TeleportEndKey];
		return teleportEnd ? hostNextSibling(teleportEnd) : el;
	};
	let isFlushing = false;
	const render = (vnode, container, namespace) => {
		let instance;
		if (vnode == null) {
			if (container._vnode) {
				unmount(container._vnode, null, null, true);
				instance = container._vnode.component;
			}
		} else patch(container._vnode || null, vnode, container, null, null, null, namespace);
		container._vnode = vnode;
		if (!isFlushing) {
			isFlushing = true;
			flushPreFlushCbs(instance);
			flushPostFlushCbs();
			isFlushing = false;
		}
	};
	const internals = {
		p: patch,
		um: unmount,
		m: move,
		r: remove,
		mt: mountComponent,
		mc: mountChildren,
		pc: patchChildren,
		pbc: patchBlockChildren,
		n: getNextHostNode,
		o: options
	};
	let hydrate;
	let hydrateNode;
	if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
	return {
		render,
		hydrate,
		createApp: createAppAPI(render, hydrate)
	};
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
	return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect, job }, allowed) {
	if (allowed) {
		effect.flags |= 32;
		job.flags |= 4;
	} else {
		effect.flags &= -33;
		job.flags &= -5;
	}
}
function needTransition(parentSuspense, transition) {
	return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
	const ch1 = n1.children;
	const ch2 = n2.children;
	if (isArray(ch1) && isArray(ch2)) for (let i = 0; i < ch1.length; i++) {
		const c1 = ch1[i];
		let c2 = ch2[i];
		if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
			if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
				c2 = ch2[i] = cloneIfMounted(ch2[i]);
				c2.el = c1.el;
			}
			if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
		}
		if (c2.type === Text) {
			if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
			c2.el = c1.el;
		}
		if (c2.type === Comment && !c2.el) c2.el = c1.el;
	}
}
function getSequence(arr) {
	const p = arr.slice();
	const result = [0];
	let i, j, u, v, c;
	const len = arr.length;
	for (i = 0; i < len; i++) {
		const arrI = arr[i];
		if (arrI !== 0) {
			j = result[result.length - 1];
			if (arr[j] < arrI) {
				p[i] = j;
				result.push(i);
				continue;
			}
			u = 0;
			v = result.length - 1;
			while (u < v) {
				c = u + v >> 1;
				if (arr[result[c]] < arrI) u = c + 1;
				else v = c;
			}
			if (arrI < arr[result[u]]) {
				if (u > 0) p[i] = result[u - 1];
				result[u] = i;
			}
		}
	}
	u = result.length;
	v = result[u - 1];
	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}
	return result;
}
function locateNonHydratedAsyncRoot(instance) {
	const subComponent = instance.subTree.component;
	if (subComponent) if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
	else return locateNonHydratedAsyncRoot(subComponent);
}
function invalidateMount(hooks) {
	if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 8;
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
	if (anchorVnode.placeholder) return anchorVnode.placeholder;
	const instance = anchorVnode.component;
	if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
	return null;
}
var isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
	if (suspense && suspense.pendingBranch) if (isArray(fn)) suspense.effects.push(...fn);
	else suspense.effects.push(fn);
	else queuePostFlushCb(fn);
}
var Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
var Text = /* @__PURE__ */ Symbol.for("v-txt");
var Comment = /* @__PURE__ */ Symbol.for("v-cmt");
var Static = /* @__PURE__ */ Symbol.for("v-stc");
var blockStack = [];
var currentBlock = null;
function openBlock(disableTracking = false) {
	blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
	blockStack.pop();
	currentBlock = blockStack[blockStack.length - 1] || null;
}
var isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
	isBlockTreeEnabled += value;
	if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
}
function setupBlock(vnode) {
	vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
	closeBlock();
	if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
	return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
	return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
	return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
}
function isVNode(value) {
	return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
	return n1.type === n2.type && n1.key === n2.key;
}
var normalizeKey = ({ key }) => key != null ? key : null;
var normalizeRef = ({ ref, ref_key, ref_for }) => {
	if (typeof ref === "number") ref = "" + ref;
	return ref != null ? isString(ref) || /* @__PURE__ */ isRef(ref) || isFunction(ref) ? {
		i: currentRenderingInstance,
		r: ref,
		k: ref_key,
		f: !!ref_for
	} : ref : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
	const vnode = {
		__v_isVNode: true,
		__v_skip: true,
		type,
		props,
		key: props && normalizeKey(props),
		ref: props && normalizeRef(props),
		scopeId: currentScopeId,
		slotScopeIds: null,
		children,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag,
		patchFlag,
		dynamicProps,
		dynamicChildren: null,
		appContext: null,
		ctx: currentRenderingInstance
	};
	if (needFullChildrenNormalization) {
		normalizeChildren(vnode, children);
		if (shapeFlag & 128) type.normalize(vnode);
	} else if (children) vnode.shapeFlag |= isString(children) ? 8 : 16;
	if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
	return vnode;
}
var createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
	if (!type || type === NULL_DYNAMIC_COMPONENT) type = Comment;
	if (isVNode(type)) {
		const cloned = cloneVNode(type, props, true);
		if (children) normalizeChildren(cloned, children);
		if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
		else currentBlock.push(cloned);
		cloned.patchFlag = -2;
		return cloned;
	}
	if (isClassComponent(type)) type = type.__vccOpts;
	if (props) {
		props = guardReactiveProps(props);
		let { class: klass, style } = props;
		if (klass && !isString(klass)) props.class = normalizeClass(klass);
		if (isObject(style)) {
			if (/* @__PURE__ */ isProxy(style) && !isArray(style)) style = extend({}, style);
			props.style = normalizeStyle(style);
		}
	}
	const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
	return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
	if (!props) return null;
	return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
	const { props, ref, patchFlag, children, transition } = vnode;
	const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
	const cloned = {
		__v_isVNode: true,
		__v_skip: true,
		type: vnode.type,
		props: mergedProps,
		key: mergedProps && normalizeKey(mergedProps),
		ref: extraProps && extraProps.ref ? mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref,
		scopeId: vnode.scopeId,
		slotScopeIds: vnode.slotScopeIds,
		children,
		target: vnode.target,
		targetStart: vnode.targetStart,
		targetAnchor: vnode.targetAnchor,
		staticCount: vnode.staticCount,
		shapeFlag: vnode.shapeFlag,
		patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
		dynamicProps: vnode.dynamicProps,
		dynamicChildren: vnode.dynamicChildren,
		appContext: vnode.appContext,
		dirs: vnode.dirs,
		transition,
		component: vnode.component,
		suspense: vnode.suspense,
		ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
		ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
		placeholder: vnode.placeholder,
		el: vnode.el,
		anchor: vnode.anchor,
		ctx: vnode.ctx,
		ce: vnode.ce
	};
	if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
	return cloned;
}
function createTextVNode(text = " ", flag = 0) {
	return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
	const vnode = createVNode(Static, null, content);
	vnode.staticCount = numberOfNodes;
	return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
	return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
	if (child == null || typeof child === "boolean") return createVNode(Comment);
	else if (isArray(child)) return createVNode(Fragment, null, child.slice());
	else if (isVNode(child)) return cloneIfMounted(child);
	else return createVNode(Text, null, String(child));
}
function cloneIfMounted(child) {
	return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
	let type = 0;
	const { shapeFlag } = vnode;
	if (children == null) children = null;
	else if (isArray(children)) type = 16;
	else if (typeof children === "object") if (shapeFlag & 65) {
		const slot = children.default;
		if (slot) {
			slot._c && (slot._d = false);
			normalizeChildren(vnode, slot());
			slot._c && (slot._d = true);
		}
		return;
	} else {
		type = 32;
		const slotFlag = children._;
		if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
		else if (slotFlag === 3 && currentRenderingInstance) if (currentRenderingInstance.slots._ === 1) children._ = 1;
		else {
			children._ = 2;
			vnode.patchFlag |= 1024;
		}
	}
	else if (isFunction(children)) {
		children = {
			default: children,
			_ctx: currentRenderingInstance
		};
		type = 32;
	} else {
		children = String(children);
		if (shapeFlag & 64) {
			type = 16;
			children = [createTextVNode(children)];
		} else type = 8;
	}
	vnode.children = children;
	vnode.shapeFlag |= type;
}
function mergeProps(...args) {
	const ret = {};
	for (let i = 0; i < args.length; i++) {
		const toMerge = args[i];
		for (const key in toMerge) if (key === "class") {
			if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
		} else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
		else if (isOn(key)) {
			const existing = ret[key];
			const incoming = toMerge[key];
			if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
			else if (incoming == null && existing == null && !isModelListener(key)) ret[key] = incoming;
		} else if (key !== "") ret[key] = toMerge[key];
	}
	return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
	callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
}
var emptyAppContext = createAppContext();
var uid = 0;
function createComponentInstance(vnode, parent, suspense) {
	const type = vnode.type;
	const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
	const instance = {
		uid: uid++,
		vnode,
		type,
		parent,
		appContext,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new EffectScope(true),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: parent ? parent.provides : Object.create(appContext.provides),
		ids: parent ? parent.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: normalizePropsOptions(type, appContext),
		emitsOptions: normalizeEmitsOptions(type, appContext),
		emit: null,
		emitted: null,
		propsDefaults: EMPTY_OBJ,
		inheritAttrs: type.inheritAttrs,
		ctx: EMPTY_OBJ,
		data: EMPTY_OBJ,
		props: EMPTY_OBJ,
		attrs: EMPTY_OBJ,
		slots: EMPTY_OBJ,
		refs: EMPTY_OBJ,
		setupState: EMPTY_OBJ,
		setupContext: null,
		suspense,
		suspenseId: suspense ? suspense.pendingId : 0,
		asyncDep: null,
		asyncResolved: false,
		isMounted: false,
		isUnmounted: false,
		isDeactivated: false,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	instance.ctx = { _: instance };
	instance.root = parent ? parent.root : instance;
	instance.emit = emit.bind(null, instance);
	if (vnode.ce) vnode.ce(instance);
	return instance;
}
var currentInstance = null;
var getCurrentInstance = () => currentInstance || currentRenderingInstance;
var internalSetCurrentInstance;
var setInSSRSetupState;
{
	const g = getGlobalThis();
	const registerGlobalSetter = (key, setter) => {
		let setters;
		if (!(setters = g[key])) setters = g[key] = [];
		setters.push(setter);
		return (v) => {
			if (setters.length > 1) setters.forEach((set) => set(v));
			else setters[0](v);
		};
	};
	internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
	setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
}
var setCurrentInstance = (instance) => {
	const prev = currentInstance;
	internalSetCurrentInstance(instance);
	instance.scope.on();
	return () => {
		instance.scope.off();
		internalSetCurrentInstance(prev);
	};
};
var unsetCurrentInstance = () => {
	currentInstance && currentInstance.scope.off();
	internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
	return instance.vnode.shapeFlag & 4;
}
var isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
	isSSR && setInSSRSetupState(isSSR);
	const { props, children } = instance.vnode;
	const isStateful = isStatefulComponent(instance);
	initProps(instance, props, isStateful, isSSR);
	initSlots(instance, children, optimized || isSSR);
	const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
	isSSR && setInSSRSetupState(false);
	return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
	const Component = instance.type;
	instance.accessCache = /* @__PURE__ */ Object.create(null);
	instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
	const { setup } = Component;
	if (setup) {
		pauseTracking();
		const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
		const reset = setCurrentInstance(instance);
		const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
		const isAsyncSetup = isPromise(setupResult);
		resetTracking();
		reset();
		if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
		if (isAsyncSetup) {
			setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
			if (isSSR) return setupResult.then((resolvedResult) => {
				handleSetupResult(instance, resolvedResult, isSSR);
			}).catch((e) => {
				handleError(e, instance, 0);
			});
			else instance.asyncDep = setupResult;
		} else handleSetupResult(instance, setupResult, isSSR);
	} else finishComponentSetup(instance, isSSR);
}
function handleSetupResult(instance, setupResult, isSSR) {
	if (isFunction(setupResult)) if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
	else instance.render = setupResult;
	else if (isObject(setupResult)) instance.setupState = proxyRefs(setupResult);
	finishComponentSetup(instance, isSSR);
}
var compile;
var installWithProxy;
function finishComponentSetup(instance, isSSR, skipOptions) {
	const Component = instance.type;
	if (!instance.render) {
		if (!isSSR && compile && !Component.render) {
			const template = Component.template || resolveMergedOptions(instance).template;
			if (template) {
				const { isCustomElement, compilerOptions } = instance.appContext.config;
				const { delimiters, compilerOptions: componentCompilerOptions } = Component;
				Component.render = compile(template, extend(extend({
					isCustomElement,
					delimiters
				}, compilerOptions), componentCompilerOptions));
			}
		}
		instance.render = Component.render || NOOP;
		if (installWithProxy) installWithProxy(instance);
	}
	{
		const reset = setCurrentInstance(instance);
		pauseTracking();
		try {
			applyOptions(instance);
		} finally {
			resetTracking();
			reset();
		}
	}
}
var attrsProxyHandlers = { get(target, key) {
	track(target, "get", "");
	return target[key];
} };
function createSetupContext(instance) {
	const expose = (exposed) => {
		instance.exposed = exposed || {};
	};
	return {
		attrs: new Proxy(instance.attrs, attrsProxyHandlers),
		slots: instance.slots,
		emit: instance.emit,
		expose
	};
}
function getComponentPublicInstance(instance) {
	if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
		get(target, key) {
			if (key in target) return target[key];
			else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
		},
		has(target, key) {
			return key in target || key in publicPropertiesMap;
		}
	}));
	else return instance.proxy;
}
function isClassComponent(value) {
	return isFunction(value) && "__vccOpts" in value;
}
var computed = (getterOrOptions, debugOptions) => {
	return /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
};
var version = "3.5.31";
//#endregion
//#region node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
/**
* @vue/runtime-dom v3.5.31
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
var policy = void 0;
var tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) try {
	policy = /* @__PURE__ */ tt.createPolicy("vue", { createHTML: (val) => val });
} catch (e) {}
var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
var svgNS = "http://www.w3.org/2000/svg";
var mathmlNS = "http://www.w3.org/1998/Math/MathML";
var doc = typeof document !== "undefined" ? document : null;
var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
var nodeOps = {
	insert: (child, parent, anchor) => {
		parent.insertBefore(child, anchor || null);
	},
	remove: (child) => {
		const parent = child.parentNode;
		if (parent) parent.removeChild(child);
	},
	createElement: (tag, namespace, is, props) => {
		const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
		if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
		return el;
	},
	createText: (text) => doc.createTextNode(text),
	createComment: (text) => doc.createComment(text),
	setText: (node, text) => {
		node.nodeValue = text;
	},
	setElementText: (el, text) => {
		el.textContent = text;
	},
	parentNode: (node) => node.parentNode,
	nextSibling: (node) => node.nextSibling,
	querySelector: (selector) => doc.querySelector(selector),
	setScopeId(el, id) {
		el.setAttribute(id, "");
	},
	insertStaticContent(content, parent, anchor, namespace, start, end) {
		const before = anchor ? anchor.previousSibling : parent.lastChild;
		if (start && (start === end || start.nextSibling)) while (true) {
			parent.insertBefore(start.cloneNode(true), anchor);
			if (start === end || !(start = start.nextSibling)) break;
		}
		else {
			templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
			const template = templateContainer.content;
			if (namespace === "svg" || namespace === "mathml") {
				const wrapper = template.firstChild;
				while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
				template.removeChild(wrapper);
			}
			parent.insertBefore(template, anchor);
		}
		return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
	}
};
var TRANSITION = "transition";
var ANIMATION = "animation";
var vtcKey = /* @__PURE__ */ Symbol("_vtc");
var DOMTransitionPropsValidators = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: true
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
};
var TransitionPropsValidators = /* @__PURE__ */ extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
var callHook = (hook, args = []) => {
	if (isArray(hook)) hook.forEach((h2) => h2(...args));
	else if (hook) hook(...args);
};
var hasExplicitCallback = (hook) => {
	return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
	const baseProps = {};
	for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
	if (rawProps.css === false) return baseProps;
	const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
	const durations = normalizeDuration(duration);
	const enterDuration = durations && durations[0];
	const leaveDuration = durations && durations[1];
	const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
	const finishEnter = (el, isAppear, done, isCancelled) => {
		el._enterCancelled = isCancelled;
		removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
		removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
		done && done();
	};
	const finishLeave = (el, done) => {
		el._isLeaving = false;
		removeTransitionClass(el, leaveFromClass);
		removeTransitionClass(el, leaveToClass);
		removeTransitionClass(el, leaveActiveClass);
		done && done();
	};
	const makeEnterHook = (isAppear) => {
		return (el, done) => {
			const hook = isAppear ? onAppear : onEnter;
			const resolve = () => finishEnter(el, isAppear, done);
			callHook(hook, [el, resolve]);
			nextFrame(() => {
				removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
				addTransitionClass(el, isAppear ? appearToClass : enterToClass);
				if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve);
			});
		};
	};
	return extend(baseProps, {
		onBeforeEnter(el) {
			callHook(onBeforeEnter, [el]);
			addTransitionClass(el, enterFromClass);
			addTransitionClass(el, enterActiveClass);
		},
		onBeforeAppear(el) {
			callHook(onBeforeAppear, [el]);
			addTransitionClass(el, appearFromClass);
			addTransitionClass(el, appearActiveClass);
		},
		onEnter: makeEnterHook(false),
		onAppear: makeEnterHook(true),
		onLeave(el, done) {
			el._isLeaving = true;
			const resolve = () => finishLeave(el, done);
			addTransitionClass(el, leaveFromClass);
			if (!el._enterCancelled) {
				forceReflow(el);
				addTransitionClass(el, leaveActiveClass);
			} else {
				addTransitionClass(el, leaveActiveClass);
				forceReflow(el);
			}
			nextFrame(() => {
				if (!el._isLeaving) return;
				removeTransitionClass(el, leaveFromClass);
				addTransitionClass(el, leaveToClass);
				if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve);
			});
			callHook(onLeave, [el, resolve]);
		},
		onEnterCancelled(el) {
			finishEnter(el, false, void 0, true);
			callHook(onEnterCancelled, [el]);
		},
		onAppearCancelled(el) {
			finishEnter(el, true, void 0, true);
			callHook(onAppearCancelled, [el]);
		},
		onLeaveCancelled(el) {
			finishLeave(el);
			callHook(onLeaveCancelled, [el]);
		}
	});
}
function normalizeDuration(duration) {
	if (duration == null) return null;
	else if (isObject(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
	else {
		const n = NumberOf(duration);
		return [n, n];
	}
}
function NumberOf(val) {
	return toNumber(val);
}
function addTransitionClass(el, cls) {
	cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
	(el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
	cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
	const _vtc = el[vtcKey];
	if (_vtc) {
		_vtc.delete(cls);
		if (!_vtc.size) el[vtcKey] = void 0;
	}
}
function nextFrame(cb) {
	requestAnimationFrame(() => {
		requestAnimationFrame(cb);
	});
}
var endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
	const id = el._endId = ++endId;
	const resolveIfNotStale = () => {
		if (id === el._endId) resolve();
	};
	if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
	const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
	if (!type) return resolve();
	const endEvent = type + "end";
	let ended = 0;
	const end = () => {
		el.removeEventListener(endEvent, onEnd);
		resolveIfNotStale();
	};
	const onEnd = (e) => {
		if (e.target === el && ++ended >= propCount) end();
	};
	setTimeout(() => {
		if (ended < propCount) end();
	}, timeout + 1);
	el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
	const styles = window.getComputedStyle(el);
	const getStyleProperties = (key) => (styles[key] || "").split(", ");
	const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
	const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
	const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
	const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
	const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
	const animationTimeout = getTimeout(animationDelays, animationDurations);
	let type = null;
	let timeout = 0;
	let propCount = 0;
	if (expectedType === TRANSITION) {
		if (transitionTimeout > 0) {
			type = TRANSITION;
			timeout = transitionTimeout;
			propCount = transitionDurations.length;
		}
	} else if (expectedType === ANIMATION) {
		if (animationTimeout > 0) {
			type = ANIMATION;
			timeout = animationTimeout;
			propCount = animationDurations.length;
		}
	} else {
		timeout = Math.max(transitionTimeout, animationTimeout);
		type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
		propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
	}
	const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
	return {
		type,
		timeout,
		propCount,
		hasTransform
	};
}
function getTimeout(delays, durations) {
	while (delays.length < durations.length) delays = delays.concat(delays);
	return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
	if (s === "auto") return 0;
	return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
	return (el ? el.ownerDocument : document).body.offsetHeight;
}
function patchClass(el, value, isSVG) {
	const transitionClasses = el[vtcKey];
	if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
	if (value == null) el.removeAttribute("class");
	else if (isSVG) el.setAttribute("class", value);
	else el.className = value;
}
var vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
var vShowHidden = /* @__PURE__ */ Symbol("_vsh");
var vShow = {
	name: "show",
	beforeMount(el, { value }, { transition }) {
		el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
		if (transition && value) transition.beforeEnter(el);
		else setDisplay(el, value);
	},
	mounted(el, { value }, { transition }) {
		if (transition && value) transition.enter(el);
	},
	updated(el, { value, oldValue }, { transition }) {
		if (!value === !oldValue) return;
		if (transition) if (value) {
			transition.beforeEnter(el);
			setDisplay(el, true);
			transition.enter(el);
		} else transition.leave(el, () => {
			setDisplay(el, false);
		});
		else setDisplay(el, value);
	},
	beforeUnmount(el, { value }) {
		setDisplay(el, value);
	}
};
function setDisplay(el, value) {
	el.style.display = value ? el[vShowOriginalDisplay] : "none";
	el[vShowHidden] = !value;
}
var CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
var displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
	const style = el.style;
	const isCssString = isString(next);
	let hasControlledDisplay = false;
	if (next && !isCssString) {
		if (prev) if (!isString(prev)) {
			for (const key in prev) if (next[key] == null) setStyle(style, key, "");
		} else for (const prevStyle of prev.split(";")) {
			const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
			if (next[key] == null) setStyle(style, key, "");
		}
		for (const key in next) {
			if (key === "display") hasControlledDisplay = true;
			setStyle(style, key, next[key]);
		}
	} else if (isCssString) {
		if (prev !== next) {
			const cssVarText = style[CSS_VAR_TEXT];
			if (cssVarText) next += ";" + cssVarText;
			style.cssText = next;
			hasControlledDisplay = displayRE.test(next);
		}
	} else if (prev) el.removeAttribute("style");
	if (vShowOriginalDisplay in el) {
		el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
		if (el[vShowHidden]) style.display = "none";
	}
}
var importantRE = /\s*!important$/;
function setStyle(style, name, val) {
	if (isArray(val)) val.forEach((v) => setStyle(style, name, v));
	else {
		if (val == null) val = "";
		if (name.startsWith("--")) style.setProperty(name, val);
		else {
			const prefixed = autoPrefix(style, name);
			if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
			else style[prefixed] = val;
		}
	}
}
var prefixes = [
	"Webkit",
	"Moz",
	"ms"
];
var prefixCache = {};
function autoPrefix(style, rawName) {
	const cached = prefixCache[rawName];
	if (cached) return cached;
	let name = camelize(rawName);
	if (name !== "filter" && name in style) return prefixCache[rawName] = name;
	name = capitalize(name);
	for (let i = 0; i < prefixes.length; i++) {
		const prefixed = prefixes[i] + name;
		if (prefixed in style) return prefixCache[rawName] = prefixed;
	}
	return rawName;
}
var xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
	if (isSVG && key.startsWith("xlink:")) if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
	else el.setAttributeNS(xlinkNS, key, value);
	else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
	else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
	if (key === "innerHTML" || key === "textContent") {
		if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
		return;
	}
	const tag = el.tagName;
	if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
		const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
		const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
		if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
		if (value == null) el.removeAttribute(key);
		el._value = value;
		return;
	}
	let needRemove = false;
	if (value === "" || value == null) {
		const type = typeof el[key];
		if (type === "boolean") value = includeBooleanAttr(value);
		else if (value == null && type === "string") {
			value = "";
			needRemove = true;
		} else if (type === "number") {
			value = 0;
			needRemove = true;
		}
	}
	try {
		el[key] = value;
	} catch (e) {}
	needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
	el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
	el.removeEventListener(event, handler, options);
}
var veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
	const invokers = el[veiKey] || (el[veiKey] = {});
	const existingInvoker = invokers[rawName];
	if (nextValue && existingInvoker) existingInvoker.value = nextValue;
	else {
		const [name, options] = parseName(rawName);
		if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(nextValue, instance), options);
		else if (existingInvoker) {
			removeEventListener(el, name, existingInvoker, options);
			invokers[rawName] = void 0;
		}
	}
}
var optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
	let options;
	if (optionsModifierRE.test(name)) {
		options = {};
		let m;
		while (m = name.match(optionsModifierRE)) {
			name = name.slice(0, name.length - m[0].length);
			options[m[0].toLowerCase()] = true;
		}
	}
	return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
}
var cachedNow = 0;
var p = /* @__PURE__ */ Promise.resolve();
var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
	const invoker = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= invoker.attached) return;
		callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5, [e]);
	};
	invoker.value = initialValue;
	invoker.attached = getNow();
	return invoker;
}
function patchStopImmediatePropagation(e, value) {
	if (isArray(value)) {
		const originalStop = e.stopImmediatePropagation;
		e.stopImmediatePropagation = () => {
			originalStop.call(e);
			e._stopped = true;
		};
		return value.map((fn) => (e2) => !e2._stopped && fn && fn(e2));
	} else return value;
}
var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
	const isSVG = namespace === "svg";
	if (key === "class") patchClass(el, nextValue, isSVG);
	else if (key === "style") patchStyle(el, prevValue, nextValue);
	else if (isOn(key)) {
		if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
	} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
		patchDOMProp(el, key, nextValue);
		if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
	} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
	else {
		if (key === "true-value") el._trueValue = nextValue;
		else if (key === "false-value") el._falseValue = nextValue;
		patchAttr(el, key, nextValue, isSVG);
	}
};
function shouldSetAsProp(el, key, value, isSVG) {
	if (isSVG) {
		if (key === "innerHTML" || key === "textContent") return true;
		if (key in el && isNativeOn(key) && isFunction(value)) return true;
		return false;
	}
	if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
	if (key === "sandbox" && el.tagName === "IFRAME") return false;
	if (key === "form") return false;
	if (key === "list" && el.tagName === "INPUT") return false;
	if (key === "type" && el.tagName === "TEXTAREA") return false;
	if (key === "width" || key === "height") {
		const tag = el.tagName;
		if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
	}
	if (isNativeOn(key) && isString(value)) return false;
	return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
	const props = el._def.props;
	if (!props) return false;
	const camelKey = camelize(key);
	return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
var positionMap = /* @__PURE__ */ new WeakMap();
var newPositionMap = /* @__PURE__ */ new WeakMap();
var moveCbKey = /* @__PURE__ */ Symbol("_moveCb");
var enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
var decorate = (t) => {
	delete t.props.mode;
	return t;
};
var TransitionGroup = /* @__PURE__ */ decorate({
	name: "TransitionGroup",
	props: /* @__PURE__ */ extend({}, TransitionPropsValidators, {
		tag: String,
		moveClass: String
	}),
	setup(props, { slots }) {
		const instance = getCurrentInstance();
		const state = useTransitionState();
		let prevChildren;
		let children;
		onUpdated(() => {
			if (!prevChildren.length) return;
			const moveClass = props.moveClass || `${props.name || "v"}-move`;
			if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
				prevChildren = [];
				return;
			}
			prevChildren.forEach(callPendingCbs);
			prevChildren.forEach(recordPosition);
			const movedChildren = prevChildren.filter(applyTranslation);
			forceReflow(instance.vnode.el);
			movedChildren.forEach((c) => {
				const el = c.el;
				const style = el.style;
				addTransitionClass(el, moveClass);
				style.transform = style.webkitTransform = style.transitionDuration = "";
				const cb = el[moveCbKey] = (e) => {
					if (e && e.target !== el) return;
					if (!e || e.propertyName.endsWith("transform")) {
						el.removeEventListener("transitionend", cb);
						el[moveCbKey] = null;
						removeTransitionClass(el, moveClass);
					}
				};
				el.addEventListener("transitionend", cb);
			});
			prevChildren = [];
		});
		return () => {
			const rawProps = /* @__PURE__ */ toRaw(props);
			const cssTransitionProps = resolveTransitionProps(rawProps);
			let tag = rawProps.tag || Fragment;
			prevChildren = [];
			if (children) for (let i = 0; i < children.length; i++) {
				const child = children[i];
				if (child.el && child.el instanceof Element) {
					prevChildren.push(child);
					setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
					positionMap.set(child, getPosition(child.el));
				}
			}
			children = slots.default ? getTransitionRawChildren(slots.default()) : [];
			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				if (child.key != null) setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
			}
			return createVNode(tag, null, children);
		};
	}
});
function callPendingCbs(c) {
	const el = c.el;
	if (el[moveCbKey]) el[moveCbKey]();
	if (el[enterCbKey]) el[enterCbKey]();
}
function recordPosition(c) {
	newPositionMap.set(c, getPosition(c.el));
}
function applyTranslation(c) {
	const oldPos = positionMap.get(c);
	const newPos = newPositionMap.get(c);
	const dx = oldPos.left - newPos.left;
	const dy = oldPos.top - newPos.top;
	if (dx || dy) {
		const el = c.el;
		const s = el.style;
		const rect = el.getBoundingClientRect();
		let scaleX = 1;
		let scaleY = 1;
		if (el.offsetWidth) scaleX = rect.width / el.offsetWidth;
		if (el.offsetHeight) scaleY = rect.height / el.offsetHeight;
		if (!Number.isFinite(scaleX) || scaleX === 0) scaleX = 1;
		if (!Number.isFinite(scaleY) || scaleY === 0) scaleY = 1;
		if (Math.abs(scaleX - 1) < .01) scaleX = 1;
		if (Math.abs(scaleY - 1) < .01) scaleY = 1;
		s.transform = s.webkitTransform = `translate(${dx / scaleX}px,${dy / scaleY}px)`;
		s.transitionDuration = "0s";
		return c;
	}
}
function getPosition(el) {
	const rect = el.getBoundingClientRect();
	return {
		left: rect.left,
		top: rect.top
	};
}
function hasCSSTransform(el, root, moveClass) {
	const clone = el.cloneNode();
	const _vtc = el[vtcKey];
	if (_vtc) _vtc.forEach((cls) => {
		cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
	});
	moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
	clone.style.display = "none";
	const container = root.nodeType === 1 ? root : root.parentNode;
	container.appendChild(clone);
	const { hasTransform } = getTransitionInfo(clone);
	container.removeChild(clone);
	return hasTransform;
}
var getModelAssigner = (vnode) => {
	const fn = vnode.props["onUpdate:modelValue"] || false;
	return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
	e.target.composing = true;
}
function onCompositionEnd(e) {
	const target = e.target;
	if (target.composing) {
		target.composing = false;
		target.dispatchEvent(new Event("input"));
	}
}
var assignKey = /* @__PURE__ */ Symbol("_assign");
function castValue(value, trim, number) {
	if (trim) value = value.trim();
	if (number) value = looseToNumber(value);
	return value;
}
var vModelText = {
	created(el, { modifiers: { lazy, trim, number } }, vnode) {
		el[assignKey] = getModelAssigner(vnode);
		const castToNumber = number || vnode.props && vnode.props.type === "number";
		addEventListener(el, lazy ? "change" : "input", (e) => {
			if (e.target.composing) return;
			el[assignKey](castValue(el.value, trim, castToNumber));
		});
		if (trim || castToNumber) addEventListener(el, "change", () => {
			el.value = castValue(el.value, trim, castToNumber);
		});
		if (!lazy) {
			addEventListener(el, "compositionstart", onCompositionStart);
			addEventListener(el, "compositionend", onCompositionEnd);
			addEventListener(el, "change", onCompositionEnd);
		}
	},
	mounted(el, { value }) {
		el.value = value == null ? "" : value;
	},
	beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
		el[assignKey] = getModelAssigner(vnode);
		if (el.composing) return;
		const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
		const newValue = value == null ? "" : value;
		if (elValue === newValue) return;
		const rootNode = el.getRootNode();
		if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
			if (lazy && value === oldValue) return;
			if (trim && el.value.trim() === newValue) return;
		}
		el.value = newValue;
	}
};
var systemModifiers = [
	"ctrl",
	"shift",
	"alt",
	"meta"
];
var modifierGuards = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
var withModifiers = (fn, modifiers) => {
	if (!fn) return fn;
	const cache = fn._withMods || (fn._withMods = {});
	const cacheKey = modifiers.join(".");
	return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
		for (let i = 0; i < modifiers.length; i++) {
			const guard = modifierGuards[modifiers[i]];
			if (guard && guard(event, modifiers)) return;
		}
		return fn(event, ...args);
	}));
};
var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
var renderer;
function ensureRenderer() {
	return renderer || (renderer = createRenderer(rendererOptions));
}
var createApp = ((...args) => {
	const app = ensureRenderer().createApp(...args);
	const { mount } = app;
	app.mount = (containerOrSelector) => {
		const container = normalizeContainer(containerOrSelector);
		if (!container) return;
		const component = app._component;
		if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
		if (container.nodeType === 1) container.textContent = "";
		const proxy = mount(container, false, resolveRootNamespace(container));
		if (container instanceof Element) {
			container.removeAttribute("v-cloak");
			container.setAttribute("data-v-app", "");
		}
		return proxy;
	};
	return app;
});
function resolveRootNamespace(container) {
	if (container instanceof SVGElement) return "svg";
	if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
}
function normalizeContainer(container) {
	if (isString(container)) return document.querySelector(container);
	return container;
}
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region src/components/AppModal.vue
var _hoisted_1$6 = ["aria-label"];
var _hoisted_2$6 = { class: "modal-header" };
var _hoisted_3$6 = { class: "modal-body" };
var AppModal_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "AppModal",
	props: {
		modelValue: {
			type: Boolean,
			required: true
		},
		title: {
			type: String,
			default: ""
		},
		icon: {
			type: String,
			default: ""
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const close = () => {
			emit("update:modelValue", false);
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["modal-overlay", { active: __props.modelValue }]) }, [createBaseVNode("div", {
				class: "modal",
				role: "dialog",
				"aria-label": __props.title
			}, [createBaseVNode("div", _hoisted_2$6, [createBaseVNode("h2", null, [__props.icon ? (openBlock(), createElementBlock("i", {
				key: 0,
				class: normalizeClass(__props.icon)
			}, null, 2)) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(__props.title), 1)]), createBaseVNode("button", {
				class: "close-btn",
				onClick: close,
				title: "关闭 (Esc)"
			}, [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "fa-solid fa-xmark" }, null, -1)])])]), createBaseVNode("div", _hoisted_3$6, [renderSlot(_ctx.$slots, "default", {}, void 0, true)])], 8, _hoisted_1$6)], 2);
		};
	}
}, [["__scopeId", "data-v-64f1be7d"]]);
//#endregion
//#region src/components/SliderInput.vue
var _hoisted_1$5 = { class: "slider-input" };
var _hoisted_2$5 = [
	"min",
	"max",
	"step",
	"value"
];
var _hoisted_3$5 = { class: "slider-header" };
var _hoisted_4$4 = { class: "form-label" };
var _hoisted_5$4 = ["value"];
var SliderInput_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "SliderInput",
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		label: {
			type: String,
			default: ""
		},
		unit: {
			type: String,
			default: ""
		},
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		step: {
			type: Number,
			default: 1
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const onInput = (e) => {
			emit("update:modelValue", Number(e.target.value));
		};
		const pct = computed(() => {
			return ((props.modelValue - props.min) / (props.max - props.min) * 100).toFixed(1) + "%";
		});
		const onTextChange = (e) => {
			let val = Number(e.target.value);
			if (isNaN(val)) return;
			val = Math.max(props.min, Math.min(props.max, val));
			emit("update:modelValue", val);
		};
		const onTextFocus = (e) => {
			const input = e.target;
			const onWheel = (event) => {
				event.preventDefault();
				let val = Number(input.value);
				if (isNaN(val)) return;
				val += event.deltaY < 0 ? 1 : -1;
				val = Math.max(props.min, Math.min(props.max, val));
				emit("update:modelValue", val);
			};
			input.addEventListener("wheel", onWheel);
			const onBlur = () => {
				input.removeEventListener("wheel", onWheel);
				input.removeEventListener("blur", onBlur);
			};
			input.addEventListener("blur", onBlur);
			const onKeyDown = (event) => {
				let val = Number(input.value);
				if (isNaN(val)) return;
				if (event.key === "ArrowUp") val += 1;
				else if (event.key === "ArrowDown") val -= 1;
				val = Math.max(props.min, Math.min(props.max, val));
				emit("update:modelValue", val);
			};
			input.addEventListener("keydown", onKeyDown);
			const onBlurKey = () => {
				input.removeEventListener("keydown", onKeyDown);
				input.removeEventListener("blur", onBlurKey);
			};
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$5, [createBaseVNode("input", {
				type: "range",
				min: __props.min,
				max: __props.max,
				step: __props.step,
				value: __props.modelValue,
				style: normalizeStyle({ "--pct": pct.value }),
				onInput,
				class: "slider"
			}, null, 44, _hoisted_2$5), createBaseVNode("div", _hoisted_3$5, [
				createBaseVNode("span", _hoisted_4$4, toDisplayString(__props.label), 1),
				createBaseVNode("input", {
					class: "form-input",
					type: "text",
					value: __props.modelValue,
					onInput: onTextChange,
					onFocus: onTextFocus
				}, null, 40, _hoisted_5$4),
				createTextVNode(toDisplayString(__props.unit), 1)
			])]);
		};
	}
}, [["__scopeId", "data-v-196ca14e"]]);
//#endregion
//#region src/composables/useToast.js
var toasts = /* @__PURE__ */ ref([]);
var idCounter = 0;
/**
* 显示一条 Toast 通知
* @param {string} message - 提示文字
* @param {'info'|'success'|'error'} type - 类型
* @param {number} duration - 显示时长（毫秒）
*/
var showToast = (message, type = "info", duration = 2500) => {
	const id = ++idCounter;
	toasts.value.push({
		id,
		message,
		type,
		leaving: false
	});
	setTimeout(() => {
		const toast = toasts.value.find((t) => t.id === id);
		if (toast) toast.leaving = true;
		setTimeout(() => {
			toasts.value = toasts.value.filter((t) => t.id !== id);
		}, 300);
	}, duration);
};
/**
* useToast —— 在组件里调用这个函数来使用 Toast 功能
*
* 用法：
*   const { toasts, showToast } = useToast()
*   showToast('保存成功', 'success')
*/
function useToast() {
	return {
		toasts,
		showToast
	};
}
//#endregion
//#region src/views/VideoSubtitle.vue
var _hoisted_1$4 = { class: "app-layout" };
var _hoisted_2$4 = { class: "app-left" };
var _hoisted_3$4 = { class: "upload-text" };
var _hoisted_4$3 = ["src"];
var _hoisted_5$3 = {
	key: 1,
	class: "video-info-bar"
};
var _hoisted_6$3 = {
	key: 2,
	class: "toolbar"
};
var _hoisted_7$3 = { class: "cover-btn-container" };
var _hoisted_8$3 = {
	key: 0,
	class: "cover-options"
};
var _hoisted_9$3 = ["disabled"];
var _hoisted_10$3 = { class: "app-middle" };
var _hoisted_11$3 = { class: "settings-panel" };
var _hoisted_12$3 = { class: "setting-item" };
var _hoisted_13$3 = { class: "setting-item" };
var _hoisted_14$3 = { class: "setting-item" };
var _hoisted_15$3 = { class: "seg-control" };
var _hoisted_16$3 = ["onClick"];
var _hoisted_17$3 = { class: "setting-item" };
var _hoisted_18$3 = { class: "form-label" };
var _hoisted_19$3 = {
	key: 0,
	class: "form-hint"
};
var _hoisted_20$3 = { class: "seg-control" };
var _hoisted_21$3 = ["disabled", "onClick"];
var _hoisted_22$3 = { class: "time-wrapper" };
var _hoisted_23$3 = ["onClick"];
var _hoisted_24$3 = { class: "time-item-text" };
var _hoisted_25$3 = ["onClick"];
var _hoisted_26$3 = { class: "action-row" };
var _hoisted_27$3 = ["disabled"];
var _hoisted_28$3 = ["disabled"];
var _hoisted_29$3 = {
	key: 0,
	class: "app-right"
};
var _hoisted_30$3 = { class: "result-section" };
var _hoisted_31$3 = { class: "result-header" };
var _hoisted_32$3 = { class: "result-canvas-container" };
var _hoisted_33$3 = { class: "result-actions" };
var VideoSubtitle_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "VideoSubtitle",
	setup(__props) {
		const { showToast } = useToast();
		const fileInput = /* @__PURE__ */ ref(null);
		const videoEl = /* @__PURE__ */ ref(null);
		const overlayCanvas = /* @__PURE__ */ ref(null);
		const videoWrapper = /* @__PURE__ */ ref(null);
		const resultCanvasEl = /* @__PURE__ */ ref(null);
		const videoUrl = /* @__PURE__ */ ref(null);
		const isDragOver = /* @__PURE__ */ ref(false);
		const videoInfo = /* @__PURE__ */ ref(null);
		const videoNativeW = /* @__PURE__ */ ref(0);
		const videoNativeH = /* @__PURE__ */ ref(0);
		const topCutRatio = /* @__PURE__ */ ref(.75);
		const bottomCutRatio = /* @__PURE__ */ ref(1);
		const coverTimeSec = /* @__PURE__ */ ref(null);
		const showCoverTip = /* @__PURE__ */ ref(false);
		const showCoverOptions = /* @__PURE__ */ ref(false);
		const customCoverImage = /* @__PURE__ */ ref(null);
		const coverFileInput = /* @__PURE__ */ ref(null);
		const timePoints = /* @__PURE__ */ ref([]);
		const fps = /* @__PURE__ */ ref(30);
		const format = /* @__PURE__ */ ref("png");
		const compressionOptions = [
			{
				label: "不压缩",
				value: 1
			},
			{
				label: "2x 压缩",
				value: .5
			},
			{
				label: "4x 压缩",
				value: .25
			},
			{
				label: "8x 压缩",
				value: .125
			}
		];
		const compression = /* @__PURE__ */ ref(1);
		const resultCanvas = /* @__PURE__ */ ref(null);
		const resultWidth = /* @__PURE__ */ ref(0);
		const resultHeight = /* @__PURE__ */ ref(0);
		const extractedCount = /* @__PURE__ */ ref(0);
		const isExtracting = /* @__PURE__ */ ref(false);
		const statusMsg = /* @__PURE__ */ ref("就绪 · 上传视频后通过滑块调整裁剪线");
		const statusType = /* @__PURE__ */ ref("");
		const setStatus = (msg, type = "") => {
			statusMsg.value = msg;
			statusType.value = type;
		};
		const formatTime = (seconds) => {
			if (seconds === null || seconds === void 0) return "--";
			const h = Math.floor(seconds / 3600);
			const m = Math.floor(seconds % 3600 / 60);
			const s = Math.floor(seconds % 60);
			const ms = Math.floor(seconds % 1 * 1e3);
			return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(ms).padStart(3, "0");
		};
		const formatBytes = (bytes) => {
			if (!bytes) return "-";
			if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
			return (bytes / 1048576).toFixed(1) + " MB";
		};
		const onFileChange = (e) => {
			const file = e.target.files[0];
			if (file) loadVideo(file);
			e.target.value = "";
		};
		const onDrop = (e) => {
			isDragOver.value = false;
			const file = e.dataTransfer.files[0];
			if (file && file.type.startsWith("video/")) loadVideo(file);
		};
		const loadVideo = (file) => {
			if (!file.type.startsWith("video/")) {
				showToast("请选择有效的视频文件", "error");
				return;
			}
			if (file.size > 2 * 1024 * 1024 * 1024) {
				showToast("视频文件过大（最大支持 2GB）", "error");
				return;
			}
			if (videoUrl.value) URL.revokeObjectURL(videoUrl.value);
			videoUrl.value = URL.createObjectURL(file);
			videoInfo.value = {
				name: file.name,
				width: "加载中...",
				height: "",
				size: formatBytes(file.size)
			};
			topCutRatio.value = .88;
			bottomCutRatio.value = 1;
			coverTimeSec.value = null;
			showCoverTip.value = false;
			showCoverOptions.value = false;
			customCoverImage.value = null;
			timePoints.value = [];
			resultCanvas.value = null;
			setStatus("视频加载中...", "processing");
		};
		const removeVideo = () => {
			if (videoUrl.value) URL.revokeObjectURL(videoUrl.value);
			videoUrl.value = null;
			videoInfo.value = null;
			resultCanvas.value = null;
			topCutRatio.value = .88;
			bottomCutRatio.value = 1;
			coverTimeSec.value = null;
			showCoverTip.value = false;
			showCoverOptions.value = false;
			customCoverImage.value = null;
			timePoints.value = [];
			setStatus("就绪 · 上传视频后通过滑块调整裁剪线");
			showToast("视频已移除", "success");
		};
		const onVideoError = (e) => {
			console.error("视频加载错误:", e);
			const errorMsg = {
				1: "视频加载被中止",
				2: "网络错误，请检查网络连接",
				3: "视频解码失败，格式可能不支持",
				4: "视频文件损坏或格式不受支持"
			}[videoEl.value?.error?.code || 4] || "视频加载失败";
			showToast(errorMsg, "error");
			setStatus(`错误：${errorMsg}`, "error");
			if (videoUrl.value) {
				URL.revokeObjectURL(videoUrl.value);
				videoUrl.value = null;
			}
			videoInfo.value = null;
		};
		const onVideoLoaded = async () => {
			const video = videoEl.value;
			if (!video) return;
			videoNativeW.value = video.videoWidth;
			videoNativeH.value = video.videoHeight;
			fps.value = 30;
			videoInfo.value = {
				...videoInfo.value,
				width: video.videoWidth,
				height: video.videoHeight
			};
			video.addEventListener("keydown", onVideoKeyDown);
			setStatus("视频就绪 · " + video.videoWidth + "×" + video.videoHeight + " · 时长 " + formatTime(video.duration));
			await nextTick();
			resizeOverlayCanvas();
			showToast("视频加载成功", "success");
		};
		const onVideoKeyDown = (e) => {
			if (e.code === "Space" || e.code === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				onKeydown(e);
			}
		};
		const resizeOverlayCanvas = () => {
			const video = videoEl.value;
			const canvas = overlayCanvas.value;
			if (!video || !canvas) return;
			const rect = video.getBoundingClientRect();
			const contentH = Math.max(0, rect.height - 44);
			canvas.width = Math.round(rect.width);
			canvas.height = Math.round(contentH);
			canvas.style.width = rect.width + "px";
			canvas.style.height = contentH + "px";
			drawOverlay();
		};
		/**
		* 计算 video 元素内，视频画面实际渲染的区域（排除黑边）
		* 返回相对于 video 元素左上角的坐标（像素）
		*/
		const getVideoRenderRect = () => {
			const video = videoEl.value;
			if (!video) return null;
			const containerW = video.clientWidth;
			const containerH = video.clientHeight;
			const videoRatio = video.videoWidth / video.videoHeight;
			const containerRatio = containerW / containerH;
			let renderW, renderH, offsetX, offsetY;
			if (videoRatio > containerRatio) {
				renderW = containerW;
				renderH = containerW / videoRatio;
				offsetX = 0;
				offsetY = (containerH - renderH) / 2;
			} else {
				renderH = containerH;
				renderW = containerH * videoRatio;
				offsetX = (containerW - renderW) / 2;
				offsetY = 0;
			}
			return {
				offsetX,
				offsetY,
				renderW,
				renderH
			};
		};
		const drawOverlay = () => {
			const canvas = overlayCanvas.value;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const renderRect = getVideoRenderRect();
			if (!renderRect) return;
			const topY = Math.round(renderRect.offsetY + topCutRatio.value * renderRect.renderH);
			const bottomY = Math.round(renderRect.offsetY + bottomCutRatio.value * renderRect.renderH);
			ctx.fillStyle = "rgba(251, 146, 60, 0.08)";
			ctx.fillRect(0, 0, canvas.width, topY);
			ctx.fillStyle = "rgba(251, 146, 60, 0.6)";
			ctx.font = "bold 11px system-ui";
			ctx.fillText("封面帧区域", 8, Math.max(16, topY / 2));
			ctx.fillStyle = "rgba(0, 224, 158, 0.08)";
			ctx.fillRect(0, topY, canvas.width, bottomY - topY);
			ctx.save();
			ctx.strokeStyle = "#ef4444";
			ctx.lineWidth = 2;
			ctx.setLineDash([12, 8]);
			ctx.beginPath();
			ctx.moveTo(0, topY);
			ctx.lineTo(canvas.width, topY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = "#ef4444";
			ctx.font = "bold 12px system-ui";
			ctx.fillText("▲ 上边界 " + Math.round(topCutRatio.value * 100) + "%", 8, topY - 6);
			ctx.restore();
			ctx.save();
			ctx.strokeStyle = "#3b82f6";
			ctx.lineWidth = 2;
			ctx.setLineDash([12, 8]);
			ctx.beginPath();
			ctx.moveTo(0, bottomY);
			ctx.lineTo(canvas.width, bottomY);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = "#3b82f6";
			ctx.font = "bold 12px system-ui";
			ctx.fillText("▼ 下边界 " + Math.round(bottomCutRatio.value * 100) + "%", 8, bottomY + 18);
			ctx.restore();
		};
		watch([topCutRatio, bottomCutRatio], () => {
			drawOverlay();
		});
		const toggleCoverOptions = () => {
			showCoverOptions.value = !showCoverOptions.value;
		};
		const setCoverFrameFromVideo = () => {
			const video = videoEl.value;
			if (!video) return;
			coverTimeSec.value = video.currentTime;
			customCoverImage.value = null;
			showCoverOptions.value = false;
			showToast("封面帧已设为 " + formatTime(video.currentTime), "success");
		};
		const onCoverFileChange = (e) => {
			const file = e.target.files[0];
			if (file) {
				const img = new Image();
				img.onload = () => {
					customCoverImage.value = img;
					coverTimeSec.value = null;
					showCoverOptions.value = false;
					showToast("自定义封面已设置", "success");
				};
				img.src = URL.createObjectURL(file);
			}
			e.target.value = "";
		};
		const clearCoverFrame = () => {
			coverTimeSec.value = null;
			customCoverImage.value = null;
			showCoverOptions.value = false;
		};
		const markCurrentTime = () => {
			const video = videoEl.value;
			if (!video) return;
			const timeSec = video.currentTime;
			const frameIdx = Math.round(timeSec * fps.value);
			timePoints.value.push({
				timeSec,
				frameIdx
			});
			setStatus("已标记 " + timePoints.value.length + " 个时间点");
		};
		const clearMarks = () => {
			timePoints.value = [];
		};
		const removeTimePoint = (timePoint) => {
			const index = timePoints.value.indexOf(timePoint);
			if (index !== -1) {
				timePoints.value.splice(index, 1);
				setStatus("已删除 " + timePoint.timeSec + " 的时间点");
			}
		};
		const goToTime = (timeSec) => {
			const video = videoEl.value;
			if (!video) return;
			video.currentTime = timeSec;
		};
		const onKeydown = (e) => {
			const tag = document.activeElement ? document.activeElement.tagName : "";
			if (tag === "TEXTAREA") return;
			if (tag === "INPUT") return;
			if (!videoUrl.value) return;
			const video = videoEl.value;
			if (!video) return;
			if (e.code === "Space") {
				e.preventDefault();
				e.stopPropagation();
				if (video.paused) video.play();
				else video.pause();
			}
			if (e.code === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				markCurrentTime();
			}
		};
		const captureFrame = (video, timeSec, cropArea) => {
			return new Promise((resolve, reject) => {
				var timeout = setTimeout(function() {
					video.removeEventListener("seeked", onSeeked);
					reject(/* @__PURE__ */ new Error("Seek 超时 @ " + formatTime(timeSec)));
				}, 8e3);
				function onSeeked() {
					clearTimeout(timeout);
					video.removeEventListener("seeked", onSeeked);
					try {
						var w = cropArea.x2 - cropArea.x1;
						var h = cropArea.y2 - cropArea.y1;
						if (w <= 0 || h <= 0) throw new Error(`无效的裁剪区域: ${w}x${h}`);
						if (cropArea.x1 < 0 || cropArea.y1 < 0 || cropArea.x2 > video.videoWidth || cropArea.y2 > video.videoHeight) throw new Error("裁剪区域超出视频边界");
						var c = document.createElement("canvas");
						c.width = w;
						c.height = h;
						console.log(`捕获帧 @ ${formatTime(timeSec)}，裁剪区域: (${cropArea.x1}, ${cropArea.y1}) - (${cropArea.x2}, ${cropArea.y2})`);
						c.getContext("2d").drawImage(video, cropArea.x1, cropArea.y1, w, h, 0, 0, w, h);
						resolve(c);
					} catch (err) {
						reject(err);
					}
				}
				video.addEventListener("seeked", onSeeked);
				video.currentTime = timeSec;
			});
		};
		const extractAndStitch = async () => {
			const video = videoEl.value;
			if (!video || !videoUrl.value) return;
			if (topCutRatio.value >= bottomCutRatio.value) {
				showToast("红线必须在蓝线上方", "error");
				setStatus("红线必须在蓝线上方", "error");
				return;
			}
			const maxFrames = 200;
			const estimatedFrames = timePoints.value.length > 0 ? timePoints.value.length : Math.ceil(video.duration);
			if (estimatedFrames > maxFrames) {
				showToast(`帧数过多（${estimatedFrames} 帧），建议减少到 ${maxFrames} 帧以内`, "warning");
				setStatus(`警告：预计提取 ${estimatedFrames} 帧，可能影响性能`, "warning");
			}
			isExtracting.value = true;
			resultCanvas.value = null;
			setStatus("提取中...", "processing");
			try {
				const rect = video.getBoundingClientRect();
				const controlBarH = 44;
				const visualVideoH = rect.height;
				const effectiveVisualH = visualVideoH - controlBarH;
				if (effectiveVisualH <= 0 || visualVideoH <= 0) throw new Error("视频显示尺寸异常，无法计算裁剪区域");
				effectiveVisualH / visualVideoH * videoNativeH.value;
				if (!getVideoRenderRect()) throw new Error("无法计算视频渲染区域");
				const nativeTopY = Math.round(topCutRatio.value * videoNativeH.value);
				const nativeBottomY = Math.round(bottomCutRatio.value * videoNativeH.value);
				var subtitlePoints = [];
				if (timePoints.value.length > 0) subtitlePoints = timePoints.value.map(function(p) {
					return p.timeSec;
				});
				else {
					var duration = video.duration;
					if (!duration || !isFinite(duration)) throw new Error("无法获取视频时长");
					for (var t = 0; t <= duration; t += 1) subtitlePoints.push(Math.min(t, duration - .001));
				}
				var coverTime;
				if (coverTimeSec.value !== null) coverTime = coverTimeSec.value;
				else coverTime = subtitlePoints.length > 0 ? subtitlePoints[0] : 0;
				var coverCrop = {
					x1: 0,
					y1: 0,
					x2: videoNativeW.value,
					y2: Math.round(nativeTopY)
				};
				var subCrop = {
					x1: 0,
					y1: Math.round(nativeTopY),
					x2: videoNativeW.value,
					y2: Math.round(nativeBottomY)
				};
				var allFrames = [];
				if (customCoverImage.value) {
					setStatus("处理自定义封面...", "processing");
					const canvas = document.createElement("canvas");
					canvas.width = videoNativeW.value;
					canvas.height = Math.round(nativeTopY);
					const ctx = canvas.getContext("2d");
					const scale = videoNativeW.value / customCoverImage.value.width;
					const scaledHeight = customCoverImage.value.height * scale;
					ctx.drawImage(customCoverImage.value, 0, 0, videoNativeW.value, Math.min(scaledHeight, canvas.height));
					allFrames.push(canvas);
				} else if (coverCrop.y2 > coverCrop.y1) {
					setStatus("提取封面帧...", "processing");
					var coverFrame = await captureFrame(video, coverTime, coverCrop);
					allFrames.push(coverFrame);
				}
				var subtitleFrames = [];
				for (var i = 0; i < subtitlePoints.length; i++) {
					setStatus("提取字幕帧 " + (i + 1) + " / " + subtitlePoints.length, "processing");
					var frame = await captureFrame(video, subtitlePoints[i], subCrop);
					subtitleFrames.push(frame);
				}
				if (subtitleFrames.length === 0) throw new Error("没有成功提取到任何字幕帧");
				allFrames.push.apply(allFrames, subtitleFrames);
				setStatus("拼接中...", "processing");
				var maxW = 0;
				for (var j = 0; j < allFrames.length; j++) if (allFrames[j].width > maxW) maxW = allFrames[j].width;
				var totalH = 0;
				for (var k = 0; k < allFrames.length; k++) totalH += allFrames[k].height;
				var result = document.createElement("canvas");
				result.width = maxW;
				result.height = totalH;
				var ctx = result.getContext("2d");
				var y = 0;
				for (var m = 0; m < allFrames.length; m++) {
					var offsetX = Math.floor((maxW - allFrames[m].width) / 2);
					ctx.drawImage(allFrames[m], offsetX, y);
					y += allFrames[m].height;
				}
				resultCanvas.value = result;
				resultWidth.value = result.width;
				resultHeight.value = result.height;
				extractedCount.value = subtitleFrames.length;
				await nextTick();
				if (resultCanvasEl.value) {
					resultCanvasEl.value.width = result.width;
					resultCanvasEl.value.height = result.height;
					resultCanvasEl.value.getContext("2d").drawImage(result, 0, 0);
					resultCanvasEl.value.scrollIntoView({
						behavior: "smooth",
						block: "nearest"
					});
				}
				var coverCount = allFrames.length - subtitleFrames.length;
				setStatus("完成！" + (coverCount > 0 ? "封面帧 " + coverCount + " 张 + " : "") + "字幕帧 " + subtitleFrames.length + " 张 · " + result.width + "×" + result.height + " px", "success");
				showToast("提取完成，共 " + allFrames.length + " 帧", "success");
			} catch (err) {
				console.error("提取失败:", err);
				setStatus("提取失败：" + err.message, "error");
				showToast("提取失败：" + err.message, "error");
			} finally {
				isExtracting.value = false;
			}
		};
		const saveResult = () => {
			if (!resultCanvas.value) return;
			var mime = {
				png: "image/png",
				jpeg: "image/jpeg",
				webp: "image/webp"
			}[format.value] || "image/png";
			var ext = {
				png: "png",
				jpeg: "jpg",
				webp: "webp"
			}[format.value] || "png";
			var quality = format.value === "png" ? void 0 : compression.value;
			resultCanvas.value.toBlob(function(blob) {
				if (!blob) {
					showToast("保存失败", "error");
					return;
				}
				var url = URL.createObjectURL(blob);
				var a = document.createElement("a");
				a.href = url;
				a.download = "subtitles_" + Date.now() + "." + ext;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				showToast("已保存 " + format.value.toUpperCase() + "，" + (blob.size / 1024).toFixed(0) + " KB", "success");
			}, mime, quality);
		};
		var resizeObserver = null;
		watch(videoEl, function(el) {
			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}
			if (!el) return;
			resizeObserver = new ResizeObserver(function() {
				resizeOverlayCanvas();
			});
			resizeObserver.observe(el);
		});
		onMounted(function() {
			document.addEventListener("keydown", onKeydown);
		});
		onUnmounted(function() {
			document.removeEventListener("keydown", onKeydown);
			if (videoUrl.value) URL.revokeObjectURL(videoUrl.value);
			if (resizeObserver) resizeObserver.disconnect();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$4, [
				createBaseVNode("div", _hoisted_2$4, [
					createBaseVNode("div", {
						class: normalizeClass(["upload-zone", {
							"drag-over": isDragOver.value,
							"has-video": videoUrl.value
						}]),
						onClick: _cache[0] || (_cache[0] = ($event) => fileInput.value.click()),
						onDragover: _cache[1] || (_cache[1] = withModifiers(($event) => isDragOver.value = true, ["prevent"])),
						onDragleave: _cache[2] || (_cache[2] = withModifiers(($event) => isDragOver.value = false, ["prevent"])),
						onDrop: withModifiers(onDrop, ["prevent"])
					}, [
						_cache[8] || (_cache[8] = createBaseVNode("i", { class: "fa-solid fa-film upload-icon" }, null, -1)),
						createBaseVNode("p", _hoisted_3$4, toDisplayString(videoUrl.value ? "点击或拖拽新视频到此处" : "点击或拖拽视频到此处"), 1),
						_cache[9] || (_cache[9] = createBaseVNode("p", { class: "upload-hint" }, "支持 MP4 / WebM / MOV 等浏览器可播放格式", -1)),
						createBaseVNode("input", {
							ref_key: "fileInput",
							ref: fileInput,
							type: "file",
							accept: "video/*",
							class: "hidden-input",
							onChange: onFileChange
						}, null, 544)
					], 34),
					videoUrl.value ? (openBlock(), createElementBlock("div", {
						key: 0,
						class: "video-wrapper",
						ref_key: "videoWrapper",
						ref: videoWrapper
					}, [
						createBaseVNode("button", {
							class: "video-close-btn",
							onClick: withModifiers(removeVideo, ["stop"]),
							title: "移除当前视频"
						}, [..._cache[10] || (_cache[10] = [createBaseVNode("i", { class: "fa-solid fa-xmark" }, null, -1)])]),
						createBaseVNode("video", {
							ref_key: "videoEl",
							ref: videoEl,
							src: videoUrl.value,
							controls: "",
							class: "video-player",
							onLoadedmetadata: onVideoLoaded,
							onError: onVideoError
						}, null, 40, _hoisted_4$3),
						createBaseVNode("canvas", {
							ref_key: "overlayCanvas",
							ref: overlayCanvas,
							class: "overlay-canvas"
						}, null, 512)
					], 512)) : createCommentVNode("", true),
					videoInfo.value ? (openBlock(), createElementBlock("div", _hoisted_5$3, [
						createBaseVNode("span", null, [_cache[11] || (_cache[11] = createBaseVNode("i", { class: "fa-solid fa-file-video" }, null, -1)), createTextVNode(" " + toDisplayString(videoInfo.value.name), 1)]),
						createBaseVNode("span", null, [_cache[12] || (_cache[12] = createBaseVNode("i", { class: "fa-solid fa-expand" }, null, -1)), createTextVNode(" " + toDisplayString(videoInfo.value.width) + " × " + toDisplayString(videoInfo.value.height), 1)]),
						createBaseVNode("span", null, [_cache[13] || (_cache[13] = createBaseVNode("i", { class: "fa-solid fa-weight-hanging" }, null, -1)), createTextVNode(" " + toDisplayString(videoInfo.value.size), 1)])
					])) : createCommentVNode("", true),
					videoUrl.value ? (openBlock(), createElementBlock("div", _hoisted_6$3, [createBaseVNode("div", _hoisted_7$3, [createBaseVNode("button", {
						class: normalizeClass(["btn cover-btn", { "cover-active": coverTimeSec.value !== null || customCoverImage.value !== null }]),
						onClick: toggleCoverOptions,
						onMouseenter: _cache[3] || (_cache[3] = ($event) => showCoverTip.value = true),
						onMouseleave: _cache[4] || (_cache[4] = ($event) => showCoverTip.value = false),
						title: "设置封面"
					}, [
						_cache[14] || (_cache[14] = createBaseVNode("i", { class: "fa-solid fa-image" }, null, -1)),
						createTextVNode(" " + toDisplayString(customCoverImage.value ? "本地封面" : coverTimeSec.value !== null ? "当前封面" : "封面设置") + " ", 1),
						_cache[15] || (_cache[15] = createBaseVNode("i", { class: "fa-solid fa-circle-question cover-tip-icon" }, null, -1))
					], 34), showCoverOptions.value ? (openBlock(), createElementBlock("div", _hoisted_8$3, [
						createBaseVNode("button", {
							class: "btn",
							onClick: setCoverFrameFromVideo
						}, "当前封面"),
						createBaseVNode("button", {
							class: "btn",
							onClick: _cache[5] || (_cache[5] = ($event) => coverFileInput.value.click())
						}, "本地封面"),
						createBaseVNode("button", {
							class: "btn",
							onClick: clearCoverFrame,
							title: "清除封面帧设置"
						}, [..._cache[16] || (_cache[16] = [createBaseVNode("i", { class: "fa-solid fa-rotate-left" }, null, -1), createTextVNode(" 自动封面 ", -1)])]),
						createBaseVNode("input", {
							ref_key: "coverFileInput",
							ref: coverFileInput,
							type: "file",
							accept: "image/*",
							onChange: onCoverFileChange,
							class: "hidden-input"
						}, null, 544)
					])) : createCommentVNode("", true)]), createBaseVNode("button", {
						class: "btn",
						disabled: !videoUrl.value,
						onClick: markCurrentTime,
						style: { "margin-left": "auto" }
					}, [..._cache[17] || (_cache[17] = [createBaseVNode("i", { class: "fa-solid fa-circle-dot" }, null, -1), createTextVNode(" 标记当前帧 ", -1)])], 8, _hoisted_9$3)])) : createCommentVNode("", true)
				]),
				createBaseVNode("div", _hoisted_10$3, [createBaseVNode("div", _hoisted_11$3, [
					_cache[24] || (_cache[24] = createBaseVNode("div", { class: "panel-title" }, [
						createBaseVNode("i", { class: "fa-solid fa-sliders" }),
						createTextVNode(" 拼接设置 "),
						createBaseVNode("span", { class: "panel-hint" }, "输入框支持滚轮和键盘上下键调整")
					], -1)),
					createBaseVNode("div", _hoisted_12$3, [_cache[18] || (_cache[18] = createBaseVNode("label", { class: "form-label" }, [createBaseVNode("span", { class: "line-dot line-dot-red" }), createTextVNode(" 红线位置（字幕上边界） ")], -1)), createVNode(SliderInput_default, {
						"model-value": Math.round(topCutRatio.value * 100),
						label: "",
						unit: "%",
						min: 0,
						max: 100,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = (val) => topCutRatio.value = val / 100),
						step: "1"
					}, null, 8, ["model-value"])]),
					createBaseVNode("div", _hoisted_13$3, [_cache[19] || (_cache[19] = createBaseVNode("label", { class: "form-label" }, [createBaseVNode("span", { class: "line-dot line-dot-blue" }), createTextVNode(" 蓝线位置（字幕下边界） ")], -1)), createVNode(SliderInput_default, {
						"model-value": Math.round(bottomCutRatio.value * 100),
						label: "",
						unit: "%",
						min: 2,
						max: 100,
						"onUpdate:modelValue": _cache[7] || (_cache[7] = (val) => bottomCutRatio.value = val / 100),
						step: "1"
					}, null, 8, ["model-value"])]),
					createBaseVNode("div", _hoisted_14$3, [_cache[20] || (_cache[20] = createBaseVNode("label", { class: "form-label" }, "输出格式", -1)), createBaseVNode("div", _hoisted_15$3, [(openBlock(), createElementBlock(Fragment, null, renderList([
						"png",
						"jpeg",
						"webp"
					], (fmt) => {
						return createBaseVNode("button", {
							key: fmt,
							class: normalizeClass(["seg-btn", { active: format.value === fmt }]),
							onClick: ($event) => format.value = fmt
						}, toDisplayString(fmt.toUpperCase()), 11, _hoisted_16$3);
					}), 64))])]),
					createBaseVNode("div", _hoisted_17$3, [createBaseVNode("label", _hoisted_18$3, [_cache[21] || (_cache[21] = createBaseVNode("label", {
						class: "form-label",
						style: { "display": "inline-block" }
					}, "图片压缩", -1)), format.value === "png" ? (openBlock(), createElementBlock("span", _hoisted_19$3, "（PNG 无损，此项无效）")) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_20$3, [(openBlock(), createElementBlock(Fragment, null, renderList(compressionOptions, (opt) => {
						return createBaseVNode("button", {
							key: opt.value,
							class: normalizeClass(["seg-btn", { active: compression.value === opt.value }]),
							disabled: format.value === "png",
							onClick: ($event) => compression.value = opt.value
						}, toDisplayString(opt.label), 11, _hoisted_21$3);
					}), 64))])]),
					_cache[25] || (_cache[25] = createBaseVNode("div", { class: "panel-title" }, [
						createBaseVNode("i", { class: "fa-solid fa-clock" }),
						createTextVNode(" 时间标记 "),
						createBaseVNode("span", { class: "panel-hint" }, "Enter 添加帧 · Space 播放/暂停")
					], -1)),
					createBaseVNode("div", _hoisted_22$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(timePoints.value, (time, index) => {
						return openBlock(), createElementBlock("div", {
							class: "time-item",
							key: index,
							onClick: ($event) => goToTime(time.timeSec)
						}, [createBaseVNode("span", _hoisted_24$3, toDisplayString(formatTime(time.timeSec)), 1), createBaseVNode("button", {
							class: "time-item-btn",
							onClick: ($event) => removeTimePoint(time)
						}, [..._cache[22] || (_cache[22] = [createBaseVNode("i", { class: "fa-solid fa-xmark" }, null, -1)])], 8, _hoisted_25$3)], 8, _hoisted_23$3);
					}), 128))]),
					createBaseVNode("div", _hoisted_26$3, [createBaseVNode("button", {
						class: "btn btn-danger",
						disabled: timePoints.value.length === 0,
						onClick: clearMarks
					}, [..._cache[23] || (_cache[23] = [createBaseVNode("i", { class: "fa-solid fa-trash" }, null, -1), createTextVNode(" 清空标记 ", -1)])], 8, _hoisted_27$3), createBaseVNode("button", {
						class: "btn btn-primary btn-block",
						disabled: !videoUrl.value || isExtracting.value,
						onClick: extractAndStitch
					}, [createBaseVNode("i", { class: normalizeClass(["fa-solid", isExtracting.value ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"]) }, null, 2), createTextVNode(" " + toDisplayString(isExtracting.value ? statusMsg.value : "智能提取并拼接"), 1)], 8, _hoisted_28$3)])
				])]),
				resultCanvas.value ? (openBlock(), createElementBlock("div", _hoisted_29$3, [createBaseVNode("div", _hoisted_30$3, [
					createBaseVNode("div", _hoisted_31$3, [_cache[26] || (_cache[26] = createBaseVNode("i", {
						class: "fa-solid fa-check-circle",
						style: { "color": "var(--accent)" }
					}, null, -1)), createTextVNode(" 提取完成 · " + toDisplayString(resultWidth.value) + " × " + toDisplayString(resultHeight.value) + " px · 共 " + toDisplayString(extractedCount.value) + " 帧 ", 1)]),
					createBaseVNode("div", _hoisted_32$3, [createBaseVNode("canvas", {
						ref_key: "resultCanvasEl",
						ref: resultCanvasEl,
						class: "result-canvas"
					}, null, 512)]),
					createBaseVNode("div", _hoisted_33$3, [createBaseVNode("button", {
						class: "btn btn-primary",
						onClick: saveResult
					}, [_cache[27] || (_cache[27] = createBaseVNode("i", { class: "fa-solid fa-download" }, null, -1)), createTextVNode(" 保存 " + toDisplayString(format.value.toUpperCase()), 1)])])
				])])) : createCommentVNode("", true)
			]);
		};
	}
}, [["__scopeId", "data-v-bb1f3351"]]);
//#endregion
//#region src/views/ImageSubtitle.vue
var _hoisted_1$3 = { class: "app-layout" };
var _hoisted_2$3 = { class: "app-left" };
var _hoisted_3$3 = { class: "upload-text" };
var _hoisted_4$2 = {
	key: 0,
	class: "upload-hint"
};
var _hoisted_5$2 = { class: "canvas-container" };
var _hoisted_6$2 = {
	key: 0,
	class: "nav-bar"
};
var _hoisted_7$2 = { class: "nav-info" };
var _hoisted_8$2 = { class: "cover-btn-container" };
var _hoisted_9$2 = ["disabled"];
var _hoisted_10$2 = {
	key: 0,
	class: "cover-options"
};
var _hoisted_11$2 = ["disabled"];
var _hoisted_12$2 = ["disabled"];
var _hoisted_13$2 = ["disabled"];
var _hoisted_14$2 = ["disabled"];
var _hoisted_15$2 = ["disabled"];
var _hoisted_16$2 = {
	key: 1,
	class: "info-bar"
};
var _hoisted_17$2 = { class: "nav-filename" };
var _hoisted_18$2 = { class: "app-middle" };
var _hoisted_19$2 = { class: "settings-panel" };
var _hoisted_20$2 = { class: "setting-item" };
var _hoisted_21$2 = { class: "setting-item" };
var _hoisted_22$2 = { class: "setting-item" };
var _hoisted_23$2 = { class: "seg-control" };
var _hoisted_24$2 = ["onClick"];
var _hoisted_25$2 = { class: "setting-item" };
var _hoisted_26$2 = { class: "form-label" };
var _hoisted_27$2 = {
	key: 0,
	class: "form-hint"
};
var _hoisted_28$2 = { class: "seg-control" };
var _hoisted_29$2 = ["disabled", "onClick"];
var _hoisted_30$2 = { class: "action-row" };
var _hoisted_31$2 = ["disabled"];
var _hoisted_32$2 = {
	key: 0,
	class: "app-right result-section"
};
var _hoisted_33$2 = { class: "result-header" };
var _hoisted_34$2 = { class: "result-canvas-container" };
var _hoisted_35$2 = { class: "result-actions" };
var ImageSubtitle_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "ImageSubtitle",
	setup(__props) {
		const { showToast } = useToast();
		const fileInput = /* @__PURE__ */ ref(null);
		const canvas = /* @__PURE__ */ ref(null);
		const resultCanvasEl = /* @__PURE__ */ ref(null);
		const images = /* @__PURE__ */ ref([]);
		const currentIndex = /* @__PURE__ */ ref(0);
		const coverMode = /* @__PURE__ */ ref("auto");
		const coverImageIndex = /* @__PURE__ */ ref(null);
		const showCoverOptions = /* @__PURE__ */ ref(false);
		const customCoverImage = /* @__PURE__ */ ref(null);
		const coverFileInput = /* @__PURE__ */ ref(null);
		const isDragOver = /* @__PURE__ */ ref(false);
		const topCutRatio = /* @__PURE__ */ ref(.75);
		const bottomCutRatio = /* @__PURE__ */ ref(.92);
		const dragging = /* @__PURE__ */ ref(null);
		const spacing = /* @__PURE__ */ ref(0);
		const format = /* @__PURE__ */ ref("png");
		const compressionOptions = [
			{
				label: "不压缩",
				value: 1
			},
			{
				label: "2x 压缩",
				value: .5
			},
			{
				label: "4x 压缩",
				value: .25
			},
			{
				label: "8x 压缩",
				value: .125
			}
		];
		const compression = /* @__PURE__ */ ref(1);
		const resultCanvas = /* @__PURE__ */ ref(null);
		const resultWidth = /* @__PURE__ */ ref(0);
		const resultHeight = /* @__PURE__ */ ref(0);
		const isGenerating = /* @__PURE__ */ ref(false);
		const statusMsg = /* @__PURE__ */ ref("");
		const statusType = /* @__PURE__ */ ref("");
		const setStatus = (msg, type = "") => {
			statusMsg.value = msg;
			statusType.value = type;
		};
		const formatBytes = (bytes) => {
			if (!bytes) return "-";
			if (bytes < 1024) return bytes + " B";
			if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
			return (bytes / 1048576).toFixed(1) + " MB";
		};
		const onDrop = (e) => {
			isDragOver.value = false;
			const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
			if (files.length > 0) addFiles(files);
		};
		const onFileChange = async (e) => {
			const files = Array.from(e.target.files);
			if (files.length > 0) await addFiles(files);
			e.target.value = "";
		};
		const addFiles = async (files) => {
			const newItems = await Promise.all(files.map((file) => new Promise((resolve) => {
				const url = URL.createObjectURL(file);
				const img = new Image();
				img.onload = () => resolve({
					id: Date.now() + Math.random(),
					name: file.name,
					size: file.size,
					width: img.naturalWidth,
					height: img.naturalHeight,
					url,
					img
				});
				img.src = url;
			})));
			images.value.push(...newItems);
			if (images.value.length === newItems.length) currentIndex.value = 0;
			setStatus(`已加载 ${images.value.length} 张图片`, "success");
			showToast(`已添加 ${newItems.length} 张图片`, "success");
			await nextTick();
			drawCanvas();
		};
		const clearAll = () => {
			images.value.forEach((item) => URL.revokeObjectURL(item.url));
			images.value = [];
			currentIndex.value = 0;
			resultCanvas.value = null;
			clearCoverFrame();
			setStatus("已清空所有图片");
			clearCanvas();
		};
		const goPrev = () => {
			if (images.value.length === 0) return;
			currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length;
		};
		const goNext = () => {
			if (images.value.length === 0) return;
			currentIndex.value = (currentIndex.value + 1) % images.value.length;
		};
		const toggleCoverOptions = () => {
			showCoverOptions.value = !showCoverOptions.value;
		};
		const setCoverFromCurrentImage = () => {
			if (images.value.length === 0) return;
			coverMode.value = "current";
			coverImageIndex.value = currentIndex.value;
			customCoverImage.value = null;
			showCoverOptions.value = false;
			showToast("已将当前图片设为封面", "success");
		};
		const onCoverFileChange = (e) => {
			const file = e.target.files[0];
			if (!file) return;
			const img = new Image();
			img.onload = () => {
				customCoverImage.value = img;
				coverMode.value = "custom";
				coverImageIndex.value = null;
				showCoverOptions.value = false;
				showToast("自定义封面已设置", "success");
			};
			img.src = URL.createObjectURL(file);
			e.target.value = "";
		};
		const clearCoverFrame = () => {
			coverMode.value = "auto";
			coverImageIndex.value = null;
			customCoverImage.value = null;
			showCoverOptions.value = false;
			showToast("已恢复自动封面", "success");
		};
		const deleteCurrentImage = () => {
			const index = currentIndex.value;
			images.value.splice(index, 1);
			if (coverMode.value === "current" && coverImageIndex.value !== null) {
				if (coverImageIndex.value === index) clearCoverFrame();
				else if (coverImageIndex.value > index) coverImageIndex.value--;
			}
			if (images.value.length === 0) currentIndex.value = 0;
			else if (index >= images.value.length) currentIndex.value = images.value.length - 1;
			setStatus(`已删除第 ${index + 1} 张图片`);
			showToast(`已删除第 ${index + 1} 张图片`, "success");
		};
		const clearImages = () => {
			clearAll();
			if (images.value.length > 0) showToast("已清空所有图片", "success");
		};
		/**
		* 核心绘制函数：把当前图片 + 两条裁剪线画到 Canvas 上
		* 每次切换图片、移动裁剪线、修改设置都会调用
		*/
		const drawCanvas = () => {
			const cvs = canvas.value;
			if (!cvs || images.value.length === 0) return;
			const item = images.value[currentIndex.value];
			if (!item) return;
			const img = item.img;
			const displayW = img.naturalWidth;
			const displayH = img.naturalHeight;
			cvs.width = displayW;
			cvs.height = displayH;
			const ctx = cvs.getContext("2d");
			ctx.drawImage(img, 0, 0, displayW, displayH);
			const topY = Math.round(topCutRatio.value * displayH);
			const bottomY = Math.round(bottomCutRatio.value * displayH);
			ctx.fillStyle = "rgba(0,0,0,0.35)";
			ctx.fillRect(0, 0, displayW, topY);
			ctx.save();
			ctx.strokeStyle = "#ef4444";
			ctx.lineWidth = Math.max(2, displayH * .003);
			ctx.setLineDash([12, 8]);
			ctx.beginPath();
			ctx.moveTo(0, topY);
			ctx.lineTo(displayW, topY);
			ctx.stroke();
			ctx.fillStyle = "#ef4444";
			ctx.font = `bold ${Math.max(12, displayH * .018)}px system-ui`;
			ctx.fillText("▲ 上边界" + Math.round(topCutRatio.value * 100) + "%", 8, topY - 6);
			ctx.restore();
			ctx.save();
			ctx.strokeStyle = "#3b82f6";
			ctx.lineWidth = Math.max(2, displayH * .003);
			ctx.setLineDash([12, 8]);
			ctx.beginPath();
			ctx.moveTo(0, bottomY);
			ctx.lineTo(displayW, bottomY);
			ctx.stroke();
			ctx.fillStyle = "#3b82f6";
			ctx.font = `bold ${Math.max(12, displayH * .018)}px system-ui`;
			ctx.fillText("▼ 下边界" + Math.round(bottomCutRatio.value * 100) + "%", 8, bottomY + Math.max(16, displayH * .022));
			ctx.restore();
		};
		/** 清空 Canvas */
		const clearCanvas = () => {
			const cvs = canvas.value;
			if (!cvs) return;
			cvs.getContext("2d").clearRect(0, 0, cvs.width, cvs.height);
			cvs.width = 0;
			cvs.height = 0;
		};
		/**
		* 把鼠标/触摸事件的客户端坐标转为 Canvas 内的比例值
		* 因为 Canvas 的 CSS 显示尺寸可能和 width/height 属性不同
		* 必须用 getBoundingClientRect 换算
		*/
		const getCanvasRatio = (clientY) => {
			const rect = canvas.value.getBoundingClientRect();
			return (clientY - rect.top) / rect.height;
		};
		/**
		* 鼠标按下：判断点击的是哪条线
		* 判断规则：点击位置到某条线的距离 < 阈值（5%）
		*/
		const onMouseDown = (e) => {
			if (images.value.length === 0) return;
			const ratio = getCanvasRatio(e.clientY);
			if (Math.abs(ratio - topCutRatio.value) < .05) dragging.value = "top";
			else if (Math.abs(ratio - bottomCutRatio.value) < .05) dragging.value = "bottom";
		};
		/**
		* 鼠标移动：更新被拖拽的线的位置
		*/
		const onMouseMove = (e) => {
			if (!dragging.value || images.value.length === 0) return;
			const ratio = Math.min(.98, Math.max(.02, getCanvasRatio(e.clientY)));
			if (dragging.value === "top") {
				if (ratio < bottomCutRatio.value - .02) topCutRatio.value = ratio;
			} else if (ratio > topCutRatio.value + .02) bottomCutRatio.value = ratio;
		};
		/** 鼠标释放：停止拖拽 */
		const onMouseUp = () => {
			dragging.value = null;
		};
		const onTouchStart = (e) => {
			if (e.touches.length === 1) onMouseDown({ clientY: e.touches[0].clientY });
		};
		const onTouchMove = (e) => {
			if (e.touches.length === 1) onMouseMove({ clientY: e.touches[0].clientY });
		};
		watch([
			currentIndex,
			topCutRatio,
			bottomCutRatio
		], () => {
			nextTick(drawCanvas);
		});
		watch(images, () => {
			nextTick(drawCanvas);
		}, { deep: true });
		/**
		* 从图片中裁剪指定区域，返回 Canvas
		*/
		const cropImage = (img, y, height) => {
			const cvs = document.createElement("canvas");
			cvs.width = img.naturalWidth;
			cvs.height = height;
			cvs.getContext("2d").drawImage(img, 0, y, img.naturalWidth, height, 0, 0, img.naturalWidth, height);
			return cvs;
		};
		/**
		* 垂直拼接多个 Canvas
		*/
		const stitchVertically = (canvases, gap, bgColor) => {
			const maxW = Math.max(...canvases.map((c) => c.width));
			const totalH = canvases.reduce((sum, c) => sum + c.height, 0) + gap * (canvases.length - 1);
			const result = document.createElement("canvas");
			result.width = maxW;
			result.height = totalH;
			const ctx = result.getContext("2d");
			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, maxW, totalH);
			let y = 0;
			canvases.forEach((c, i) => {
				const offsetX = Math.floor((maxW - c.width) / 2);
				ctx.drawImage(c, offsetX, y);
				y += c.height;
				if (i < canvases.length - 1) y += gap;
			});
			return result;
		};
		const generate = async () => {
			if (images.value.length === 0) return;
			isGenerating.value = true;
			setStatus("生成中...", "processing");
			try {
				const croppedList = [];
				if (coverMode.value === "custom" && customCoverImage.value) {
					setStatus("处理自定义封面...", "processing");
					const item = images.value[0];
					const canvas = document.createElement("canvas");
					canvas.width = item.width;
					canvas.height = Math.round(item.height * topCutRatio.value);
					const ctx = canvas.getContext("2d");
					const scale = item.width / customCoverImage.value.naturalWidth;
					const scaledHeight = customCoverImage.value.naturalHeight * scale;
					ctx.drawImage(customCoverImage.value, 0, 0, item.width, Math.min(scaledHeight, canvas.height));
					croppedList.push(canvas);
				} else if (coverMode.value === "current" && coverImageIndex.value !== null && images.value[coverImageIndex.value]) {
					const item = images.value[coverImageIndex.value];
					const cropH = Math.round(item.height * topCutRatio.value);
					if (cropH > 0) croppedList.push(cropImage(item.img, 0, cropH));
				}
				if (coverMode.value === "auto") for (let i = 0; i < images.value.length; i++) {
					const { img, height } = images.value[i];
					if (i === 0) {
						const cropH = Math.round(height * bottomCutRatio.value);
						croppedList.push(cropImage(img, 0, cropH));
					} else {
						const cropY = Math.round(height * topCutRatio.value);
						const cropH = Math.round(height * bottomCutRatio.value) - cropY;
						if (cropH <= 0) continue;
						croppedList.push(cropImage(img, cropY, cropH));
					}
				}
				else for (let i = 0; i < images.value.length; i++) {
					const { img, height } = images.value[i];
					const cropY = Math.round(height * topCutRatio.value);
					const cropH = Math.round(height * bottomCutRatio.value) - cropY;
					if (cropH <= 0) continue;
					croppedList.push(cropImage(img, cropY, cropH));
				}
				const result = stitchVertically(croppedList, spacing.value, "#ffffff");
				resultCanvas.value = result;
				resultWidth.value = result.width;
				resultHeight.value = result.height;
				await nextTick();
				if (resultCanvasEl.value) {
					resultCanvasEl.value.width = result.width;
					resultCanvasEl.value.height = result.height;
					resultCanvasEl.value.getContext("2d").drawImage(result, 0, 0);
					resultCanvasEl.value.scrollIntoView({
						behavior: "smooth",
						block: "nearest"
					});
				}
				setStatus(`拼接完成！${result.width} × ${result.height} px`, "success");
				showToast("拼接完成", "success");
			} catch (err) {
				console.error(err);
				setStatus("生成失败：" + err.message, "error");
				showToast("生成失败", "error");
			} finally {
				isGenerating.value = false;
			}
		};
		const saveResult = (fmt) => {
			if (!resultCanvas.value) return;
			let mimeType = "image/png";
			let fileExt = "png";
			if (fmt === "jpeg") {
				mimeType = "image/jpeg";
				fileExt = "jpg";
			} else if (fmt === "webp") {
				mimeType = "image/webp";
				fileExt = "webp";
			}
			let exportCanvas = resultCanvas.value;
			if (compression.value > 1) {
				const scale = 1 / compression.value;
				const compressedCanvas = document.createElement("canvas");
				compressedCanvas.width = Math.round(resultCanvas.value.width * scale);
				compressedCanvas.height = Math.round(resultCanvas.value.height * scale);
				compressedCanvas.getContext("2d").drawImage(resultCanvas.value, 0, 0, compressedCanvas.width, compressedCanvas.height);
				exportCanvas = compressedCanvas;
			}
			exportCanvas.toBlob((blob) => {
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `subtitles_${Date.now()}.${fileExt}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, mimeType, compression.value);
		};
		onUnmounted(() => {
			images.value.forEach((item) => URL.revokeObjectURL(item.url));
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$3, [
				createBaseVNode("div", _hoisted_2$3, [
					createBaseVNode("div", {
						class: normalizeClass(["upload-zone", {
							"drag-over": isDragOver.value,
							"has-images": images.value.length > 0
						}]),
						onClick: _cache[0] || (_cache[0] = ($event) => fileInput.value.click()),
						onDragover: _cache[1] || (_cache[1] = withModifiers(($event) => isDragOver.value = true, ["prevent"])),
						onDragleave: _cache[2] || (_cache[2] = withModifiers(($event) => isDragOver.value = false, ["prevent"])),
						onDrop: withModifiers(onDrop, ["prevent"])
					}, [
						_cache[7] || (_cache[7] = createBaseVNode("i", { class: "fa-solid fa-image upload-icon" }, null, -1)),
						createBaseVNode("p", _hoisted_3$3, toDisplayString(images.value.length > 0 ? "点击或拖拽新图片到此处" : "点击或拖拽图片到此处"), 1),
						images.value.length === 0 ? (openBlock(), createElementBlock("p", _hoisted_4$2, " 支持 JPG / PNG / WEBP 等常见格式 ")) : createCommentVNode("", true),
						createBaseVNode("input", {
							ref_key: "fileInput",
							ref: fileInput,
							type: "file",
							accept: "image/*",
							multiple: "",
							class: "hidden-input",
							onChange: onFileChange
						}, null, 544)
					], 34),
					createBaseVNode("div", _hoisted_5$2, [withDirectives(createBaseVNode("canvas", {
						ref_key: "canvas",
						ref: canvas,
						class: "preview-canvas",
						onMousedown: onMouseDown,
						onMousemove: onMouseMove,
						onMouseup: onMouseUp,
						onMouseleave: onMouseUp,
						onTouchstart: withModifiers(onTouchStart, ["prevent"]),
						onTouchmove: withModifiers(onTouchMove, ["prevent"]),
						onTouchend: onMouseUp
					}, null, 544), [[vShow, images.value.length > 0]])]),
					images.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_6$2, [
						createBaseVNode("button", {
							class: "btn",
							onClick: goPrev
						}, [..._cache[8] || (_cache[8] = [createBaseVNode("i", { class: "fa-solid fa-chevron-left" }, null, -1)])]),
						createBaseVNode("span", _hoisted_7$2, toDisplayString(currentIndex.value + 1) + " / " + toDisplayString(images.value.length), 1),
						createBaseVNode("button", {
							class: "btn",
							onClick: goNext
						}, [..._cache[9] || (_cache[9] = [createBaseVNode("i", { class: "fa-solid fa-chevron-right" }, null, -1)])]),
						createBaseVNode("div", _hoisted_8$2, [createBaseVNode("button", {
							class: normalizeClass(["btn cover-btn", { "cover-active": coverMode.value !== "auto" || customCoverImage.value !== null }]),
							onClick: toggleCoverOptions,
							disabled: images.value.length == 0,
							title: "设置封面"
						}, [_cache[10] || (_cache[10] = createBaseVNode("i", { class: "fa-solid fa-image" }, null, -1)), createTextVNode(" " + toDisplayString(customCoverImage.value ? "本地封面" : coverMode.value === "current" ? "当前封面" : "封面设置"), 1)], 10, _hoisted_9$2), showCoverOptions.value ? (openBlock(), createElementBlock("div", _hoisted_10$2, [
							createBaseVNode("button", {
								class: "btn",
								onClick: setCoverFromCurrentImage,
								disabled: images.value.length == 0
							}, "当前封面", 8, _hoisted_11$2),
							createBaseVNode("button", {
								class: "btn",
								onClick: _cache[3] || (_cache[3] = ($event) => coverFileInput.value.click()),
								disabled: images.value.length == 0
							}, "本地封面", 8, _hoisted_12$2),
							createBaseVNode("button", {
								class: "btn",
								onClick: clearCoverFrame,
								disabled: images.value.length == 0
							}, [..._cache[11] || (_cache[11] = [createBaseVNode("i", { class: "fa-solid fa-rotate-left" }, null, -1), createTextVNode(" 自动封面 ", -1)])], 8, _hoisted_13$2),
							createBaseVNode("input", {
								ref_key: "coverFileInput",
								ref: coverFileInput,
								type: "file",
								accept: "image/*",
								onChange: onCoverFileChange,
								class: "hidden-input"
							}, null, 544)
						])) : createCommentVNode("", true)]),
						createBaseVNode("button", {
							class: "btn btn-danger",
							onClick: deleteCurrentImage,
							disabled: images.value.length == 0
						}, [..._cache[12] || (_cache[12] = [createBaseVNode("i", { class: "fa-solid fa-trash" }, null, -1), createTextVNode(" 删除 ", -1)])], 8, _hoisted_14$2),
						createBaseVNode("button", {
							class: "btn btn-primary",
							onClick: clearImages,
							disabled: images.value.length == 0
						}, [..._cache[13] || (_cache[13] = [createBaseVNode("i", { class: "fa-solid fa-trash-alt" }, null, -1), createTextVNode(" 清空 ", -1)])], 8, _hoisted_15$2)
					])) : createCommentVNode("", true),
					images.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_16$2, [
						createBaseVNode("span", _hoisted_17$2, toDisplayString(images.value[currentIndex.value]?.name), 1),
						createBaseVNode("span", null, [_cache[14] || (_cache[14] = createBaseVNode("i", { class: "fa-solid fa-expand" }, null, -1)), createTextVNode(" " + toDisplayString(images.value[currentIndex.value]?.width) + " × " + toDisplayString(images.value[currentIndex.value]?.height), 1)]),
						createBaseVNode("span", null, [_cache[15] || (_cache[15] = createBaseVNode("i", { class: "fa-solid fa-weight-hanging" }, null, -1)), createTextVNode(" " + toDisplayString(formatBytes(images.value[currentIndex.value]?.size)), 1)])
					])) : createCommentVNode("", true)
				]),
				createBaseVNode("div", _hoisted_18$2, [createBaseVNode("div", _hoisted_19$2, [
					_cache[20] || (_cache[20] = createBaseVNode("div", { class: "panel-title" }, [
						createBaseVNode("i", { class: "fa-solid fa-sliders" }),
						createTextVNode(" 拼接设置 "),
						createBaseVNode("span", { class: "panel-hint" }, "输入框支持滚轮和键盘上下键调整")
					], -1)),
					createBaseVNode("div", _hoisted_20$2, [_cache[16] || (_cache[16] = createBaseVNode("label", { class: "form-label" }, [createBaseVNode("span", {
						class: "line-dot",
						style: {
							"background": "#ef4444",
							"display": "inline-block"
						}
					}), createTextVNode(" 红线位置（字幕上边界） ")], -1)), createVNode(SliderInput_default, {
						"model-value": Math.round(topCutRatio.value * 100),
						label: "",
						unit: "%",
						min: 0,
						max: 98,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = (val) => topCutRatio.value = val / 100)
					}, null, 8, ["model-value"])]),
					createBaseVNode("div", _hoisted_21$2, [_cache[17] || (_cache[17] = createBaseVNode("label", { class: "form-label" }, [createBaseVNode("span", {
						class: "line-dot",
						style: {
							"background": "#3b82f6",
							"display": "inline-block"
						}
					}), createTextVNode(" 蓝线位置（字幕下边界） ")], -1)), createVNode(SliderInput_default, {
						"model-value": Math.round(bottomCutRatio.value * 100),
						label: "",
						unit: "%",
						min: 2,
						max: 100,
						"onUpdate:modelValue": _cache[5] || (_cache[5] = (val) => bottomCutRatio.value = val / 100)
					}, null, 8, ["model-value"])]),
					createBaseVNode("div", _hoisted_22$2, [_cache[18] || (_cache[18] = createBaseVNode("label", { class: "form-label" }, "输出格式", -1)), createBaseVNode("div", _hoisted_23$2, [(openBlock(), createElementBlock(Fragment, null, renderList([
						"png",
						"jpeg",
						"webp"
					], (fmt) => {
						return createBaseVNode("button", {
							key: fmt,
							class: normalizeClass(["seg-btn", { active: format.value === fmt }]),
							onClick: ($event) => format.value = fmt
						}, toDisplayString(fmt.toUpperCase()), 11, _hoisted_24$2);
					}), 64))])]),
					createBaseVNode("div", _hoisted_25$2, [createBaseVNode("label", _hoisted_26$2, [_cache[19] || (_cache[19] = createBaseVNode("label", {
						class: "form-label",
						style: { "display": "inline" }
					}, "图片压缩", -1)), format.value === "png" ? (openBlock(), createElementBlock("span", _hoisted_27$2, "（PNG 无损，此项无效）")) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_28$2, [(openBlock(), createElementBlock(Fragment, null, renderList(compressionOptions, (opt) => {
						return createBaseVNode("button", {
							key: opt.value,
							class: normalizeClass(["seg-btn", { active: compression.value === opt.value }]),
							disabled: format.value === "png",
							onClick: ($event) => compression.value = opt.value
						}, toDisplayString(opt.label), 11, _hoisted_29$2);
					}), 64))])]),
					createBaseVNode("div", _hoisted_30$2, [createBaseVNode("button", {
						class: "btn btn-primary btn-block",
						disabled: images.value.length === 0 || isGenerating.value,
						onClick: generate
					}, [createBaseVNode("i", { class: normalizeClass(["fa-solid", isGenerating.value ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"]) }, null, 2), createTextVNode(" " + toDisplayString(isGenerating.value ? "生成中..." : "生成长拼接图"), 1)], 8, _hoisted_31$2)])
				])]),
				resultCanvas.value ? (openBlock(), createElementBlock("div", _hoisted_32$2, [
					createBaseVNode("div", _hoisted_33$2, [_cache[21] || (_cache[21] = createBaseVNode("i", {
						class: "fa-solid fa-check-circle",
						style: { "color": "var(--accent)" }
					}, null, -1)), createTextVNode(" 拼接完成 · " + toDisplayString(resultWidth.value) + " × " + toDisplayString(resultHeight.value) + " px ", 1)]),
					createBaseVNode("div", _hoisted_34$2, [createBaseVNode("canvas", {
						ref_key: "resultCanvasEl",
						ref: resultCanvasEl,
						class: "result-canvas"
					}, null, 512)]),
					createBaseVNode("div", _hoisted_35$2, [createBaseVNode("button", {
						class: "btn btn-primary",
						onClick: _cache[6] || (_cache[6] = ($event) => saveResult(format.value))
					}, [_cache[22] || (_cache[22] = createBaseVNode("i", { class: "fa-solid fa-download" }, null, -1)), createTextVNode(" 保存 " + toDisplayString(format.value.toUpperCase()), 1)])])
				])) : createCommentVNode("", true)
			]);
		};
	}
}, [["__scopeId", "data-v-11834e30"]]);
//#endregion
//#region src/views/ImageStitch.vue
var _hoisted_1$2 = { class: "app-layout" };
var _hoisted_2$2 = { class: "app-left" };
var _hoisted_3$2 = { key: 0 };
var _hoisted_4$1 = { class: "form-label" };
var _hoisted_5$1 = { class: "image-list" };
var _hoisted_6$1 = ["onDragstart", "onDragover"];
var _hoisted_7$1 = ["src", "alt"];
var _hoisted_8$1 = { class: "item-index" };
var _hoisted_9$1 = ["onClick"];
var _hoisted_10$1 = ["onClick"];
var _hoisted_11$1 = { class: "app-middle" };
var _hoisted_12$1 = { class: "settings-panel" };
var _hoisted_13$1 = { class: "setting-item" };
var _hoisted_14$1 = { class: "seg-control" };
var _hoisted_15$1 = ["onClick"];
var _hoisted_16$1 = {
	key: 0,
	class: "setting-item"
};
var _hoisted_17$1 = { class: "seg-control" };
var _hoisted_18$1 = ["onClick"];
var _hoisted_19$1 = { class: "setting-item" };
var _hoisted_20$1 = { class: "setting-item" };
var _hoisted_21$1 = { class: "setting-item" };
var _hoisted_22$1 = { class: "color-swatches" };
var _hoisted_23$1 = ["title", "onClick"];
var _hoisted_24$1 = {
	key: 0,
	class: "fa-solid fa-ban",
	style: {
		"font-size": "0.7rem",
		"color": "var(--muted)"
	}
};
var _hoisted_25$1 = ["title"];
var _hoisted_26$1 = { class: "setting-item" };
var _hoisted_27$1 = { class: "seg-control" };
var _hoisted_28$1 = ["onClick"];
var _hoisted_29$1 = { class: "setting-item" };
var _hoisted_30$1 = { class: "form-label" };
var _hoisted_31$1 = {
	key: 0,
	class: "form-hint"
};
var _hoisted_32$1 = { class: "seg-control" };
var _hoisted_33$1 = ["disabled", "onClick"];
var _hoisted_34$1 = { class: "app-right" };
var _hoisted_35$1 = { class: "preview-area" };
var _hoisted_36$1 = {
	key: 0,
	class: "preview-info"
};
var _hoisted_37$1 = {
	key: 1,
	class: "empty-state"
};
var _hoisted_38 = ["disabled"];
var ImageStitch_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "ImageStitch",
	setup(__props) {
		const { showToast } = useToast();
		const fileInput = /* @__PURE__ */ ref(null);
		const previewCanvas = /* @__PURE__ */ ref(null);
		const canvasContainer = /* @__PURE__ */ ref(null);
		const previewInfo = /* @__PURE__ */ ref("");
		const zoomScale = /* @__PURE__ */ ref(1);
		const panX = /* @__PURE__ */ ref(0);
		const panY = /* @__PURE__ */ ref(0);
		const isPanning = /* @__PURE__ */ ref(false);
		let panStartX = 0;
		let panStartY = 0;
		let panStartPanX = 0;
		let panStartPanY = 0;
		const images = /* @__PURE__ */ ref([]);
		const dragIndex = /* @__PURE__ */ ref(-1);
		const dragTargetIndex = /* @__PURE__ */ ref(-1);
		const isDragOver = /* @__PURE__ */ ref(false);
		const layout = /* @__PURE__ */ ref("horizontal");
		const gridCols = /* @__PURE__ */ ref(2);
		const gap = /* @__PURE__ */ ref(8);
		const radius = /* @__PURE__ */ ref(0);
		const bgColor = /* @__PURE__ */ ref("#ffffff");
		const scale = /* @__PURE__ */ ref(1);
		const layoutOptions = [
			{
				value: "horizontal",
				label: "水平",
				icon: "fa-solid fa-arrows-left-right"
			},
			{
				value: "vertical",
				label: "垂直",
				icon: "fa-solid fa-arrows-up-down"
			},
			{
				value: "grid",
				label: "网格",
				icon: "fa-solid fa-border-all"
			}
		];
		const customBgColor = /* @__PURE__ */ ref("#a78bfa");
		const bgColors = [
			{
				value: "#ffffff",
				label: "白色"
			},
			{
				value: "#000000",
				label: "黑色"
			},
			{
				value: "#1a1d27",
				label: "深色"
			},
			{
				value: "#f8fafc",
				label: "亮灰"
			},
			{
				value: "#e0f2fe",
				label: "天蓝"
			},
			{
				value: "#fef3c7",
				label: "米黄"
			},
			{
				value: "transparent",
				label: "透明"
			},
			{
				value: "picker",
				label: "调色盘",
				isPicker: true
			}
		];
		const applyCustomBgColor = () => {
			bgColor.value = customBgColor.value;
		};
		const format = /* @__PURE__ */ ref("png");
		const compressionOptions = [
			{
				label: "不压缩",
				value: 1
			},
			{
				label: "2x 压缩",
				value: .5
			},
			{
				label: "4x 压缩",
				value: .25
			},
			{
				label: "8x 压缩",
				value: .125
			}
		];
		const compression = /* @__PURE__ */ ref(1);
		watch([
			images,
			layout,
			gridCols,
			gap,
			radius,
			bgColor,
			scale
		], () => {
			nextTick(updatePreview);
		}, { deep: true });
		/** 用户通过 input 选择文件 */
		const onFileChange = (e) => {
			addFiles(Array.from(e.target.files));
			e.target.value = "";
		};
		/** 拖拽文件到上传区 */
		const onDrop = (e) => {
			isDragOver.value = false;
			const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
			if (files.length) addFiles(files);
		};
		/** 粘贴图片（Ctrl+V） */
		const onPaste = (e) => {
			const files = [...e.clipboardData?.items || []].filter((item) => item.type.startsWith("image/")).map((item) => item.getAsFile()).filter(Boolean);
			if (files.length) addFiles(files);
		};
		/**
		* 核心：把 File 数组转为我们需要的图片对象
		* 使用 Promise.all 并发加载所有图片，提升速度
		*/
		const addFiles = async (files) => {
			const existingKeys = new Set(images.value.map((i) => `${i.name}|${i.size}`));
			const uniqueFiles = [];
			for (const file of files) {
				const key = `${file.name}|${file.size}`;
				if (existingKeys.has(key)) continue;
				existingKeys.add(key);
				uniqueFiles.push(file);
			}
			const newItems = await Promise.all(uniqueFiles.map((file) => new Promise((resolve) => {
				const url = URL.createObjectURL(file);
				const img = new Image();
				img.onload = () => resolve({
					id: Date.now() + Math.random(),
					name: file.name,
					size: file.size,
					url,
					img,
					rotation: 0
				});
				img.src = url;
			})));
			images.value.push(...newItems);
			showToast(`已添加 ${newItems.length} 张图片`, "success");
		};
		/** 删除指定图片 */
		const removeImage = (index) => {
			URL.revokeObjectURL(images.value[index].url);
			images.value.splice(index, 1);
		};
		/** 旋转指定图片 90° */
		const rotateImage = (index) => {
			images.value[index].rotation = (images.value[index].rotation + 90) % 360;
		};
		/** 清空全部 */
		const clearAll = () => {
			images.value.forEach((item) => URL.revokeObjectURL(item.url));
			images.value = [];
			previewInfo.value = "";
		};
		const onDragStart = (index) => {
			dragIndex.value = index;
		};
		const onDragOver = (index) => {
			dragTargetIndex.value = index;
		};
		const onDragEnd = () => {
			if (dragIndex.value !== -1 && dragTargetIndex.value !== -1 && dragIndex.value !== dragTargetIndex.value) {
				const arr = [...images.value];
				const item = arr.splice(dragIndex.value, 1)[0];
				arr.splice(dragTargetIndex.value, 0, item);
				images.value = arr;
			}
			dragIndex.value = -1;
			dragTargetIndex.value = -1;
		};
		/**
		* 获取图片旋转后的显示尺寸
		* 旋转 90°/270° 时，宽高互换
		*/
		const getRotatedSize = (img, rotation) => {
			const r = (rotation % 360 + 360) % 360;
			return r === 90 || r === 270 ? {
				width: img.naturalHeight,
				height: img.naturalWidth
			} : {
				width: img.naturalWidth,
				height: img.naturalHeight
			};
		};
		/**
		* 圆角矩形路径（用于 Canvas clip）
		*/
		const roundRect = (ctx, x, y, w, h, r) => {
			r = Math.min(r, w / 2, h / 2);
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.closePath();
		};
		/**
		* 主拼接函数：根据当前所有设置，生成一个 Canvas
		* @param {number} renderScale - 渲染缩放比（预览用小值，导出用 scale.value）
		* @returns {HTMLCanvasElement|null}
		*/
		const stitchImages = (renderScale) => {
			const imgs = images.value;
			if (imgs.length < 2) return null;
			const gapPx = gap.value;
			const radiusPx = radius.value;
			const layoutMode = layout.value;
			const sizes = imgs.map((item) => getRotatedSize(item.img, item.rotation));
			let canvasW, canvasH, positions;
			if (layoutMode === "horizontal") {
				const avgH = Math.round(sizes.reduce((sum, s) => sum + s.height, 0) / sizes.length);
				const scaledWidths = sizes.map((s) => Math.round(s.width * (avgH / s.height)));
				canvasW = scaledWidths.reduce((sum, w) => sum + w, 0) + gapPx * (imgs.length - 1);
				canvasH = avgH;
				positions = scaledWidths.map((w, i) => {
					return {
						x: scaledWidths.slice(0, i).reduce((sum, sw) => sum + sw, 0) + gapPx * i,
						y: 0,
						w,
						h: avgH
					};
				});
			} else if (layoutMode === "vertical") {
				const avgW = Math.round(sizes.reduce((sum, s) => sum + s.width, 0) / sizes.length);
				const scaledHeights = sizes.map((s) => Math.round(s.height * (avgW / s.width)));
				canvasW = avgW;
				canvasH = scaledHeights.reduce((sum, h) => sum + h, 0) + gapPx * (imgs.length - 1);
				positions = scaledHeights.map((h, i) => {
					return {
						x: 0,
						y: scaledHeights.slice(0, i).reduce((sum, sh) => sum + sh, 0) + gapPx * i,
						w: avgW,
						h
					};
				});
			} else {
				const cols = gridCols.value;
				const rows = Math.ceil(imgs.length / cols);
				const totalGapW = gapPx * (cols - 1);
				const totalGapH = gapPx * (rows - 1);
				const avgW = Math.round(sizes.reduce((sum, s) => sum + s.width, 0) / sizes.length);
				const avgH = Math.round(sizes.reduce((sum, s) => sum + s.height, 0) / sizes.length);
				const cellW = avgW;
				const cellH = avgH;
				canvasW = cellW * cols + totalGapW;
				canvasH = cellH * rows + totalGapH;
				positions = sizes.map((s, i) => {
					const c = i % cols;
					const r = Math.floor(i / cols);
					const bx = c * (cellW + gapPx);
					const by = r * (cellH + gapPx);
					const fitScale = Math.min(cellW / s.width, cellH / s.height);
					const dw = Math.round(s.width * fitScale);
					const dh = Math.round(s.height * fitScale);
					const ox = Math.round((cellW - dw) / 2);
					const oy = Math.round((cellH - dh) / 2);
					return {
						x: bx + ox,
						y: by + oy,
						w: dw,
						h: dh,
						cellX: bx,
						cellY: by,
						cellW,
						cellH
					};
				});
			}
			const canvas = document.createElement("canvas");
			canvas.width = Math.ceil(canvasW * renderScale);
			canvas.height = Math.ceil(canvasH * renderScale);
			const ctx = canvas.getContext("2d");
			if (bgColor.value !== "transparent") {
				ctx.fillStyle = bgColor.value;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
			positions.forEach((pos, i) => {
				const { img, rotation } = imgs[i];
				const sx = pos.x * renderScale;
				const sy = pos.y * renderScale;
				const sw = pos.w * renderScale;
				const sh = pos.h * renderScale;
				ctx.save();
				if (layoutMode === "grid" && pos.cellW !== void 0) {
					const clipX = pos.cellX * renderScale;
					const clipY = pos.cellY * renderScale;
					const clipW = pos.cellW * renderScale;
					const clipH = pos.cellH * renderScale;
					if (radiusPx > 0) roundRect(ctx, clipX, clipY, clipW, clipH, radiusPx * renderScale);
					else {
						ctx.beginPath();
						ctx.rect(clipX, clipY, clipW, clipH);
					}
					ctx.clip();
				} else if (radiusPx > 0) {
					roundRect(ctx, sx, sy, sw, sh, radiusPx * renderScale);
					ctx.clip();
				}
				ctx.translate(sx + sw / 2, sy + sh / 2);
				ctx.rotate(rotation * Math.PI / 180);
				ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
				ctx.restore();
			});
			return canvas;
		};
		const onCanvasWheel = (e) => {
			const delta = e.deltaY > 0 ? .9 : 1.1;
			zoomScale.value = Math.min(10, Math.max(.1, zoomScale.value * delta));
		};
		const onCanvasMouseDown = (e) => {
			isPanning.value = true;
			panStartX = e.clientX;
			panStartY = e.clientY;
			panStartPanX = panX.value;
			panStartPanY = panY.value;
		};
		const onCanvasMouseMove = (e) => {
			if (!isPanning.value) return;
			panX.value = panStartPanX + (e.clientX - panStartX);
			panY.value = panStartPanY + (e.clientY - panStartY);
		};
		const onCanvasMouseUp = () => {
			isPanning.value = false;
		};
		/** 更新预览 Canvas */
		const updatePreview = () => {
			if (images.value.length < 2) {
				previewInfo.value = "";
				return;
			}
			const result = stitchImages(.5);
			if (!result || !previewCanvas.value) return;
			const canvas = previewCanvas.value;
			canvas.width = result.width;
			canvas.height = result.height;
			canvas.getContext("2d").drawImage(result, 0, 0);
			zoomScale.value = 1;
			panX.value = 0;
			panY.value = 0;
			previewInfo.value = `${Math.ceil(result.width / .5 * scale.value)} × ${Math.ceil(result.height / .5 * scale.value)} px`;
		};
		/** 导出图片 */
		const exportImage = () => {
			if (images.value.length < 2) return;
			const fmt = format.value;
			let mimeType = "image/png";
			let fileExt = "png";
			if (fmt === "jpeg") {
				mimeType = "image/jpeg";
				fileExt = "jpg";
			} else if (fmt === "webp") {
				mimeType = "image/webp";
				fileExt = "webp";
			}
			const result = stitchImages(scale.value);
			if (!result) return;
			result.toBlob((blob) => {
				if (!blob) {
					showToast("导出失败", "error");
					return;
				}
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `stitch_${Date.now()}.${fileExt}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				showToast(`导出成功，${(blob.size / 1024 / 1024).toFixed(2)} MB`, "success");
			}, mimeType, compression.value);
		};
		onMounted(() => {
			document.addEventListener("paste", onPaste);
		});
		onUnmounted(() => {
			document.removeEventListener("paste", onPaste);
			images.value.forEach((item) => URL.revokeObjectURL(item.url));
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$2, [
				createBaseVNode("div", _hoisted_2$2, [
					createBaseVNode("div", {
						class: normalizeClass(["upload-zone", { "drag-over": isDragOver.value }]),
						onClick: _cache[0] || (_cache[0] = ($event) => fileInput.value.click()),
						onDragover: _cache[1] || (_cache[1] = withModifiers(($event) => isDragOver.value = true, ["prevent"])),
						onDragleave: _cache[2] || (_cache[2] = withModifiers(($event) => isDragOver.value = false, ["prevent"])),
						onDrop: withModifiers(onDrop, ["prevent"])
					}, [
						_cache[6] || (_cache[6] = createBaseVNode("i", { class: "fa-solid fa-cloud-arrow-up" }, null, -1)),
						_cache[7] || (_cache[7] = createBaseVNode("p", { class: "upload-text" }, "点击或拖拽图片到此处", -1)),
						_cache[8] || (_cache[8] = createBaseVNode("p", { class: "upload-hint" }, "支持 JPG / PNG / WebP · 可多选 · 可粘贴", -1)),
						createBaseVNode("input", {
							ref_key: "fileInput",
							ref: fileInput,
							type: "file",
							accept: "image/*",
							multiple: "",
							style: { "display": "none" },
							onChange: onFileChange
						}, null, 544)
					], 34),
					images.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_3$2, [createBaseVNode("span", _hoisted_4$1, "图片列表 (" + toDisplayString(images.value.length) + ") 拖拽调整顺序", 1), createBaseVNode("div", _hoisted_5$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(images.value, (item, index) => {
						return openBlock(), createElementBlock("div", {
							key: item.id,
							class: normalizeClass(["image-item", {
								dragging: dragIndex.value === index,
								"drag-target": dragTargetIndex.value === index
							}]),
							draggable: "true",
							onDragstart: ($event) => onDragStart(index),
							onDragover: withModifiers(($event) => onDragOver(index), ["prevent"]),
							onDragend: onDragEnd
						}, [
							createBaseVNode("img", {
								src: item.url,
								alt: item.name
							}, null, 8, _hoisted_7$1),
							createBaseVNode("span", _hoisted_8$1, toDisplayString(index + 1), 1),
							createBaseVNode("button", {
								class: "item-rotate",
								onClick: withModifiers(($event) => rotateImage(index), ["stop"]),
								title: "旋转90°"
							}, [..._cache[9] || (_cache[9] = [createBaseVNode("i", { class: "fa-solid fa-rotate-right" }, null, -1)])], 8, _hoisted_9$1),
							createBaseVNode("button", {
								class: "item-delete",
								onClick: withModifiers(($event) => removeImage(index), ["stop"]),
								title: "删除"
							}, [..._cache[10] || (_cache[10] = [createBaseVNode("i", { class: "fa-solid fa-xmark" }, null, -1)])], 8, _hoisted_10$1)
						], 42, _hoisted_6$1);
					}), 128))])])) : createCommentVNode("", true),
					images.value.length > 0 ? (openBlock(), createElementBlock("button", {
						key: 1,
						class: "btn btn-danger btn-sm",
						onClick: clearAll
					}, [_cache[11] || (_cache[11] = createBaseVNode("i", { class: "fa-solid fa-trash" }, null, -1)), createTextVNode(" 清空全部 (" + toDisplayString(images.value.length) + ") ", 1)])) : createCommentVNode("", true)
				]),
				createBaseVNode("div", _hoisted_11$1, [createBaseVNode("div", _hoisted_12$1, [
					createBaseVNode("div", _hoisted_13$1, [_cache[12] || (_cache[12] = createBaseVNode("span", { class: "form-label" }, "布局方式", -1)), createBaseVNode("div", _hoisted_14$1, [(openBlock(), createElementBlock(Fragment, null, renderList(layoutOptions, (opt) => {
						return createBaseVNode("button", {
							key: opt.value,
							class: normalizeClass(["seg-btn", { active: layout.value === opt.value }]),
							onClick: ($event) => layout.value = opt.value
						}, [createBaseVNode("i", { class: normalizeClass(opt.icon) }, null, 2), createTextVNode(" " + toDisplayString(opt.label), 1)], 10, _hoisted_15$1);
					}), 64))])]),
					layout.value === "grid" ? (openBlock(), createElementBlock("div", _hoisted_16$1, [_cache[13] || (_cache[13] = createBaseVNode("span", { class: "form-label" }, "网格列数", -1)), createBaseVNode("div", _hoisted_17$1, [(openBlock(), createElementBlock(Fragment, null, renderList([
						2,
						3,
						4,
						5
					], (n) => {
						return createBaseVNode("button", {
							key: n,
							class: normalizeClass(["seg-btn", { active: gridCols.value === n }]),
							onClick: ($event) => gridCols.value = n
						}, toDisplayString(n), 11, _hoisted_18$1);
					}), 64))])])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_19$1, [_cache[14] || (_cache[14] = createBaseVNode("span", { class: "form-label" }, "间距滑块", -1)), createVNode(SliderInput_default, {
						modelValue: gap.value,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => gap.value = $event),
						label: "",
						unit: "px",
						min: 0,
						max: 100
					}, null, 8, ["modelValue"])]),
					createBaseVNode("div", _hoisted_20$1, [_cache[15] || (_cache[15] = createBaseVNode("span", { class: "form-label" }, "圆角滑块", -1)), createVNode(SliderInput_default, {
						modelValue: radius.value,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => radius.value = $event),
						label: "",
						unit: "px",
						min: 0,
						max: 80
					}, null, 8, ["modelValue"])]),
					createBaseVNode("div", _hoisted_21$1, [_cache[17] || (_cache[17] = createBaseVNode("span", { class: "form-label" }, "背景色", -1)), createBaseVNode("div", _hoisted_22$1, [(openBlock(), createElementBlock(Fragment, null, renderList(bgColors, (color) => {
						return openBlock(), createElementBlock(Fragment, { key: color.value }, [!color.isPicker ? (openBlock(), createElementBlock("button", {
							key: 0,
							class: normalizeClass(["color-swatch", { active: bgColor.value === color.value }]),
							style: normalizeStyle(color.value === "transparent" ? {
								background: "transparent",
								border: "1px dashed var(--border)"
							} : { background: color.value }),
							title: color.label,
							onClick: ($event) => bgColor.value = color.value
						}, [color.value === "transparent" ? (openBlock(), createElementBlock("i", _hoisted_24$1)) : createCommentVNode("", true)], 14, _hoisted_23$1)) : (openBlock(), createElementBlock("label", {
							key: 1,
							class: normalizeClass(["color-swatch", { active: bgColor.value === customBgColor.value }]),
							style: normalizeStyle({
								background: customBgColor.value,
								border: "1px solid var(--border)"
							}),
							title: color.label
						}, [_cache[16] || (_cache[16] = createBaseVNode("i", {
							class: "fa-solid fa-palette",
							style: {
								"font-size": "0.85rem",
								"color": "rgba(255,255,255,0.85)"
							}
						}, null, -1)), withDirectives(createBaseVNode("input", {
							type: "color",
							class: "palette-input",
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => customBgColor.value = $event),
							onInput: applyCustomBgColor
						}, null, 544), [[vModelText, customBgColor.value]])], 14, _hoisted_25$1))], 64);
					}), 64))])]),
					createBaseVNode("div", _hoisted_26$1, [_cache[18] || (_cache[18] = createBaseVNode("label", { class: "form-label" }, "输出格式", -1)), createBaseVNode("div", _hoisted_27$1, [(openBlock(), createElementBlock(Fragment, null, renderList([
						"png",
						"jpeg",
						"webp"
					], (fmt) => {
						return createBaseVNode("button", {
							key: fmt,
							class: normalizeClass(["seg-btn", { active: format.value === fmt }]),
							onClick: ($event) => format.value = fmt
						}, toDisplayString(fmt.toUpperCase()), 11, _hoisted_28$1);
					}), 64))])]),
					createBaseVNode("div", _hoisted_29$1, [createBaseVNode("label", _hoisted_30$1, [_cache[19] || (_cache[19] = createBaseVNode("label", {
						class: "form-label",
						style: { "display": "inline" }
					}, "图片压缩", -1)), format.value === "png" ? (openBlock(), createElementBlock("span", _hoisted_31$1, "（PNG 无损，此项无效）")) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_32$1, [(openBlock(), createElementBlock(Fragment, null, renderList(compressionOptions, (opt) => {
						return createBaseVNode("button", {
							key: opt.value,
							class: normalizeClass(["seg-btn", { active: compression.value === opt.value }]),
							disabled: format.value === "png",
							onClick: ($event) => compression.value = opt.value
						}, toDisplayString(opt.label), 11, _hoisted_33$1);
					}), 64))])])
				])]),
				createBaseVNode("div", _hoisted_34$1, [createBaseVNode("div", _hoisted_35$1, [
					previewInfo.value ? (openBlock(), createElementBlock("div", _hoisted_36$1, [_cache[20] || (_cache[20] = createBaseVNode("i", { class: "fa-solid fa-image" }, null, -1)), createTextVNode(" 预览 · 输出尺寸 " + toDisplayString(previewInfo.value), 1)])) : createCommentVNode("", true),
					images.value.length < 2 ? (openBlock(), createElementBlock("div", _hoisted_37$1, [..._cache[21] || (_cache[21] = [createBaseVNode("span", { class: "empty-icon" }, "🖼️", -1), createBaseVNode("span", null, "添加至少 2 张图片后预览", -1)])])) : createCommentVNode("", true),
					createBaseVNode("div", {
						class: "result-canvas-container",
						ref_key: "canvasContainer",
						ref: canvasContainer,
						onWheel: withModifiers(onCanvasWheel, ["prevent"]),
						onMousedown: onCanvasMouseDown,
						onMousemove: onCanvasMouseMove,
						onMouseup: onCanvasMouseUp,
						onMouseleave: onCanvasMouseUp,
						style: normalizeStyle({ cursor: isPanning.value ? "grabbing" : "grab" })
					}, [createBaseVNode("div", {
						class: "canvas-transform-wrapper",
						style: normalizeStyle({
							transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoomScale.value})`,
							transformOrigin: "center center"
						})
					}, [withDirectives(createBaseVNode("canvas", {
						ref_key: "previewCanvas",
						ref: previewCanvas,
						class: "preview-canvas"
					}, null, 512), [[vShow, images.value.length >= 2]])], 4)], 36),
					createBaseVNode("button", {
						class: "btn btn-primary btn-block",
						disabled: images.value.length < 2,
						onClick: exportImage
					}, [_cache[22] || (_cache[22] = createBaseVNode("i", { class: "fa-solid fa-download" }, null, -1)), createTextVNode(" " + toDisplayString(images.value.length < 2 ? "至少需要 2 张图片" : "导出" + format.value.toUpperCase() + "拼接图"), 1)], 8, _hoisted_38)
				])])
			]);
		};
	}
}, [["__scopeId", "data-v-73eac7e5"]]);
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep) {
	return "/subtitle_extractor/" + dep;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (!!importerUrl) for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region src/views/ImageSegmentation.vue
var _hoisted_1$1 = { class: "app-layout" };
var _hoisted_2$1 = { class: "app-left" };
var _hoisted_3$1 = {
	key: 0,
	class: "source-preview-wrap"
};
var _hoisted_4 = { class: "source-preview" };
var _hoisted_5 = ["src", "alt"];
var _hoisted_6 = {
	key: 1,
	class: "nav-bar"
};
var _hoisted_7 = ["disabled"];
var _hoisted_8 = {
	key: 2,
	class: "info-bar"
};
var _hoisted_9 = { class: "nav-filename" };
var _hoisted_10 = { class: "app-middle" };
var _hoisted_11 = { class: "settings-panel" };
var _hoisted_12 = { class: "setting-item" };
var _hoisted_13 = { class: "seg-control" };
var _hoisted_14 = ["onClick"];
var _hoisted_15 = { class: "picker-header" };
var _hoisted_16 = { class: "picker-hint" };
var _hoisted_17 = { class: "picker-grid" };
var _hoisted_18 = ["onMouseenter", "onClick"];
var _hoisted_19 = { class: "setting-item" };
var _hoisted_20 = { class: "setting-item" };
var _hoisted_21 = { class: "color-swatches" };
var _hoisted_22 = ["title", "onClick"];
var _hoisted_23 = {
	key: 0,
	class: "fa-solid fa-ban",
	style: {
		"font-size": "0.7rem",
		"color": "var(--muted)"
	}
};
var _hoisted_24 = ["title"];
var _hoisted_25 = { class: "setting-item" };
var _hoisted_26 = { class: "seg-control" };
var _hoisted_27 = ["onClick"];
var _hoisted_28 = { class: "setting-item" };
var _hoisted_29 = { class: "form-label" };
var _hoisted_30 = {
	key: 0,
	class: "form-hint"
};
var _hoisted_31 = { class: "seg-control" };
var _hoisted_32 = ["disabled", "onClick"];
var _hoisted_33 = { class: "app-right" };
var _hoisted_34 = { class: "preview-area" };
var _hoisted_35 = {
	key: 0,
	class: "preview-info"
};
var _hoisted_36 = {
	key: 1,
	class: "empty-state"
};
var _hoisted_37 = ["disabled"];
var ImageSegmentation_default = /* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "ImageSegmentation",
	setup(__props) {
		const { showToast } = useToast();
		const fileInput = /* @__PURE__ */ ref(null);
		const customBtnRef = /* @__PURE__ */ ref(null);
		const cellCanvases = /* @__PURE__ */ ref([]);
		const sourceImage = /* @__PURE__ */ ref(null);
		const isDragOver = /* @__PURE__ */ ref(false);
		const cutMode = /* @__PURE__ */ ref("3x3");
		const cutCols = /* @__PURE__ */ ref(3);
		const cutRows = /* @__PURE__ */ ref(3);
		const showCustomPicker = /* @__PURE__ */ ref(false);
		const hoverCol = /* @__PURE__ */ ref(0);
		const hoverRow = /* @__PURE__ */ ref(0);
		const pickerStyle = /* @__PURE__ */ ref({});
		const radius = /* @__PURE__ */ ref(0);
		const bgColor = /* @__PURE__ */ ref("#000000");
		const customBgColor = /* @__PURE__ */ ref("#a78bfa");
		const format = /* @__PURE__ */ ref("jpeg");
		const compression = /* @__PURE__ */ ref(1);
		const compressionOptions = [
			{
				label: "不压缩",
				value: 1
			},
			{
				label: "2x 压缩",
				value: .5
			},
			{
				label: "4x 压缩",
				value: .25
			},
			{
				label: "8x 压缩",
				value: .125
			}
		];
		const bgColors = [
			{
				value: "#000000",
				label: "黑色"
			},
			{
				value: "#ffffff",
				label: "白色"
			},
			{
				value: "#1a1d27",
				label: "深色"
			},
			{
				value: "#f8fafc",
				label: "亮灰"
			},
			{
				value: "#e0f2fe",
				label: "天蓝"
			},
			{
				value: "#fef3c7",
				label: "米黄"
			},
			{
				value: "transparent",
				label: "透明"
			},
			{
				value: "picker",
				label: "调色盘",
				isPicker: true
			}
		];
		const presetOptions = [{
			value: "2x2",
			label: "2×2",
			icon: "fa-solid fa-border-all"
		}, {
			value: "3x3",
			label: "3×3",
			icon: "fa-solid fa-border-all"
		}];
		const formatBytes = (bytes) => {
			if (!bytes) return "-";
			if (bytes < 1024) return bytes + " B";
			if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
			return (bytes / 1048576).toFixed(1) + " MB";
		};
		const previewInfo = computed(() => {
			if (!sourceImage.value) return "";
			const { naturalWidth: w, naturalHeight: h } = sourceImage.value.img;
			return `每格约 ${Math.floor(w / cutCols.value)} × ${Math.floor(h / cutRows.value)} px · 共 ${cutCols.value * cutRows.value} 张`;
		});
		const previewCells = computed(() => Array.from({ length: cutCols.value * cutRows.value }));
		const selectPreset = (value) => {
			cutMode.value = value;
			if (value === "2x2") {
				cutCols.value = 2;
				cutRows.value = 2;
			}
			if (value === "3x3") {
				cutCols.value = 3;
				cutRows.value = 3;
			}
			showCustomPicker.value = false;
		};
		const openCustomPicker = () => {
			if (customBtnRef.value) {
				const rect = customBtnRef.value.getBoundingClientRect();
				pickerStyle.value = {
					top: rect.bottom + window.scrollY + 8 + "px",
					left: rect.left + window.scrollX + "px"
				};
			}
			hoverCol.value = cutMode.value === "custom" ? cutCols.value : 0;
			hoverRow.value = cutMode.value === "custom" ? cutRows.value : 0;
			showCustomPicker.value = true;
		};
		const confirmCustom = (col, row) => {
			cutMode.value = "custom";
			cutCols.value = col;
			cutRows.value = row;
			showCustomPicker.value = false;
		};
		const applyCustomBgColor = () => {
			bgColor.value = customBgColor.value;
		};
		const onFileChange = (e) => {
			const file = e.target.files[0];
			if (file) loadFile(file);
			e.target.value = "";
		};
		const onDrop = (e) => {
			isDragOver.value = false;
			const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
			if (file) loadFile(file);
		};
		const onPaste = (e) => {
			const item = [...e.clipboardData?.items || []].find((i) => i.type.startsWith("image/"));
			if (item) loadFile(item.getAsFile());
		};
		const loadFile = (file) => {
			if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url);
			const url = URL.createObjectURL(file);
			const img = new Image();
			img.onload = () => {
				sourceImage.value = {
					id: Date.now(),
					size: file.size,
					name: file.name,
					url,
					img
				};
				showToast("图片已加载", "success");
			};
			img.src = url;
		};
		const clearSource = () => {
			if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url);
			sourceImage.value = null;
		};
		const roundRect = (ctx, x, y, w, h, r) => {
			r = Math.min(r, w / 2, h / 2);
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.closePath();
		};
		/**
		* 从源图中裁出第 (col, row) 格（0-indexed），返回 HTMLCanvasElement
		* @param {number} col       - 列索引（0-indexed）
		* @param {number} row       - 行索引（0-indexed）
		* @param {number} outScale  - 输出缩放（预览=1，导出可调）
		*/
		const sliceCell = (col, row, outScale = 1) => {
			const { img } = sourceImage.value;
			const srcW = img.naturalWidth;
			const srcH = img.naturalHeight;
			const cellSrcW = srcW / cutCols.value;
			const cellSrcH = srcH / cutRows.value;
			const sx = col * cellSrcW;
			const sy = row * cellSrcH;
			const outW = Math.round(cellSrcW * outScale);
			const outH = Math.round(cellSrcH * outScale);
			const canvas = document.createElement("canvas");
			canvas.width = outW;
			canvas.height = outH;
			const ctx = canvas.getContext("2d");
			if (bgColor.value !== "transparent") {
				ctx.fillStyle = bgColor.value;
				ctx.fillRect(0, 0, outW, outH);
			}
			if (radius.value > 0) {
				roundRect(ctx, 0, 0, outW, outH, radius.value * outScale);
				ctx.clip();
			}
			ctx.drawImage(img, sx, sy, cellSrcW, cellSrcH, 0, 0, outW, outH);
			return canvas;
		};
		const updatePreview = async () => {
			if (!sourceImage.value) return;
			await nextTick();
			const canvases = cellCanvases.value;
			if (!canvases || canvases.length === 0) return;
			const total = cutCols.value * cutRows.value;
			for (let i = 0; i < total; i++) {
				const cell = sliceCell(i % cutCols.value, Math.floor(i / cutCols.value), 1);
				const canvas = Array.isArray(canvases) ? canvases[i] : canvases;
				if (!canvas) continue;
				canvas.width = cell.width;
				canvas.height = cell.height;
				canvas.getContext("2d").drawImage(cell, 0, 0);
			}
		};
		const exportZip = async () => {
			if (!sourceImage.value) return;
			const fmt = format.value;
			let mimeType = "image/png";
			let fileExt = "png";
			if (fmt === "jpeg") {
				mimeType = "image/jpeg";
				fileExt = "jpg";
			} else if (fmt === "webp") {
				mimeType = "image/webp";
				fileExt = "webp";
			}
			const quality = fmt === "png" ? void 0 : compression.value;
			const total = cutCols.value * cutRows.value;
			showToast("正在生成切片…", "info");
			try {
				const JSZip = (await __vitePreload(async () => {
					const { default: __vite_default__ } = await import("./jszip.min-BK7UXaud.js").then((m) => /* @__PURE__ */ __toESM(m.default));
					return { default: __vite_default__ };
				}, [])).default;
				const zip = new JSZip();
				const blobPromises = Array.from({ length: total }, (_, i) => {
					const cell = sliceCell(i % cutCols.value, Math.floor(i / cutCols.value), 1);
					return new Promise((resolve) => {
						cell.toBlob((blob) => resolve({
							idx: i + 1,
							blob
						}), mimeType, quality);
					});
				});
				(await Promise.all(blobPromises)).forEach(({ idx, blob }) => {
					zip.file(`${String(idx).padStart(2, "0")}.${fileExt}`, blob);
				});
				const zipBlob = await zip.generateAsync({ type: "blob" });
				const url = URL.createObjectURL(zipBlob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `seg_${cutCols.value}x${cutRows.value}_${Date.now()}.zip`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				showToast(`导出成功，共 ${total} 张，${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`, "success");
			} catch (err) {
				console.error(err);
				showToast("导出失败：" + err.message, "error");
			}
		};
		watch([
			sourceImage,
			cutCols,
			cutRows,
			radius,
			bgColor
		], () => nextTick(updatePreview), { deep: true });
		onMounted(() => document.addEventListener("paste", onPaste));
		onUnmounted(() => {
			document.removeEventListener("paste", onPaste);
			if (sourceImage.value) URL.revokeObjectURL(sourceImage.value.url);
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				createBaseVNode("div", _hoisted_2$1, [
					createBaseVNode("div", {
						class: normalizeClass(["upload-zone", { "drag-over": isDragOver.value }]),
						onClick: _cache[0] || (_cache[0] = ($event) => fileInput.value.click()),
						onDragover: _cache[1] || (_cache[1] = withModifiers(($event) => isDragOver.value = true, ["prevent"])),
						onDragleave: _cache[2] || (_cache[2] = withModifiers(($event) => isDragOver.value = false, ["prevent"])),
						onDrop: withModifiers(onDrop, ["prevent"])
					}, [
						_cache[8] || (_cache[8] = createBaseVNode("i", { class: "fa-solid fa-cloud-arrow-up" }, null, -1)),
						_cache[9] || (_cache[9] = createBaseVNode("p", { class: "upload-text" }, "点击或拖拽图片到此处", -1)),
						_cache[10] || (_cache[10] = createBaseVNode("p", { class: "upload-hint" }, "支持 JPG / PNG / WebP · 可粘贴", -1)),
						createBaseVNode("input", {
							ref_key: "fileInput",
							ref: fileInput,
							type: "file",
							accept: "image/*",
							style: { "display": "none" },
							onChange: onFileChange
						}, null, 544)
					], 34),
					sourceImage.value ? (openBlock(), createElementBlock("div", _hoisted_3$1, [_cache[11] || (_cache[11] = createBaseVNode("span", { class: "form-label" }, "已上传图片", -1)), createBaseVNode("div", _hoisted_4, [createBaseVNode("img", {
						src: sourceImage.value.url,
						alt: sourceImage.value.name,
						class: "source-thumb"
					}, null, 8, _hoisted_5)])])) : createCommentVNode("", true),
					sourceImage.value ? (openBlock(), createElementBlock("div", _hoisted_6, [createBaseVNode("button", {
						class: "btn btn-danger",
						onClick: clearSource,
						disabled: !sourceImage.value
					}, [..._cache[12] || (_cache[12] = [createBaseVNode("i", { class: "fa-solid fa-trash" }, null, -1), createTextVNode(" 删除 ", -1)])], 8, _hoisted_7)])) : createCommentVNode("", true),
					sourceImage.value ? (openBlock(), createElementBlock("div", _hoisted_8, [
						createBaseVNode("span", _hoisted_9, toDisplayString(sourceImage.value.name), 1),
						createBaseVNode("span", null, [_cache[13] || (_cache[13] = createBaseVNode("i", { class: "fa-solid fa-expand" }, null, -1)), createTextVNode(" " + toDisplayString(sourceImage.value.img.naturalWidth) + " × " + toDisplayString(sourceImage.value.img.naturalHeight) + " px", 1)]),
						createBaseVNode("span", null, [_cache[14] || (_cache[14] = createBaseVNode("i", { class: "fa-solid fa-weight-hanging" }, null, -1)), createTextVNode(" " + toDisplayString(formatBytes(sourceImage.value.size)), 1)])
					])) : createCommentVNode("", true)
				]),
				createBaseVNode("div", _hoisted_10, [createBaseVNode("div", _hoisted_11, [
					createBaseVNode("div", _hoisted_12, [_cache[16] || (_cache[16] = createBaseVNode("span", { class: "form-label" }, "切割方式", -1)), createBaseVNode("div", _hoisted_13, [(openBlock(), createElementBlock(Fragment, null, renderList(presetOptions, (opt) => {
						return createBaseVNode("button", {
							key: opt.value,
							class: normalizeClass(["seg-btn", { active: cutMode.value === opt.value }]),
							onClick: ($event) => selectPreset(opt.value)
						}, [createBaseVNode("i", { class: normalizeClass(opt.icon) }, null, 2), createTextVNode(" " + toDisplayString(opt.label), 1)], 10, _hoisted_14);
					}), 64)), createBaseVNode("button", {
						class: normalizeClass(["seg-btn", { active: cutMode.value === "custom" }]),
						onClick: openCustomPicker,
						ref_key: "customBtnRef",
						ref: customBtnRef
					}, [..._cache[15] || (_cache[15] = [createBaseVNode("i", { class: "fa-solid fa-table-cells" }, null, -1), createTextVNode(" 自定义 ", -1)])], 2)])]),
					(openBlock(), createBlock(Teleport, { to: "body" }, [showCustomPicker.value ? (openBlock(), createElementBlock("div", {
						key: 0,
						class: "picker-overlay",
						onClick: _cache[5] || (_cache[5] = withModifiers(($event) => showCustomPicker.value = false, ["self"]))
					}, [createBaseVNode("div", {
						class: "picker-popup",
						style: normalizeStyle(pickerStyle.value)
					}, [createBaseVNode("div", _hoisted_15, [createBaseVNode("span", _hoisted_16, [hoverCol.value > 0 && hoverRow.value > 0 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						_cache[17] || (_cache[17] = createTextVNode(" 选择 ", -1)),
						createBaseVNode("strong", null, toDisplayString(hoverCol.value) + " × " + toDisplayString(hoverRow.value), 1),
						createTextVNode("（" + toDisplayString(hoverCol.value * hoverRow.value) + " 格） ", 1)
					], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode("移到格子选择切割方案")], 64))]), createBaseVNode("button", {
						class: "picker-close",
						onClick: _cache[3] || (_cache[3] = ($event) => showCustomPicker.value = false)
					}, [..._cache[18] || (_cache[18] = [createBaseVNode("i", { class: "fa-solid fa-xmark" }, null, -1)])])]), createBaseVNode("div", _hoisted_17, [(openBlock(), createElementBlock(Fragment, null, renderList(10, (row) => {
						return createBaseVNode("div", {
							key: row,
							class: "picker-row"
						}, [(openBlock(), createElementBlock(Fragment, null, renderList(10, (col) => {
							return createBaseVNode("div", {
								key: col,
								class: normalizeClass(["picker-cell", { highlighted: col <= hoverCol.value && row <= hoverRow.value }]),
								onMouseenter: ($event) => {
									hoverCol.value = col;
									hoverRow.value = row;
								},
								onMouseleave: _cache[4] || (_cache[4] = ($event) => {
									hoverCol.value = 0;
									hoverRow.value = 0;
								}),
								onClick: ($event) => confirmCustom(col, row)
							}, null, 42, _hoisted_18);
						}), 64))]);
					}), 64))])], 4)])) : createCommentVNode("", true)])),
					createBaseVNode("div", _hoisted_19, [_cache[19] || (_cache[19] = createBaseVNode("span", { class: "form-label" }, "圆角", -1)), createVNode(SliderInput_default, {
						modelValue: radius.value,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => radius.value = $event),
						label: "",
						unit: "px",
						min: 0,
						max: 80
					}, null, 8, ["modelValue"])]),
					createBaseVNode("div", _hoisted_20, [_cache[21] || (_cache[21] = createBaseVNode("span", { class: "form-label" }, "背景色", -1)), createBaseVNode("div", _hoisted_21, [(openBlock(), createElementBlock(Fragment, null, renderList(bgColors, (color) => {
						return openBlock(), createElementBlock(Fragment, { key: color.value }, [!color.isPicker ? (openBlock(), createElementBlock("button", {
							key: 0,
							class: normalizeClass(["color-swatch", { active: bgColor.value === color.value }]),
							style: normalizeStyle(color.value === "transparent" ? {
								background: "transparent",
								border: "1px dashed var(--border)"
							} : { background: color.value }),
							title: color.label,
							onClick: ($event) => bgColor.value = color.value
						}, [color.value === "transparent" ? (openBlock(), createElementBlock("i", _hoisted_23)) : createCommentVNode("", true)], 14, _hoisted_22)) : (openBlock(), createElementBlock("label", {
							key: 1,
							class: normalizeClass(["color-swatch", { active: bgColor.value === customBgColor.value }]),
							style: normalizeStyle({
								background: customBgColor.value,
								border: "1px solid var(--border)"
							}),
							title: color.label
						}, [_cache[20] || (_cache[20] = createBaseVNode("i", {
							class: "fa-solid fa-palette",
							style: {
								"font-size": "0.85rem",
								"color": "rgba(255,255,255,0.85)"
							}
						}, null, -1)), withDirectives(createBaseVNode("input", {
							type: "color",
							class: "palette-input",
							"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => customBgColor.value = $event),
							onInput: applyCustomBgColor
						}, null, 544), [[vModelText, customBgColor.value]])], 14, _hoisted_24))], 64);
					}), 64))])]),
					createBaseVNode("div", _hoisted_25, [_cache[22] || (_cache[22] = createBaseVNode("label", { class: "form-label" }, "输出格式", -1)), createBaseVNode("div", _hoisted_26, [(openBlock(), createElementBlock(Fragment, null, renderList([
						"png",
						"jpeg",
						"webp"
					], (fmt) => {
						return createBaseVNode("button", {
							key: fmt,
							class: normalizeClass(["seg-btn", { active: format.value === fmt }]),
							onClick: ($event) => format.value = fmt
						}, toDisplayString(fmt.toUpperCase()), 11, _hoisted_27);
					}), 64))])]),
					createBaseVNode("div", _hoisted_28, [createBaseVNode("label", _hoisted_29, [_cache[23] || (_cache[23] = createTextVNode(" 图片压缩 ", -1)), format.value === "png" ? (openBlock(), createElementBlock("span", _hoisted_30, "（PNG 无损，此项无效）")) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_31, [(openBlock(), createElementBlock(Fragment, null, renderList(compressionOptions, (opt) => {
						return createBaseVNode("button", {
							key: opt.value,
							class: normalizeClass(["seg-btn", { active: compression.value === opt.value }]),
							disabled: format.value === "png",
							onClick: ($event) => compression.value = opt.value
						}, toDisplayString(opt.label), 11, _hoisted_32);
					}), 64))])])
				])]),
				createBaseVNode("div", _hoisted_33, [createBaseVNode("div", _hoisted_34, [
					previewInfo.value ? (openBlock(), createElementBlock("div", _hoisted_35, [_cache[24] || (_cache[24] = createBaseVNode("i", { class: "fa-solid fa-scissors" }, null, -1)), createTextVNode(" " + toDisplayString(previewInfo.value), 1)])) : createCommentVNode("", true),
					!sourceImage.value ? (openBlock(), createElementBlock("div", _hoisted_36, [..._cache[25] || (_cache[25] = [createBaseVNode("span", { class: "empty-icon" }, "✂️", -1), createBaseVNode("span", null, "上传图片后预览切割效果", -1)])])) : createCommentVNode("", true),
					sourceImage.value ? (openBlock(), createElementBlock("div", {
						key: 2,
						class: "grid-preview",
						style: normalizeStyle({
							gridTemplateColumns: `repeat(${cutCols.value}, 1fr)`,
							gap: "2px",
							background: bgColor.value === "transparent" ? "transparent" : bgColor.value,
							aspectRatio: `${sourceImage.value.img.naturalWidth} / ${sourceImage.value.img.naturalHeight}`
						})
					}, [(openBlock(true), createElementBlock(Fragment, null, renderList(previewCells.value, (_, idx) => {
						return openBlock(), createElementBlock("div", {
							key: idx,
							class: "grid-cell",
							style: normalizeStyle({ borderRadius: radius.value + "px" })
						}, [createBaseVNode("canvas", {
							ref_for: true,
							ref_key: "cellCanvases",
							ref: cellCanvases,
							class: "cell-canvas"
						}, null, 512)], 4);
					}), 128))], 4)) : createCommentVNode("", true),
					createBaseVNode("button", {
						class: "btn btn-primary btn-block",
						disabled: !sourceImage.value,
						onClick: exportZip,
						style: { "margin-top": "auto" }
					}, [_cache[26] || (_cache[26] = createBaseVNode("i", { class: "fa-solid fa-file-zipper" }, null, -1)), createTextVNode(" " + toDisplayString(sourceImage.value ? `导出 ZIP（${cutCols.value} * ${cutRows.value} 张 ${format.value.toUpperCase()}）` : "请先上传图片"), 1)], 8, _hoisted_37)
				])])
			]);
		};
	}
}, [["__scopeId", "data-v-909cad5b"]]);
//#endregion
//#region src/App.vue
var _hoisted_1 = { class: "page-content" };
var _hoisted_2 = { class: "entry-grid" };
var _hoisted_3 = { class: "toast-container" };
//#endregion
//#region src/main.js
createApp(/* @__PURE__ */ _plugin_vue_export_helper_default({
	__name: "App",
	setup(__props) {
		const showVideo = /* @__PURE__ */ ref(false);
		const showImageSub = /* @__PURE__ */ ref(false);
		const showStitch = /* @__PURE__ */ ref(false);
		const showSeg = /* @__PURE__ */ ref(false);
		const { toasts, showToast } = useToast();
		const toastIcon = (type) => {
			if (type === "success") return "fa-solid fa-circle-check";
			if (type === "error") return "fa-solid fa-circle-exclamation";
			return "fa-solid fa-circle-info";
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", null, [_cache[14] || (_cache[14] = createBaseVNode("div", { class: "page-bg" }, null, -1)), createBaseVNode("main", _hoisted_1, [
				_cache[12] || (_cache[12] = createBaseVNode("h1", { class: "page-title" }, "我的工具箱", -1)),
				_cache[13] || (_cache[13] = createBaseVNode("p", { class: "page-desc" }, "视频字幕提取 · 图片字幕裁切 · 自由拼接", -1)),
				createBaseVNode("div", _hoisted_2, [
					createBaseVNode("button", {
						class: "entry-card",
						onClick: _cache[0] || (_cache[0] = ($event) => showVideo.value = true)
					}, [..._cache[8] || (_cache[8] = [createStaticVNode("<div class=\"entry-icon\" data-v-dc556da3><i class=\"fa-solid fa-film\" data-v-dc556da3></i></div><div class=\"entry-info\" data-v-dc556da3><span class=\"entry-title\" data-v-dc556da3>视频字幕提取</span><span class=\"entry-desc\" data-v-dc556da3>上传视频，框选字幕区域，自动逐帧提取拼接</span></div><i class=\"fa-solid fa-arrow-right entry-arrow\" data-v-dc556da3></i>", 3)])]),
					createBaseVNode("button", {
						class: "entry-card",
						onClick: _cache[1] || (_cache[1] = ($event) => showImageSub.value = true)
					}, [..._cache[9] || (_cache[9] = [createStaticVNode("<div class=\"entry-icon\" data-v-dc556da3><i class=\"fa-solid fa-scissors\" data-v-dc556da3></i></div><div class=\"entry-info\" data-v-dc556da3><span class=\"entry-title\" data-v-dc556da3>图片拼接字幕</span><span class=\"entry-desc\" data-v-dc556da3>拖动红/蓝裁剪线，精准裁切字幕区域并拼接</span></div><i class=\"fa-solid fa-arrow-right entry-arrow\" data-v-dc556da3></i>", 3)])]),
					createBaseVNode("button", {
						class: "entry-card",
						onClick: _cache[2] || (_cache[2] = ($event) => showStitch.value = true)
					}, [..._cache[10] || (_cache[10] = [createStaticVNode("<div class=\"entry-icon\" data-v-dc556da3><i class=\"fa-solid fa-table-cells\" data-v-dc556da3></i></div><div class=\"entry-info\" data-v-dc556da3><span class=\"entry-title\" data-v-dc556da3>图片拼接</span><span class=\"entry-desc\" data-v-dc556da3>水平 / 垂直 / 网格布局，自由组合多张图片</span></div><i class=\"fa-solid fa-arrow-right entry-arrow\" data-v-dc556da3></i>", 3)])]),
					createBaseVNode("button", {
						class: "entry-card",
						onClick: _cache[3] || (_cache[3] = ($event) => showSeg.value = true)
					}, [..._cache[11] || (_cache[11] = [createStaticVNode("<div class=\"entry-icon\" data-v-dc556da3><i class=\"fa-solid fa-grip\" data-v-dc556da3></i></div><div class=\"entry-info\" data-v-dc556da3><span class=\"entry-title\" data-v-dc556da3>智能切片（九宫格）</span><span class=\"entry-desc\" data-v-dc556da3>把一张大图智能切成多张，用于 Instagram / 小红书 九宫格</span></div><i class=\"fa-solid fa-arrow-right entry-arrow\" data-v-dc556da3></i>", 3)])])
				]),
				(openBlock(), createBlock(Teleport, { to: "body" }, [createBaseVNode("div", _hoisted_3, [createVNode(TransitionGroup, { name: "toast" }, {
					default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(toasts), (toast) => {
						return openBlock(), createElementBlock("div", {
							key: toast.id,
							class: normalizeClass(["toast", [toast.type, { leaving: toast.leaving }]])
						}, [createBaseVNode("i", { class: normalizeClass(toastIcon(toast.type)) }, null, 2), createTextVNode(" " + toDisplayString(toast.message), 1)], 2);
					}), 128))]),
					_: 1
				})])])),
				createVNode(AppModal_default, {
					modelValue: showVideo.value,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => showVideo.value = $event),
					title: "视频字幕提取",
					icon: "fa-solid fa-film"
				}, {
					default: withCtx(() => [showVideo.value ? (openBlock(), createBlock(VideoSubtitle_default, { key: 0 })) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(AppModal_default, {
					modelValue: showImageSub.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => showImageSub.value = $event),
					title: "图片截取字幕",
					icon: "fa-solid fa-scissors"
				}, {
					default: withCtx(() => [showImageSub.value ? (openBlock(), createBlock(ImageSubtitle_default, { key: 0 })) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(AppModal_default, {
					modelValue: showStitch.value,
					"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => showStitch.value = $event),
					title: "图片拼接",
					icon: "fa-solid fa-table-cells"
				}, {
					default: withCtx(() => [showStitch.value ? (openBlock(), createBlock(ImageStitch_default, { key: 0 })) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(AppModal_default, {
					modelValue: showSeg.value,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => showSeg.value = $event),
					title: "智能切片",
					icon: "fa-solid fa-grip"
				}, {
					default: withCtx(() => [showSeg.value ? (openBlock(), createBlock(ImageSegmentation_default, { key: 0 })) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"])
			])]);
		};
	}
}, [["__scopeId", "data-v-dc556da3"]])).mount("#app");
//#endregion
export { __require as n, __commonJSMin as t };
