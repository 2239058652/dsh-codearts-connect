window.__ModuleLoader__.load({
  id: "dsh-codearts-connect",
  factory(require) {
    var module = { exports: {} };
    var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/catalog.ts
/**
* 剥掉模型名尾巴上的标记：` · x0.18`、` · x0.00 · 福利`、`(福利)`、`(免费)`、
* `(x0.18)` 等（兼容旧格式）。
*/
function stripModelSuffixes(name) {
	let base = name;
	for (;;) {
		const next = base.replace(/\s*·\s*(?:x\d+(?:\.\d+)?|(?:限时)?(?:免费|福利)(?:\s+x\d+(?:\.\d+)?)?)\s*$/, "");
		if (next === base) break;
		base = next;
	}
	return base.replace(/\s*[（(]\s*(?:(?:免费|福利)(?:\s+x\d+(?:\.\d+)?)?|x\d+(?:\.\d+)?)\s*[)）]\s*$/, "").trim();
}
//#endregion
//#region \0dsh-css:C:\Users\22390\Desktop\dsh-plugins\dsh-codearts-connect\src\client\CodeArtsPluginCard.module.css.mjs
const css = ".aK3XzG_card{border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);max-width:720px}.aK3XzG_header{align-items:flex-start;gap:12px;padding:14px 16px;display:flex}.aK3XzG_headText{flex-direction:column;flex:1;gap:6px;min-width:0;display:flex}.aK3XzG_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:22px}.aK3XzG_desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.aK3XzG_statusLine{color:var(--dsw-alias-label-primary);align-items:center;gap:6px;font-size:14px;font-weight:500;line-height:22px;display:inline-flex}.aK3XzG_meta{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px}.aK3XzG_body{border-top:.5px solid var(--dsw-alias-border-l2);margin:0 16px;padding:4px 0 16px}.aK3XzG_tabs{margin-top:12px}.aK3XzG_tabPanel{padding-top:2px}.aK3XzG_accountToolbar{gap:8px;margin-top:12px;display:flex}.aK3XzG_accountToolbar>*{flex:1}.aK3XzG_manualForm{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);margin-top:12px;padding:12px}.aK3XzG_accountCard{flex-direction:column;gap:10px;margin-top:12px;display:flex}.aK3XzG_accountEntry{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2)}.aK3XzG_accountRow{align-items:center;gap:10px;padding:12px;display:flex}.aK3XzG_claimAllRow{border-top:.5px solid var(--dsw-alias-border-l2);justify-content:flex-end;padding:10px 12px 0;display:flex}.aK3XzG_avatar{background:var(--dsw-alias-bg-layer-3);width:32px;height:32px;color:var(--dsw-alias-label-primary);border-radius:50%;flex:none;justify-content:center;align-items:center;font-size:14px;font-weight:600;display:inline-flex}.aK3XzG_accountInfo{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.aK3XzG_accountNameRow{align-items:center;gap:6px;min-width:0;display:flex}.aK3XzG_accountName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600;line-height:20px;overflow:hidden}.aK3XzG_accountRowActions{flex:none;gap:6px;display:flex}.aK3XzG_accountHint{color:var(--dsw-alias-label-tertiary);margin:0;padding:0 12px 12px;font-size:12px;line-height:18px}.aK3XzG_creditBlock{border-top:.5px solid var(--dsw-alias-border-l2);padding:12px}.aK3XzG_balanceRow{flex-wrap:wrap;align-items:baseline;gap:6px;display:flex}.aK3XzG_balance{color:var(--dsw-alias-label-primary);letter-spacing:-.02em;font-variant-numeric:tabular-nums;font-size:28px;font-weight:600;line-height:34px}.aK3XzG_balanceUnit{color:var(--dsw-alias-label-secondary);font-size:12px}.aK3XzG_balanceMeta{color:var(--dsw-alias-label-tertiary);margin-left:2px;font-size:12px}.aK3XzG_updated{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;margin-left:auto;font-size:12px}.aK3XzG_creditRows{flex-direction:column;gap:4px;margin-top:8px;display:flex}.aK3XzG_creditRow{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;justify-content:space-between;align-items:baseline;gap:12px;font-size:12px;line-height:18px;display:flex}.aK3XzG_usageBar{background:var(--dsw-alias-border-l2);border-radius:2px;height:4px;margin-top:4px;display:block;overflow:hidden}.aK3XzG_usageFill{background:var(--dsw-alias-brand-primary);border-radius:2px;height:100%;transition:width .2s;display:block}.aK3XzG_expiryRow{margin-top:2px}.aK3XzG_expiryLabel{color:var(--dsw-alias-state-warn-label)}.aK3XzG_bar{background:var(--dsw-alias-bg-layer-3);border-radius:2px;height:4px;margin-top:6px;display:block;overflow:hidden}.aK3XzG_barFill{background:var(--dsw-alias-state-warn-primary);border-radius:2px;height:100%;display:block}.aK3XzG_creditLink{margin-top:8px;display:inline-block}.aK3XzG_creditFooter{border-top:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:8px;margin-top:12px;padding-top:10px;display:flex}.aK3XzG_creditHint{color:var(--dsw-alias-label-tertiary);margin:8px 0 0;font-size:12px;line-height:18px}.aK3XzG_section{margin-top:16px}.aK3XzG_sectionHead{justify-content:space-between;align-items:baseline;gap:12px;display:flex}.aK3XzG_sectionLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:500}.aK3XzG_count{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex:none;font-size:12px}.aK3XzG_hint{color:var(--dsw-alias-label-secondary);margin:8px 0 0;font-size:13px;line-height:20px}.aK3XzG_error{color:var(--dsw-alias-state-error-primary);margin:10px 0 0;font-size:13px;line-height:20px}.aK3XzG_actions{flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px;display:flex}.aK3XzG_danger{color:var(--dsw-alias-state-error-primary)}.aK3XzG_link{appearance:none;color:var(--dsw-alias-brand-text);font:inherit;text-align:left;word-break:break-all;cursor:pointer;background:0 0;border:none;padding:0;font-size:12px}.aK3XzG_link:hover{text-decoration:underline}.aK3XzG_choices{flex-direction:column;gap:2px;margin-top:8px;display:flex}.aK3XzG_choiceRow{border-radius:var(--dsw-radius-sm);align-items:center;gap:8px;margin:0 -6px;padding:5px 6px;display:flex}.aK3XzG_choiceRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.aK3XzG_modelChart{flex-direction:column;gap:2px;margin-top:8px;display:flex}.aK3XzG_modelRow{font-variant-numeric:tabular-nums;grid-template-columns:minmax(0,1.2fr) minmax(48px,1fr) 56px 52px 64px;align-items:center;gap:8px;padding:4px 0;display:grid}.aK3XzG_modelName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.aK3XzG_modelTrack{background:var(--dsw-alias-border-l2);border-radius:4px;height:8px;display:block;overflow:hidden}.aK3XzG_modelFill{background:var(--dsw-alias-brand-primary);border-radius:4px;height:100%;transition:width .16s;display:block}.aK3XzG_modelTokens,.aK3XzG_modelShare,.aK3XzG_modelRequests{color:var(--dsw-alias-label-secondary);text-align:right;white-space:nowrap;font-size:11px;line-height:16px}.aK3XzG_modelRequests{color:var(--dsw-alias-label-tertiary)}.aK3XzG_check{flex:1;min-width:0}.aK3XzG_check>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.aK3XzG_manual{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);margin-top:12px;padding:0 12px}.aK3XzG_manual[open]{padding-bottom:12px}.aK3XzG_manualSummary{color:var(--dsw-alias-label-secondary);cursor:pointer;align-items:center;gap:6px;padding:9px 0;font-size:13px;list-style:none;display:flex}.aK3XzG_manualSummary::-webkit-details-marker{display:none}.aK3XzG_field{flex-direction:column;gap:5px;margin-top:10px;display:flex}.aK3XzG_fieldLabel{color:var(--dsw-alias-label-tertiary);font-size:12px}.aK3XzG_area{box-sizing:border-box;resize:vertical;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);padding:6px 8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:20px}.aK3XzG_area::placeholder{color:var(--dsw-alias-label-dimmed)}.aK3XzG_area:focus{border-color:var(--dsw-alias-state-business-primary);outline:none}.aK3XzG_accountModeRow{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2);justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;display:flex}.aK3XzG_accountModeText{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.aK3XzG_dialogOverlay{z-index:9999;background:#00000073;justify-content:center;align-items:center;padding:16px;display:flex;position:fixed;inset:0}.aK3XzG_dialog{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-settings-card-fill);width:min(560px,100%);max-height:calc(100vh - 32px);padding:16px;overflow:auto;box-shadow:0 16px 40px #00000047}.aK3XzG_dialogHead{justify-content:space-between;align-items:center;gap:12px;display:flex}.aK3XzG_dialogTitle{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:22px}.aK3XzG_dialogHint{color:var(--dsw-alias-label-secondary);margin:10px 0 0;font-size:13px;line-height:20px}.aK3XzG_dialogUrl{box-sizing:border-box;resize:vertical;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);word-break:break-all;margin-top:10px;padding:6px 8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:18px}.aK3XzG_dialogUrl:focus{border-color:var(--dsw-alias-state-business-primary);outline:none}.aK3XzG_dialogActions{justify-content:flex-end;margin-top:12px;display:flex}";
const tagId = "dsh-codearts-connect/CodeArtsPluginCard.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
	const tag = document.createElement("style");
	tag.dataset.plugin = "dsh-codearts-connect";
	tag.dataset.pluginCss = tagId;
	tag.textContent = css;
	document.head.appendChild(tag);
}
var CodeArtsPluginCard_module_css_default = {
	"dialogHead": "aK3XzG_dialogHead",
	"barFill": "aK3XzG_barFill",
	"choiceRow": "aK3XzG_choiceRow",
	"statusLine": "aK3XzG_statusLine",
	"balanceRow": "aK3XzG_balanceRow",
	"tabs": "aK3XzG_tabs",
	"card": "aK3XzG_card",
	"creditHint": "aK3XzG_creditHint",
	"modelRequests": "aK3XzG_modelRequests",
	"name": "aK3XzG_name",
	"modelChart": "aK3XzG_modelChart",
	"accountRow": "aK3XzG_accountRow",
	"expiryRow": "aK3XzG_expiryRow",
	"avatar": "aK3XzG_avatar",
	"dialogUrl": "aK3XzG_dialogUrl",
	"accountHint": "aK3XzG_accountHint",
	"creditFooter": "aK3XzG_creditFooter",
	"count": "aK3XzG_count",
	"body": "aK3XzG_body",
	"hint": "aK3XzG_hint",
	"sectionHead": "aK3XzG_sectionHead",
	"creditLink": "aK3XzG_creditLink",
	"accountName": "aK3XzG_accountName",
	"modelName": "aK3XzG_modelName",
	"expiryLabel": "aK3XzG_expiryLabel",
	"link": "aK3XzG_link",
	"accountModeRow": "aK3XzG_accountModeRow",
	"accountEntry": "aK3XzG_accountEntry",
	"updated": "aK3XzG_updated",
	"accountRowActions": "aK3XzG_accountRowActions",
	"modelRow": "aK3XzG_modelRow",
	"dialog": "aK3XzG_dialog",
	"accountToolbar": "aK3XzG_accountToolbar",
	"balanceMeta": "aK3XzG_balanceMeta",
	"manual": "aK3XzG_manual",
	"actions": "aK3XzG_actions",
	"dialogTitle": "aK3XzG_dialogTitle",
	"creditRows": "aK3XzG_creditRows",
	"balanceUnit": "aK3XzG_balanceUnit",
	"dialogActions": "aK3XzG_dialogActions",
	"creditBlock": "aK3XzG_creditBlock",
	"header": "aK3XzG_header",
	"modelFill": "aK3XzG_modelFill",
	"area": "aK3XzG_area",
	"accountNameRow": "aK3XzG_accountNameRow",
	"usageFill": "aK3XzG_usageFill",
	"dialogOverlay": "aK3XzG_dialogOverlay",
	"error": "aK3XzG_error",
	"creditRow": "aK3XzG_creditRow",
	"danger": "aK3XzG_danger",
	"modelTrack": "aK3XzG_modelTrack",
	"dialogHint": "aK3XzG_dialogHint",
	"balance": "aK3XzG_balance",
	"bar": "aK3XzG_bar",
	"choices": "aK3XzG_choices",
	"usageBar": "aK3XzG_usageBar",
	"modelTokens": "aK3XzG_modelTokens",
	"accountCard": "aK3XzG_accountCard",
	"claimAllRow": "aK3XzG_claimAllRow",
	"field": "aK3XzG_field",
	"section": "aK3XzG_section",
	"modelShare": "aK3XzG_modelShare",
	"manualForm": "aK3XzG_manualForm",
	"accountInfo": "aK3XzG_accountInfo",
	"headText": "aK3XzG_headText",
	"accountModeText": "aK3XzG_accountModeText",
	"desc": "aK3XzG_desc",
	"tabPanel": "aK3XzG_tabPanel",
	"sectionLabel": "aK3XzG_sectionLabel",
	"meta": "aK3XzG_meta",
	"manualSummary": "aK3XzG_manualSummary",
	"check": "aK3XzG_check",
	"fieldLabel": "aK3XzG_fieldLabel"
};
//#endregion
//#region src/client/CodeArtsPluginCard.tsx
function formatStored(ts) {
	if (ts === void 0 || !Number.isFinite(ts)) return "";
	try {
		return new Date(ts).toLocaleString();
	} catch {
		return String(ts);
	}
}
/** 目录里的 name 自带「 · x0.18 · 福利」尾巴，这里已经用 Tag 表达了就别重复。 */
function modelName(choice) {
	return stripModelSuffixes(choice.name);
}
/** 官方用量明细页。 */
const OFFICIAL_USAGE_URL = "https://codearts.huaweicloud.com/portal/settings/personal-usage";
/** token 数按人类习惯缩写：12345 -> 12.3k。 */
function formatTokens(value) {
	if (!Number.isFinite(value)) return "0";
	if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
	return String(Math.round(value));
}
function formatCount(value) {
	return Number.isFinite(value) ? String(Math.round(value)) : "0";
}
/** 积分/token 千分位格式化（2000 → "2,000"）。 */
function formatCredits(value) {
	return Number.isFinite(value) ? new Intl.NumberFormat().format(Math.round(value)) : "0";
}
/** 批量领取的 claimingId 哨兵（真实账号 id 不会等于它）。 */
const CLAIM_ALL = "*";
/** 一次领取操作的文案：优先用后端逐号结果，老后端只回一条时按 id 归位。 */
function claimMessagesOf(data, accountIds, t) {
	const out = {};
	if (data === null) return out;
	const results = data.results ?? [];
	if (results.length > 0) {
		for (const result of results) if (result.id !== void 0) out[result.id] = claimText(result, t);
		return out;
	}
	for (const id of accountIds) out[id] = claimText(data, t);
	return out;
}
/** 开关的兜底值：后端没这条路由（老版本）时按「都显示」渲染，与原有行为一致。 */
const DOCK_DEFAULT = {
	credits: true,
	queue: true
};
/** 一个 Tab 面板；未选中的用 hidden 留在 DOM 里，草稿和滚动位置都别丢。 */
function TabPanel({ id, labelledBy, active, children }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		role: "tabpanel",
		id,
		"aria-labelledby": labelledBy,
		hidden: !active,
		tabIndex: 0,
		className: CodeArtsPluginCard_module_css_default.tabPanel,
		children
	});
}
/**
* 领取结果 → 文案。
*
* 本地状态（claimed/already/没有这个活动）用界面自己的话；只有 failed 才透出
* 上游给的 reason —— 那句往往才是排障要的东西（签名失败、404、非 JSON…）。
*/
function claimText(data, t) {
	if (data?.claimed === true) return t("claimDone", { amount: formatCredits(data.amount ?? 0) });
	if (data?.state === "already") return t("claimAlready");
	if (data?.state === "unavailable") return t("claimUnavailable");
	return t("claimFailed", { message: typeof data?.message === "string" && data.message !== "" ? data.message : "request failed" });
}
function formatClock$1(ts) {
	if (ts === void 0 || !Number.isFinite(ts)) return "";
	try {
		return new Date(ts).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return "";
	}
}
/** 后端拿不到积分时的几种「账号本身不可用」原因，换成用户能懂的一句话。 */
function creditErrorText(message, t) {
	switch (message) {
		case "account needs sign-in":
		case "no usable credential":
		case "account not found":
		case "account no longer stored": return t("creditsNeedSignIn");
		default: return message;
	}
}
/**
* 账号卡片里的积分块。
*
* 积分并进账号页：视线从上到下就是「谁登录着 → 这个号还有多少积分 → 去签到」。
* 拉不到时只把原因留在块里，别把上面的账号一起拖没。
*/
function CreditBlock({ credits, error, t, onClaim, claiming, claimResult, justClaimed }) {
	if (credits === void 0 && error === void 0) return null;
	const c = credits?.credits;
	const claimedToday = justClaimed || credits?.welfare?.claimedToday === true;
	const expiring = c?.total.expiring ?? 0;
	const expiringRatio = c !== void 0 && c.total.total > 0 ? Math.min(100, Math.max(0, expiring / c.total.total * 100)) : 0;
	const usedRatio = c !== void 0 && c.total.total > 0 ? Math.min(100, Math.max(0, c.total.used / c.total.total * 100)) : 0;
	const usedLabel = c === void 0 ? "" : t("creditsUsedOfTotal", {
		used: formatCredits(c.total.used),
		total: formatCredits(c.total.total)
	});
	const updated = formatClock$1(c?.fetchedAt);
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: CodeArtsPluginCard_module_css_default.creditBlock,
		children: [
			c !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CodeArtsPluginCard_module_css_default.balanceRow,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.balance,
							children: formatCredits(c.total.remain)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.balanceUnit,
							children: t("creditsUnit")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.balanceMeta,
							children: t("creditsUsed", { used: formatCredits(c.total.used) })
						}),
						updated !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.updated,
							children: t("creditsUpdated", { time: updated })
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CodeArtsPluginCard_module_css_default.creditRows,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CodeArtsPluginCard_module_css_default.creditRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("creditsTotal", { total: formatCredits(c.total.total) }) }), c.periodEnd !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("creditsReset", { date: c.periodEnd }) })]
						}),
						c.total.total > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.usageBar,
							role: "progressbar",
							"aria-valuemin": 0,
							"aria-valuemax": c.total.total,
							"aria-valuenow": Math.min(c.total.used, c.total.total),
							"aria-label": usedLabel,
							title: usedLabel,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: CodeArtsPluginCard_module_css_default.usageFill,
								style: { width: `${usedRatio}%` }
							})
						}),
						expiring > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CodeArtsPluginCard_module_css_default.expiryRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: CodeArtsPluginCard_module_css_default.creditRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: CodeArtsPluginCard_module_css_default.expiryLabel,
									children: t("creditsExpiringShort", { expiring: formatCredits(expiring) })
								}), c.periodEnd !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("creditsReset", { date: c.periodEnd }) })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: CodeArtsPluginCard_module_css_default.bar,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: CodeArtsPluginCard_module_css_default.barFill,
									style: { width: `${expiringRatio}%` }
								})
							})]
						}),
						credits?.tokens !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: CodeArtsPluginCard_module_css_default.creditRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("creditsTokensToday", {
								used: formatCredits(credits.tokens.dailyUsed),
								limit: formatCredits(credits.tokens.dailyLimit)
							}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("creditsTokensBalance", { balance: formatCredits(credits.tokens.balance) }) })]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
					className: `${CodeArtsPluginCard_module_css_default.link} ${CodeArtsPluginCard_module_css_default.creditLink}`,
					href: c.packageUrl ?? OFFICIAL_USAGE_URL,
					target: "_blank",
					rel: "noreferrer",
					children: t("creditsDetailLink")
				})
			] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: CodeArtsPluginCard_module_css_default.creditHint,
				children: t("creditsUnavailable", { message: creditErrorText(error ?? "", t) })
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.creditFooter,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					disabled: claiming || claimedToday,
					onClick: onClaim,
					children: claiming ? t("claimPending") : claimedToday ? t("claimButtonDone") : t("claimButton")
				}), c !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
					tone: "quiet",
					children: c.planName
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: CodeArtsPluginCard_module_css_default.creditHint,
				children: claimResult ?? t("claimHint")
			})
		]
	});
}
/** 登录前的手动填 token 表单；登录后从「粘贴 Token 添加」展开的也是这一份。 */
function ManualTokenForm({ t, token, label, busy, onToken, onLabel, onSubmit }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
		onSubmit,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.field,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
					className: CodeArtsPluginCard_module_css_default.fieldLabel,
					htmlFor: "codearts-token",
					children: t("tokenLabel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					id: "codearts-token",
					className: CodeArtsPluginCard_module_css_default.area,
					value: token,
					onChange: (e) => onToken(e.target.value),
					placeholder: t("tokenPlaceholder"),
					rows: 4
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.field,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
					className: CodeArtsPluginCard_module_css_default.fieldLabel,
					htmlFor: "codearts-label",
					children: t("labelLabel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
					id: "codearts-label",
					value: label,
					onChange: (e) => onLabel(e.target.value),
					placeholder: t("labelPlaceholder")
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: CodeArtsPluginCard_module_css_default.actions,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					size: "sm",
					type: "submit",
					disabled: busy || token.trim() === "",
					children: t("saveToken")
				})
			})
		]
	});
}
/**
* 横向条形列表：名称 / 条 / token / 占比 / 请求数。
*
* 条长按「占组内总量的比例」画（不是按最大值归一化），所以几条加起来就是全部。
* token 全 0 的日子（只有请求数、没收到 usage 帧）退回按请求数画。
*/
function UsageBars({ rows, t }) {
	const tokenMode = rows.some((row) => row.totals.totalTokens > 0);
	const valueOf = (row) => tokenMode ? row.totals.totalTokens : row.totals.requests;
	const sum = rows.reduce((total, row) => total + valueOf(row), 0);
	const top = [...rows].sort((a, b) => valueOf(b) - valueOf(a)).slice(0, 5);
	if (top.length === 0) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: CodeArtsPluginCard_module_css_default.modelChart,
		children: top.map((row) => {
			const value = valueOf(row);
			const share = sum > 0 ? value / sum * 100 : 0;
			const detail = [t("usageRequests", { n: formatCount(row.totals.requests) }), t("usageTokens", {
				prompt: formatTokens(row.totals.promptTokens),
				completion: formatTokens(row.totals.completionTokens)
			})].join(" · ");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.modelRow,
				title: `${row.label} · ${detail}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.modelName,
						children: row.label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.modelTrack,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.modelFill,
							style: { width: `${value > 0 ? Math.max(share, 1.5) : 0}%` }
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.modelTokens,
						children: tokenMode ? formatTokens(value) : formatCount(value)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: CodeArtsPluginCard_module_css_default.modelShare,
						children: [share.toFixed(1), "%"]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.modelRequests,
						children: t("usageRequestCount", { n: formatCount(row.totals.requests) })
					})
				]
			}, row.id);
		})
	});
}
/**
* 用量区块。
*
* 只展示**本机经插件发出**的请求（不等于账号总额度 —— 账号额度见上方积分区块）；
* 会话槽位是真事实 —— 每账号 3 个并发会话、被占时要等约 52 秒才释放，这也正是
* 「打断后重新提问要等」的原因。
*/
function UsageSection({ usage, accounts, t }) {
	const total = usage.today.requests;
	const stateLabel = {
		ok: t("usageStateOk"),
		capped: t("usageStateCapped"),
		cooling: t("usageStateCooling"),
		disabled: t("usageStateDisabled")
	};
	const nameOf = new Map(accounts.map((account) => [account.id, account.label?.trim() || account.userName?.trim() || account.id]));
	const accountRows = Object.entries(usage.byAccountToday).map(([id, totals]) => ({
		id,
		label: nameOf.get(id) ?? id,
		totals
	}));
	const modelRows = usage.byModelToday.map((entry) => ({
		id: entry.id,
		label: entry.id.split(" · ")[0],
		totals: entry.totals
	}));
	const hasUsage = usage.allTime.requests > 0 || total > 0;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: CodeArtsPluginCard_module_css_default.section,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.sectionHead,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: CodeArtsPluginCard_module_css_default.sectionLabel,
					children: t("usageTitle")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: CodeArtsPluginCard_module_css_default.count,
					children: t("usageRequests", { n: formatCount(total) })
				})]
			}),
			!hasUsage ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: CodeArtsPluginCard_module_css_default.hint,
				children: t("usageEmpty")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CodeArtsPluginCard_module_css_default.choiceRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.name,
						children: t("usageTodayTotal")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: CodeArtsPluginCard_module_css_default.meta,
						children: [
							t("usageRequests", { n: formatCount(total) }),
							" · ",
							t("usageTokens", {
								prompt: formatTokens(usage.today.promptTokens),
								completion: formatTokens(usage.today.completionTokens)
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CodeArtsPluginCard_module_css_default.choiceRow,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.name,
						children: t("usageLast30")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: CodeArtsPluginCard_module_css_default.meta,
						children: [
							t("usageRequests", { n: formatCount(usage.last30.requests) }),
							" · ",
							t("usageTokens", {
								prompt: formatTokens(usage.last30.promptTokens),
								completion: formatTokens(usage.last30.completionTokens)
							})
						]
					})]
				}),
				accounts.length > 1 && accountRows.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: CodeArtsPluginCard_module_css_default.hint,
					children: t("usageByAccount")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageBars, {
					rows: accountRows,
					t
				})] }),
				modelRows.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: CodeArtsPluginCard_module_css_default.hint,
					children: t("usageByModel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageBars, {
					rows: modelRows,
					t
				})] })
			] }),
			usage.slots.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: CodeArtsPluginCard_module_css_default.hint,
				children: t("usageSlots")
			}), usage.slots.map((slot) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.choiceRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: CodeArtsPluginCard_module_css_default.name,
					children: `${slot.active}/${slot.max}`
				}), slot.state === "ok" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
					tone: "success",
					children: stateLabel.ok
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, { children: stateLabel[slot.state] })]
			}, slot.id))] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
				className: CodeArtsPluginCard_module_css_default.hint,
				children: [
					t("usageNoQuota"),
					" ",
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						className: CodeArtsPluginCard_module_css_default.link,
						href: OFFICIAL_USAGE_URL,
						target: "_blank",
						rel: "noreferrer",
						children: OFFICIAL_USAGE_URL
					})
				]
			})
		]
	});
}
/**
* 复制文本。优先 Clipboard API；不可用（非安全上下文/老浏览器）时退回
* textarea + execCommand，保证「复制授权链接」在任何宿主里都能用。
*/
async function copyText(text) {
	try {
		if (typeof navigator !== "undefined" && navigator.clipboard !== void 0) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {}
	try {
		if (typeof document === "undefined") return false;
		const area = document.createElement("textarea");
		area.value = text;
		area.setAttribute("readonly", "");
		area.style.position = "fixed";
		area.style.top = "-1000px";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand("copy");
		area.remove();
		return ok;
	} catch {
		return false;
	}
}
/**
* 「添加账号」弹框：只做一件事 —— 把授权链接摆到能复制的地方。
*
* 不在当前浏览器里自动打开是刻意的：华为云已有登录态时，授权页会直接发同一个
* 账号的 code，用户还没机会复制就已经「登录成功」，于是永远加不了第二个号。
* 复制到无痕窗口/另一个浏览器再授权，才能换一个身份。
*/
function AddAccountDialog({ url, t, onClose }) {
	const [copyState, setCopyState] = (0, react.useState)("idle");
	(0, react.useEffect)(() => {
		setCopyState("idle");
	}, [url]);
	const copy = async () => {
		setCopyState(await copyText(url) ? "done" : "failed");
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: CodeArtsPluginCard_module_css_default.dialogOverlay,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: CodeArtsPluginCard_module_css_default.dialog,
			role: "dialog",
			"aria-modal": "true",
			"aria-label": t("addAccountDialogTitle"),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CodeArtsPluginCard_module_css_default.dialogHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: CodeArtsPluginCard_module_css_default.dialogTitle,
						children: t("addAccountDialogTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						size: "sm",
						onClick: onClose,
						children: t("addAccountDialogClose")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: CodeArtsPluginCard_module_css_default.dialogHint,
					children: t("addAccountDialogHint")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					className: CodeArtsPluginCard_module_css_default.dialogUrl,
					readOnly: true,
					rows: 3,
					value: url,
					onFocus: (event) => event.currentTarget.select()
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: CodeArtsPluginCard_module_css_default.dialogHint,
					children: t("addAccountDialogWaiting")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: CodeArtsPluginCard_module_css_default.dialogActions,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						onClick: () => void copy(),
						children: copyState === "done" ? t("addAccountDialogCopied") : copyState === "failed" ? t("addAccountDialogCopyFailed") : t("addAccountDialogCopy")
					})
				})
			]
		})
	});
}
function CodeArtsPluginCard({ t }) {
	const [status, setStatus] = (0, react.useState)(null);
	const [token, setToken] = (0, react.useState)("");
	const [label, setLabel] = (0, react.useState)("");
	const [busy, setBusy] = (0, react.useState)(false);
	const [msg, setMsg] = (0, react.useState)(null);
	const [loginUrl, setLoginUrl] = (0, react.useState)(null);
	/** 授权链接弹框是否打开。关掉后链接仍留在卡片上，登录轮询继续。 */
	const [loginDialogOpen, setLoginDialogOpen] = (0, react.useState)(false);
	const [loginPending, setLoginPending] = (0, react.useState)(false);
	const [selection, setSelection] = (0, react.useState)(null);
	const [draft, setDraft] = (0, react.useState)([]);
	const [savingModels, setSavingModels] = (0, react.useState)(false);
	const [savedModels, setSavedModels] = (0, react.useState)(false);
	const [modelError, setModelError] = (0, react.useState)(null);
	const [refreshing, setRefreshing] = (0, react.useState)(false);
	const [refreshMsg, setRefreshMsg] = (0, react.useState)(null);
	/** 正在领取的账号 id；批量领取时是 CLAIM_ALL。null 表示没有在飞。 */
	const [claimingId, setClaimingId] = (0, react.useState)(null);
	/** 逐账号的领取结果文案。 */
	const [claimResults, setClaimResults] = (0, react.useState)({});
	/** 这次会话里刚领成的账号（快照刷新前先把按钮改成「今日已领」）。 */
	const [claimedIds, setClaimedIds] = (0, react.useState)({});
	const [manualOpen, setManualOpen] = (0, react.useState)(false);
	const [tab, setTab] = (0, react.useState)("accounts");
	const tabIdBase = (0, react.useId)();
	/** 对话底部那一行的两个显隐开关（后端 = 插件 settings 里的两个布尔）。 */
	const [dock, setDock] = (0, react.useState)(DOCK_DEFAULT);
	const [dockWritable, setDockWritable] = (0, react.useState)(false);
	const [dockSaving, setDockSaving] = (0, react.useState)(false);
	const [dockError, setDockError] = (0, react.useState)(null);
	async function refreshDock() {
		try {
			const res = await fetch("/api/codearts/dock", { headers: { Accept: "application/json" } });
			if (!res.ok) return;
			const data = await res.json();
			if (data.dock !== void 0) setDock(data.dock);
			setDockWritable(data.writable === true);
		} catch {}
	}
	/**
	* 改一个开关：先按新值渲染，写失败再退回去。
	*
	* 这里不像模型勾选那样攒草稿再点保存 —— 只有两个布尔，攒草稿反而让用户猜
	* 「我刚才那一下到底生效没有」。
	*/
	async function toggleDock(key, on) {
		const previous = dock;
		setDock({
			...dock,
			[key]: on
		});
		setDockSaving(true);
		setDockError(null);
		try {
			const res = await fetch("/api/codearts/dock", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify({ [key]: on })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(typeof data.error === "string" ? data.error : `HTTP ${res.status}`);
			}
			const data = await res.json();
			if (data.dock !== void 0) setDock(data.dock);
		} catch (error) {
			setDock(previous);
			setDockError(error instanceof Error ? error.message : String(error));
		} finally {
			setDockSaving(false);
		}
	}
	/**
	* 领每日签到积分。给 id 就只领那个号，不给就逐个号都领一遍。
	*
	* 除了这一次刚领成，「今天已领」都来自上游的福利活动状态（积分快照里的 welfare），
	* 所以刷新、重开窗口都不会把按钮说错。领完不记日期：去重在上游按天做。
	*/
	async function claim(accountId) {
		const ids = accountId === void 0 ? (status?.accounts ?? []).map((account) => account.id) : [accountId];
		setClaimingId(accountId ?? CLAIM_ALL);
		try {
			const data = await (await fetch("/api/codearts/claim", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(accountId === void 0 ? {} : { id: accountId })
			})).json().catch(() => null);
			const messages = claimMessagesOf(data, ids, t);
			if (Object.keys(messages).length > 0) setClaimResults((prev) => ({
				...prev,
				...messages
			}));
			const won = data?.results !== void 0 && data.results.length > 0 ? data.results.filter((result) => result.claimed === true && result.id !== void 0) : data?.claimed === true ? ids.map((id) => ({ id })) : [];
			if (won.length > 0) {
				setClaimedIds((prev) => {
					const next = { ...prev };
					for (const result of won) next[result.id] = true;
					return next;
				});
				await refresh();
			}
		} catch (error) {
			const message = t("claimFailed", { message: error instanceof Error ? error.message : String(error) });
			setClaimResults((prev) => {
				const next = { ...prev };
				for (const id of ids) next[id] = message;
				return next;
			});
		} finally {
			setClaimingId(null);
		}
	}
	async function refresh() {
		try {
			const data = await (await fetch("/api/codearts/status", { headers: { Accept: "application/json" } })).json();
			setStatus(data);
		} catch {
			setStatus({
				status: "signed-out",
				models: [],
				accounts: []
			});
		}
	}
	async function refreshSelection() {
		try {
			const data = await (await fetch("/api/codearts/enabled-models", { headers: { Accept: "application/json" } })).json();
			setSelection(data.selection);
			setDraft(data.selection.choices.filter((c) => c.enabled).map((c) => c.id));
			setSavedModels(true);
		} catch {
			setSelection(null);
		}
	}
	(0, react.useEffect)(() => {
		refresh();
	}, []);
	(0, react.useEffect)(() => {
		refreshSelection();
	}, []);
	(0, react.useEffect)(() => {
		refreshDock();
	}, []);
	(0, react.useEffect)(() => {
		if (status?.status === "signed-in") refreshSelection();
	}, [status?.status]);
	async function saveToken(e) {
		e.preventDefault();
		setBusy(true);
		setMsg(null);
		try {
			const res = await fetch("/api/codearts/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token: token.trim(),
					label: label.trim() || void 0
				})
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setMsg(data.error ?? `HTTP ${res.status}`);
			} else {
				setToken("");
				setLabel("");
				await refresh();
			}
		} catch (err) {
			setMsg(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	}
	async function clearToken() {
		setBusy(true);
		try {
			await fetch("/api/codearts/token", { method: "DELETE" });
			await refresh();
		} finally {
			setBusy(false);
		}
	}
	async function removeAccount(id) {
		setBusy(true);
		try {
			await fetch(`/api/codearts/accounts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
			await refresh();
		} finally {
			setBusy(false);
		}
	}
	/** 手动指定优先账号；`null` = 恢复自动轮转。 */
	async function preferAccount(id) {
		setBusy(true);
		setMsg(null);
		try {
			const res = await fetch("/api/codearts/account-preference", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify({ id })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(typeof data.error === "string" ? data.error : `HTTP ${res.status}`);
			}
			await refresh();
		} catch (error) {
			setMsg(t("accountPreferenceFailed", { message: error instanceof Error ? error.message : String(error) }));
		} finally {
			setBusy(false);
		}
	}
	const all = selection?.choices.length ?? 0;
	const blockedCount = selection?.choices.filter((c) => c.blocked === true).length ?? 0;
	const wire = draft.length === all ? [] : draft;
	const savedIds = selection?.choices.filter((c) => c.enabled).map((c) => c.id) ?? [];
	const dirty = savedIds.length !== draft.length || savedIds.some((id) => !draft.includes(id));
	function setModel(id, on) {
		setSavedModels(false);
		setModelError(null);
		setDraft((current) => on ? [...current, id] : current.filter((e) => e !== id));
	}
	async function saveModels() {
		setSavingModels(true);
		setModelError(null);
		try {
			const res = await fetch("/api/codearts/enabled-models", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify({ enabledModels: wire })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? `HTTP ${res.status}`);
			}
			const data = await res.json();
			setSelection(data.selection);
			setDraft(data.selection.choices.filter((c) => c.enabled).map((c) => c.id));
			setSavedModels(true);
		} catch (err) {
			setModelError(err instanceof Error ? err.message : String(err));
		} finally {
			setSavingModels(false);
		}
	}
	/**
	* 手动重拉一次模型目录。
	*
	* 存在的理由：限时福利名单会轮换（模型被移出、被转正），后台每小时才拉一次，
	* 干等或重启都不是办法。顺带清掉「福利今日不可用」标记 —— 活动回来时这是唯一
	* 不用等第二天的出口。
	*/
	async function refreshCatalog() {
		setRefreshing(true);
		setRefreshMsg(null);
		try {
			const res = await fetch("/api/codearts/refresh-models", { method: "POST" });
			const data = await res.json().catch(() => null);
			if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
			if (data?.selection !== void 0) {
				setSelection(data.selection);
				setDraft(data.selection.choices.filter((c) => c.enabled).map((c) => c.id));
				setSavedModels(true);
			}
			setRefreshMsg(data?.refreshed === false ? t("refreshStale", { n: data.models ?? 0 }) : t("refreshed", {
				n: data?.models ?? 0,
				benefit: data?.benefit ?? 0
			}));
		} catch (err) {
			setRefreshMsg(t("refreshFailed", { message: err instanceof Error ? err.message : String(err) }));
		} finally {
			setRefreshing(false);
		}
	}
	async function startOAuthLogin() {
		setBusy(true);
		setMsg(null);
		setLoginPending(true);
		try {
			const res = await fetch("/api/codearts/login", { method: "POST" });
			const data = await res.json().catch(() => ({}));
			if (!res.ok || typeof data.url !== "string") {
				setMsg(data.error ?? `HTTP ${res.status}`);
				setLoginPending(false);
				return;
			}
			setLoginUrl(data.url);
			setLoginDialogOpen(true);
			const poll = async () => {
				const st = await (await fetch(`/api/codearts/login/status?url=${encodeURIComponent(data.url)}`, { headers: { Accept: "application/json" } })).json().catch(() => ({ status: "pending" }));
				if (st.status === "done") {
					setLoginUrl(null);
					setLoginDialogOpen(false);
					setLoginPending(false);
					await refresh();
					return;
				}
				if (st.status === "error") {
					setLoginUrl(null);
					setLoginDialogOpen(false);
					setLoginPending(false);
					setMsg(t("loginFailed"));
					return;
				}
				if (st.status === "idle") {
					setLoginUrl(null);
					setLoginDialogOpen(false);
					setLoginPending(false);
					await refresh();
					return;
				}
				setTimeout(() => void poll(), 1500);
			};
			poll();
		} catch (err) {
			setMsg(err instanceof Error ? err.message : String(err));
			setLoginPending(false);
		} finally {
			setBusy(false);
		}
	}
	const signedIn = status?.status === "signed-in";
	const expired = status?.status === "expired";
	const accounts = status?.accounts ?? [];
	const accountName = (account) => account.label?.trim() || account.userName?.trim() || account.id;
	const preferredRaw = status?.preferredAccountId?.trim() ?? "";
	const preferredId = accounts.some((account) => account.id === preferredRaw) ? preferredRaw : "";
	const preferredAccount = accounts.find((account) => account.id === preferredId);
	/**
	* 每个账号的「获取时间 + 过期状态」。同一账号重复登录可能留下多条记录（上游不给
	* 稳定身份时的妥协），把时间摆出来用户才能一眼认出哪条是旧的、放心删。
	*/
	const accountMeta = (account) => {
		const parts = [];
		const stored = formatStored(account.storedAt);
		if (stored !== "") parts.push(t("accountStored", { time: stored }));
		const exp = typeof account.expiration === "string" ? Date.parse(account.expiration) : NaN;
		if (Number.isFinite(exp)) parts.push(exp <= Date.now() ? t("accountExpired", { time: formatStored(exp) }) : t("accountExpires", { time: formatStored(exp) }));
		return parts.join(" · ");
	};
	const dotState = signedIn ? "done" : expired ? "warning" : "idle";
	const statusText = signedIn ? t("statusSignedIn") : expired ? t("statusExpired") : t("statusSignedOut");
	const storedTime = formatStored(status?.storedAt);
	const storedLabel = status?.label?.trim() ?? "";
	const meta = !signedIn || storedTime === "" ? "" : storedLabel === "" ? t("storedMetaNoLabel", { time: storedTime }) : t("storedMeta", {
		label: storedLabel,
		time: storedTime
	});
	const tabId = (value) => `${tabIdBase}-tab-${value}`;
	const panelId = (value) => `${tabIdBase}-panel-${value}`;
	const creditEntries = new Map((status?.creditsByAccount ?? []).map((entry) => [entry.id, entry]));
	/** 某账号的积分：新后端按 id 给；老后端只有全局快照，单账号时退回它。 */
	const creditFor = (id) => {
		const entry = creditEntries.get(id);
		if (entry !== void 0) return entry;
		if (creditEntries.size === 0 && accounts.length === 1) {
			if (status?.credits === void 0 && status?.creditsError === void 0) return void 0;
			return {
				credits: status?.credits,
				creditsError: status?.creditsError
			};
		}
	};
	const usageAvailable = status?.usage !== void 0;
	const tabItems = {
		accounts: {
			value: "accounts",
			label: t("tabAccounts", { n: accounts.length }),
			id: tabId("accounts"),
			panelId: panelId("accounts")
		},
		models: {
			value: "models",
			label: t("tabModels", {
				n: draft.length,
				total: all
			}),
			id: tabId("models"),
			panelId: panelId("models")
		},
		usage: {
			value: "usage",
			label: t("tabUsage"),
			id: tabId("usage"),
			panelId: panelId("usage")
		},
		display: {
			value: "display",
			label: t("tabDisplay"),
			id: tabId("display"),
			panelId: panelId("display")
		}
	};
	const tabs = [
		tabItems.accounts,
		tabItems.models,
		...usageAvailable ? [tabItems.usage] : [],
		tabItems.display
	];
	const activeTab = tabs.some((item) => item.value === tab) ? tab : "accounts";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: CodeArtsPluginCard_module_css_default.card,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.header,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: CodeArtsPluginCard_module_css_default.headText,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.name,
							children: t("cardTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: CodeArtsPluginCard_module_css_default.statusLine,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: dotState }), statusText]
						}),
						meta !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.meta,
							children: meta
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: CodeArtsPluginCard_module_css_default.desc,
							children: signedIn ? t("descSignedIn") : t("descSignedOut")
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					disabled: busy,
					onClick: () => void refresh(),
					children: t("refresh")
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: CodeArtsPluginCard_module_css_default.body,
				children: [
					status?.piAiError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: CodeArtsPluginCard_module_css_default.error,
						children: status.piAiError
					}),
					signedIn ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
							className: CodeArtsPluginCard_module_css_default.tabs,
							items: tabs,
							value: activeTab,
							onChange: setTab,
							label: t("tabsLabel")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabPanel, {
							id: panelId("accounts"),
							labelledBy: tabId("accounts"),
							active: activeTab === "accounts",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: CodeArtsPluginCard_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: CodeArtsPluginCard_module_css_default.sectionHead,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: CodeArtsPluginCard_module_css_default.sectionLabel,
											children: t("accountsTitle")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: CodeArtsPluginCard_module_css_default.count,
											children: accounts.length
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: CodeArtsPluginCard_module_css_default.accountToolbar,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											"aria-expanded": manualOpen,
											disabled: busy,
											onClick: () => setManualOpen((open) => !open),
											children: t("pasteTokenAdd")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											disabled: busy || loginPending,
											onClick: () => void startOAuthLogin(),
											children: loginPending ? t("signingIn") : t("addAccount")
										})]
									}),
									loginUrl !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
										className: CodeArtsPluginCard_module_css_default.hint,
										children: [
											t("openManually"),
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
												className: CodeArtsPluginCard_module_css_default.link,
												href: loginUrl,
												target: "_blank",
												rel: "noreferrer",
												children: loginUrl
											})
										]
									}),
									manualOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: CodeArtsPluginCard_module_css_default.manualForm,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManualTokenForm, {
											t,
											token,
											label,
											busy,
											onToken: setToken,
											onLabel: setLabel,
											onSubmit: (e) => void saveToken(e)
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: CodeArtsPluginCard_module_css_default.accountCard,
										children: [
											accounts.map((account) => {
												const accountLine = accountMeta(account);
												const credit = creditFor(account.id);
												return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: CodeArtsPluginCard_module_css_default.accountEntry,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: CodeArtsPluginCard_module_css_default.accountRow,
														children: [
															/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: CodeArtsPluginCard_module_css_default.avatar,
																"aria-hidden": "true",
																children: Array.from(accountName(account))[0] ?? "*"
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																className: CodeArtsPluginCard_module_css_default.accountInfo,
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
																	className: CodeArtsPluginCard_module_css_default.accountNameRow,
																	children: [
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																			className: CodeArtsPluginCard_module_css_default.accountName,
																			children: accountName(account)
																		}),
																		account.stale && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, { children: t("accountNeedsSignIn") }),
																		!account.signable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, { children: t("accountNoKey") })
																	]
																}), accountLine !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: CodeArtsPluginCard_module_css_default.meta,
																	children: accountLine
																})]
															}),
															/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																className: CodeArtsPluginCard_module_css_default.accountRowActions,
																children: [accounts.length > 1 && (preferredId === account.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
																	tone: "success",
																	children: t("accountInUse")
																}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
																	variant: "outline",
																	size: "sm",
																	disabled: busy,
																	onClick: () => void preferAccount(account.id),
																	children: t("accountUse")
																})), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
																	variant: "outline",
																	size: "sm",
																	className: CodeArtsPluginCard_module_css_default.danger,
																	disabled: busy,
																	onClick: () => void removeAccount(account.id),
																	children: t("accountRemove")
																})]
															})
														]
													}), credit !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreditBlock, {
														credits: credit.credits,
														error: credit.creditsError,
														t,
														onClaim: () => void claim(account.id),
														claiming: claimingId === account.id || claimingId === CLAIM_ALL,
														claimResult: claimResults[account.id] ?? null,
														justClaimed: claimedIds[account.id] === true
													})]
												}, account.id);
											}),
											preferredAccount !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
												className: CodeArtsPluginCard_module_css_default.accountModeRow,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: CodeArtsPluginCard_module_css_default.accountModeText,
													children: t("accountPinnedHint", { name: accountName(preferredAccount) })
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "outline",
													size: "sm",
													disabled: busy,
													onClick: () => void preferAccount(null),
													children: t("accountAuto")
												})]
											}),
											accounts.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: CodeArtsPluginCard_module_css_default.claimAllRow,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "outline",
													size: "sm",
													disabled: claimingId !== null,
													onClick: () => void claim(),
													children: claimingId === CLAIM_ALL ? t("claimPending") : t("claimAll")
												})
											}),
											accounts.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: CodeArtsPluginCard_module_css_default.accountHint,
												children: t("accountsRotateHint")
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: CodeArtsPluginCard_module_css_default.actions,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											className: CodeArtsPluginCard_module_css_default.danger,
											disabled: busy,
											onClick: () => void clearToken(),
											children: t("clearToken")
										})
									})
								]
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabPanel, {
							id: panelId("models"),
							labelledBy: tabId("models"),
							active: activeTab === "models",
							children: selection ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: CodeArtsPluginCard_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: CodeArtsPluginCard_module_css_default.sectionHead,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: CodeArtsPluginCard_module_css_default.sectionLabel,
												children: t("modelsTitle")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: CodeArtsPluginCard_module_css_default.count,
												children: t("selectedCount", {
													n: draft.length,
													total: all
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												variant: "outline",
												size: "sm",
												disabled: refreshing,
												onClick: () => void refreshCatalog(),
												children: refreshing ? t("refreshing") : t("refreshModels")
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: CodeArtsPluginCard_module_css_default.hint,
										children: selection.restricted ? t("optionalModelsHint") : t("optionalModelsAllHint")
									}),
									blockedCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: CodeArtsPluginCard_module_css_default.hint,
										children: t("benefitBlockedHint", { n: blockedCount })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: CodeArtsPluginCard_module_css_default.choices,
										children: selection.choices.map((choice) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: CodeArtsPluginCard_module_css_default.choiceRow,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
													className: CodeArtsPluginCard_module_css_default.check,
													checked: draft.includes(choice.id),
													disabled: !selection.writable || savingModels,
													onChange: (on) => setModel(choice.id, on),
													label: modelName(choice)
												}),
												choice.benefit === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
													tone: choice.blocked === true ? "warning" : "success",
													children: choice.blocked === true ? t("benefitBlocked") : t("benefit")
												}),
												choice.ratio !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
													tone: "quiet",
													children: choice.ratio
												}),
												choice.supportsImages === true && (choice.imageBridge === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
													tone: "quiet",
													children: t("modelImagesBridge")
												}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
													tone: "quiet",
													children: t("modelImages")
												}))
											]
										}, choice.id))
									}),
									selection.writable && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: CodeArtsPluginCard_module_css_default.actions,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											disabled: draft.length === all,
											onClick: () => {
												setSavedModels(false);
												setModelError(null);
												setDraft(selection.choices.map((c) => c.id));
											},
											children: t("selectAll")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											disabled: !dirty || savingModels,
											onClick: () => void saveModels(),
											children: savingModels ? t("saving") : savedModels && !dirty ? t("saved") : t("saveModels")
										})]
									}),
									modelError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: CodeArtsPluginCard_module_css_default.error,
										children: modelError
									})
								]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: CodeArtsPluginCard_module_css_default.hint,
								children: t("modelsLoading")
							})
						}),
						status?.usage !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabPanel, {
							id: panelId("usage"),
							labelledBy: tabId("usage"),
							active: activeTab === "usage",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageSection, {
								usage: status.usage,
								accounts,
								t
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabPanel, {
							id: panelId("display"),
							labelledBy: tabId("display"),
							active: activeTab === "display",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: CodeArtsPluginCard_module_css_default.section,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: CodeArtsPluginCard_module_css_default.sectionHead,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: CodeArtsPluginCard_module_css_default.sectionLabel,
											children: t("displayTitle")
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: CodeArtsPluginCard_module_css_default.hint,
										children: t("displayHint")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: CodeArtsPluginCard_module_css_default.choices,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: CodeArtsPluginCard_module_css_default.choiceRow,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
												className: CodeArtsPluginCard_module_css_default.check,
												checked: dock.credits,
												disabled: !dockWritable || dockSaving,
												onChange: (on) => void toggleDock("credits", on),
												label: t("displayCreditsToggle")
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: CodeArtsPluginCard_module_css_default.choiceRow,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
												className: CodeArtsPluginCard_module_css_default.check,
												checked: dock.queue,
												disabled: !dockWritable || dockSaving,
												onChange: (on) => void toggleDock("queue", on),
												label: t("displayQueueToggle")
											})
										})]
									}),
									!dockWritable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: CodeArtsPluginCard_module_css_default.hint,
										children: t("displayNotWritable")
									}),
									dockError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: CodeArtsPluginCard_module_css_default.error,
										children: t("displayFailed", { message: dockError })
									})
								]
							})
						})
					] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: CodeArtsPluginCard_module_css_default.section,
						children: [
							expired && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: CodeArtsPluginCard_module_css_default.hint,
								children: t("expiredHint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: CodeArtsPluginCard_module_css_default.actions,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy || loginPending,
									onClick: () => void startOAuthLogin(),
									children: loginPending ? t("signingIn") : t("signIn")
								})
							}),
							loginUrl !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: CodeArtsPluginCard_module_css_default.hint,
								children: [
									t("openManually"),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
										className: CodeArtsPluginCard_module_css_default.link,
										href: loginUrl,
										target: "_blank",
										rel: "noreferrer",
										children: loginUrl
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								className: CodeArtsPluginCard_module_css_default.manual,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
									className: CodeArtsPluginCard_module_css_default.manualSummary,
									children: t("manualToken")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManualTokenForm, {
									t,
									token,
									label,
									busy,
									onToken: setToken,
									onLabel: setLabel,
									onSubmit: (e) => void saveToken(e)
								})]
							})
						]
					}),
					msg !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: CodeArtsPluginCard_module_css_default.error,
						children: msg
					})
				]
			}),
			loginUrl !== null && loginDialogOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AddAccountDialog, {
				url: loginUrl,
				t,
				onClose: () => setLoginDialogOpen(false)
			})
		]
	});
}
//#endregion
//#region src/client/dock-line.ts
/** 段分隔符 —— 与邻居插件一致，改这里等于改整行的样子。 */
const DOCK_SEGMENT_SEPARATOR = " · ";
//#endregion
//#region src/client/dock-suppress.ts
/**
* 选中我们的模型时，把对话底部那一行里**别人**的条目暂时压掉。
*
* 别人注册什么我们管不了 —— `conversation.composer.dock` 是 list 槽位，每条注册由
* 宿主平铺成同一个 `[data-composer-dock]` 行里的一个直接子节点。所以我们能做的是：
* 在自己这条的 effect 里认出兄弟节点、给它们打个属性，再用一条我们注入的 CSS 隐藏。
* 切走或卸载时逐个摘掉属性，绝不留下别人的行永久消失。
*
* 不碰的：宿主自己的轮次/token 统计 pill（带 `data-composer-stat`），以及上下文占用
* 那一格 —— 那些不是「别人的 provider 行」，压掉就是抢宿主的 UI。
*
* 这里刻意不写 `instanceof HTMLElement`：结构够了就能用，逻辑也就能在没装 jsdom 的
* 测试环境里用假节点跑（见 test/dock-suppress.spec.ts）。
*/
/** 标记属性：带上它的节点被我们隐藏。 */
const SUPPRESS_ATTR = "data-codearts-dock-suppressed";
/** 注入的那条样式表 id。 */
const SUPPRESS_STYLE_ID = "dsh-codearts-connect-dock-suppress";
/**
* 这个兄弟节点该不该被压掉。
*
* 该压：别人的一条注册（既不是我们自己，也不包含我们，也不是宿主统计 pill）。
* 不该压：我们自己、我们自己的子孙（有些宿主会包一层）、宿主的统计 pill。
*/
function isForeignDockEntry(node, self) {
	if (node === self) return false;
	if (node.contains?.(self) === true) return false;
	if (node.hasAttribute("data-composer-stat")) return false;
	if (node.querySelector("[data-composer-stat]") !== null) return false;
	return true;
}
/**
* 扫一遍并给新发现的「别人」打标记。返回**这次**新标记的节点，调用方负责在清理时
* 逐个摘掉（只摘自己打的那批，别动别人的状态）。
*/
function markForeignDockEntries(parent, self) {
	const marked = [];
	for (const child of Array.from(parent.children)) {
		if (!isForeignDockEntry(child, self)) continue;
		if (child.getAttribute("data-codearts-dock-suppressed") === "") continue;
		child.setAttribute(SUPPRESS_ATTR, "");
		marked.push(child);
	}
	return marked;
}
/** 摘掉标记 —— 切走 provider 或组件卸载时调用。 */
function releaseDockEntries(nodes) {
	for (const node of nodes) node.removeAttribute(SUPPRESS_ATTR);
}
/** 注入一次隐藏规则；重复调用无副作用。没有 document 的环境（SSR/测试）直接跳过。 */
function ensureSuppressStyle() {
	if (typeof document === "undefined") return;
	if (document.getElementById("dsh-codearts-connect-dock-suppress") !== null) return;
	const style = document.createElement("style");
	style.id = SUPPRESS_STYLE_ID;
	style.textContent = `[${SUPPRESS_ATTR}]{display:none!important}`;
	document.head.appendChild(style);
}
//#endregion
//#region src/client/CodeArtsCreditDock.tsx
/**
* 对话底部的「模型 + 积分」条，以及点开后的积分弹层。
*
* 这一条挂在 `conversation.composer.dock` 槽位上（与宿主 session-stats strip 同位）。
* 只在当前 provider 是 codearts 时才渲染，别的 provider 下完全不出现，不抢别人的行。
*
* 第一段是 `Provider CodeArts · <模型名>`，模型名直接用目录里的 `name`
* （`catalog.ts` 的 `modelDisplayName` 已经把倍率写进去了，如
* `DeepSeek-V4.1-Flash-1017 · x0.18`），所以这一行自带倍率、不必另算。
* 这段是**我们自己的**身份行：邻居插件（如 dsh-codebuddy-cli）对任何 provider
* 都会画一行 `Provider <id> · Model <id>`，在 codearts 下那行只有模型 id、没有
* 倍率；两边都开就会重复，所以优先我们这条，邻居那条应在它自己的设置里关掉。
*
* 那一行是个按钮：点开就是逐号明细（多账号下聚合数字本身没意义，得能看出是哪个号）。
* 显隐由设置卡片「显示」页那两个开关管着，开关值随 `/status` 一起下发 —— 底部条本来
* 就在轮询它，不必为两个布尔开一条新链路。代价是关掉开关最多要等一个轮询周期（60 秒）
* 才看得见效果，这个延迟在设置卡片上写明了。
*
* 积分数据走插件自己的 `/api/codearts/status`（带 TTL 缓存，见 src/credits.ts），
* 不会因为这条 dock 让上游多挨一次请求；弹层上那个「刷新积分」是唯一绕缓存的出口。
*/
/** 与 src/adapter.ts 的 CODEARTS_PROVIDER 对齐 —— client 不能 import host 模块。 */
const CODEARTS_PROVIDER = "codearts";
const STATUS_PATH = "/api/codearts/status";
const QUEUE_PATH = "/api/codearts/queue";
/** POST { id } 手动指定优先账号；id 为空 = 自动轮转。 */
const PREFERENCE_PATH = "/api/codearts/account-preference";
/** POST { enabled } 图片转述开关。 */
const IMAGE_BRIDGE_PATH = "/api/codearts/image-bridge";
/** 轮询间隔：与缓存 TTL（60s）对齐，再短也只是反复命中缓存。 */
const REFRESH_INTERVAL_MS = 6e4;
/** 排队位置变得快：官方客户端也是 5 秒一次；这是本机路由，打不疼上游。 */
const QUEUE_INTERVAL_MS = 5e3;
/** 弹层宽度固定，好算它会不会顶出屏幕右边。 */
const PANEL_WIDTH = 360;
/** 弹层与那一行之间的缝隙。 */
const PANEL_GAP = 8;
/** 那一行在输入框下方，往上开才够空间；给弹层留的最小高度，不够就翻到下面。 */
const PANEL_MIN_ABOVE = 260;
function readSelection(useProjection) {
	if (useProjection === void 0) return void 0;
	try {
		return useProjection("modelSelection");
	} catch {
		return;
	}
}
function currentOf(selection) {
	return selection?.next ?? selection?.lastUsed;
}
function isCodeArts(selection) {
	return currentOf(selection)?.provider === CODEARTS_PROVIDER;
}
function formatNumber(value) {
	return new Intl.NumberFormat().format(Math.round(value));
}
function formatClock(ts) {
	if (ts === void 0 || !Number.isFinite(ts)) return "";
	try {
		return new Date(ts).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return "";
	}
}
/** 账号名与设置卡片同一套取法：备注 > 用户名 > id。 */
function accountName(account) {
	return account.label?.trim() || account.userName?.trim() || account.id;
}
/**
* 逐号明细。
*
* 老后端只有聚合的一份 `credits`，那时单账号就退回它 —— 别因为后端没升级就把
* 弹层弹成一句「没有数据」。
*/
function rowsOf(data) {
	const byId = new Map((data.creditsByAccount ?? []).map((entry) => [entry.id, entry]));
	return (data.accounts ?? []).map((account) => {
		const entry = byId.get(account.id) ?? (byId.size === 0 && (data.accounts?.length ?? 0) === 1 ? {
			id: account.id,
			credits: data.credits,
			creditsError: data.creditsError
		} : void 0);
		const snapshot = entry?.credits;
		return {
			id: account.id,
			name: accountName(account),
			remain: snapshot?.credits.total.remain ?? null,
			expiring: snapshot?.credits.total.expiring ?? 0,
			...snapshot?.credits.fetchedAt === void 0 ? {} : { fetchedAt: snapshot.credits.fetchedAt },
			...entry?.creditsError === void 0 ? {} : { error: entry.creditsError }
		};
	});
}
/** 把弹层钉在按钮边上：优先往上开（那一行本来就在输入框下面），放不下就翻到下面。 */
function anchorOf(rect) {
	const above = rect.top > PANEL_MIN_ABOVE;
	const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
	return {
		left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
		top: above ? rect.top - PANEL_GAP : rect.bottom + PANEL_GAP,
		above
	};
}
function CodeArtsCreditDock({ useProjection, t }) {
	const active = isCodeArts(readSelection(useProjection));
	const [remain, setRemain] = (0, react.useState)(null);
	const [total, setTotal] = (0, react.useState)(0);
	const [rows, setRows] = (0, react.useState)([]);
	const [flags, setFlags] = (0, react.useState)({
		credits: true,
		queue: true
	});
	/** 最近一次成功请求实际用的账号；由 /status 带回，用来解释是否发生了回退。 */
	const [lastAccount, setLastAccount] = (0, react.useState)(void 0);
	/** 手动指定的优先账号；空串 = 自动轮转。弹层里据此标出「当前使用」。 */
	const [preferredId, setPreferredId] = (0, react.useState)("");
	const [queued, setQueued] = (0, react.useState)(null);
	const [anchor, setAnchor] = (0, react.useState)(null);
	const [refreshing, setRefreshing] = (0, react.useState)(false);
	/** 正在切换的账号 id；'__auto__' 表示切回自动轮转。 */
	const [switching, setSwitching] = (0, react.useState)(null);
	const [switchError, setSwitchError] = (0, react.useState)(null);
	/** 图片转述开关（由 /status 下发）。 */
	const [imageBridge, setImageBridge] = (0, react.useState)(void 0);
	const [bridgeSaving, setBridgeSaving] = (0, react.useState)(false);
	const [bridgeError, setBridgeError] = (0, react.useState)(null);
	const mounted = (0, react.useRef)(true);
	const triggerRef = (0, react.useRef)(null);
	const panelRef = (0, react.useRef)(null);
	/** 这一行的根节点 —— 它的 parentElement 就是宿主那条共享 flex 行。 */
	const rootRef = (0, react.useRef)(null);
	(0, react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const loadStatus = (0, react.useCallback)(async (force) => {
		try {
			const res = await fetch(force ? `${STATUS_PATH}?force=1` : STATUS_PATH, {
				headers: { Accept: "application/json" },
				credentials: "same-origin"
			});
			if (!res.ok) return;
			const data = await res.json().catch(() => void 0);
			if (data === void 0 || !mounted.current) return;
			setFlags(data.dock ?? {
				credits: true,
				queue: true
			});
			setRows(rowsOf(data));
			setPreferredId(data.preferredAccountId?.trim() ?? "");
			setLastAccount(data.lastAccount);
			setImageBridge(data.imageBridge);
			const snapshots = (data.creditsByAccount ?? []).map((entry) => entry.credits).filter((value) => value !== void 0);
			const pool = snapshots.length > 0 ? snapshots : data.credits === void 0 ? [] : [data.credits];
			if (pool.length === 0) {
				setRemain(null);
				return;
			}
			setRemain(Math.round(pool.reduce((sum, item) => sum + item.credits.total.remain, 0)));
			setTotal(Math.round(pool.reduce((sum, item) => sum + item.credits.total.total, 0)));
		} catch {}
	}, []);
	(0, react.useEffect)(() => {
		if (!active) {
			setRemain(null);
			setRows([]);
			setPreferredId("");
			setLastAccount(void 0);
			setImageBridge(void 0);
			setAnchor(null);
			return;
		}
		let timer;
		loadStatus(false);
		timer = window.setInterval(() => void loadStatus(false), REFRESH_INTERVAL_MS);
		return () => {
			if (timer !== void 0) window.clearInterval(timer);
		};
	}, [active, loadStatus]);
	(0, react.useEffect)(() => {
		if (!active) {
			setQueued(null);
			return;
		}
		let timer;
		const refresh = async () => {
			try {
				const res = await fetch(QUEUE_PATH, {
					headers: { Accept: "application/json" },
					credentials: "same-origin"
				});
				if (!res.ok) return;
				const data = await res.json().catch(() => void 0);
				if (mounted.current) setQueued(data?.queue?.[0] ?? null);
			} catch {}
		};
		refresh();
		timer = window.setInterval(refresh, QUEUE_INTERVAL_MS);
		return () => {
			if (timer !== void 0) window.clearInterval(timer);
		};
	}, [active]);
	const close = (0, react.useCallback)(() => setAnchor(null), []);
	(0, react.useEffect)(() => {
		if (anchor === null) return;
		const onPointerDown = (event) => {
			const target = event.target;
			if (target === null) return;
			if (panelRef.current?.contains(target) === true || triggerRef.current?.contains(target) === true) return;
			close();
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") close();
		};
		window.addEventListener("pointerdown", onPointerDown, true);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("resize", close);
		window.addEventListener("scroll", close, true);
		return () => {
			window.removeEventListener("pointerdown", onPointerDown, true);
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("resize", close);
			window.removeEventListener("scroll", close, true);
		};
	}, [anchor, close]);
	(0, react.useEffect)(() => {
		if (!active) return;
		const self = rootRef.current;
		const slot = self?.closest("[data-slot=\"conversation.composer.dock\"]") ?? null;
		if (self === null || slot === null) return;
		const node = slot;
		const me = self;
		const marked = /* @__PURE__ */ new Set();
		const sweep = () => {
			for (const found of markForeignDockEntries(node, me)) marked.add(found);
		};
		ensureSuppressStyle();
		sweep();
		const observer = new MutationObserver(sweep);
		observer.observe(slot, { childList: true });
		return () => {
			observer.disconnect();
			releaseDockEntries(marked);
			marked.clear();
		};
	}, [active]);
	if (!active) return null;
	const showCredits = flags.credits && remain !== null;
	const showQueue = flags.queue && queued !== null;
	/** 指定账号还在已存列表里才算数（设置里可能残留已删除的 id）。 */
	const preferredRow = preferredId === "" ? void 0 : rows.find((row) => row.id === preferredId);
	const lastName = (lastAccount === void 0 ? void 0 : rows.find((row) => row.id === lastAccount.accountId))?.name ?? lastAccount?.accountId;
	if (!showCredits && !showQueue) return null;
	const queueTitle = queued === null ? void 0 : t("queueDockTitle", {
		model: queued.model,
		position: queued.position,
		length: queued.length
	});
	const creditsTitle = showCredits ? t("creditsDockTitle", {
		remain: remain ?? 0,
		total
	}) : void 0;
	const fetchedAt = rows.reduce((latest, row) => Math.max(latest, row.fetchedAt ?? 0), 0);
	const lastUpdated = fetchedAt > 0 ? formatClock(fetchedAt) : "";
	const toggle = (event) => {
		if (anchor !== null) {
			close();
			return;
		}
		setAnchor(anchorOf(event.currentTarget.getBoundingClientRect()));
	};
	const forceRefresh = async () => {
		setRefreshing(true);
		try {
			await loadStatus(true);
		} finally {
			setRefreshing(false);
		}
	};
	/** 弹层里点账号行直接切换优先账号；null = 恢复自动轮转。 */
	const chooseAccount = async (id) => {
		if (switching !== null) return;
		setSwitching(id ?? "__auto__");
		setSwitchError(null);
		try {
			const res = await fetch(PREFERENCE_PATH, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify({ id })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `HTTP ${res.status}`);
			setPreferredId(typeof data.preferredAccountId === "string" ? data.preferredAccountId : id ?? "");
		} catch (error) {
			setSwitchError(error instanceof Error ? error.message : String(error));
		} finally {
			setSwitching(null);
		}
	};
	/** 打开/关闭图片转述：服务端会同步改模型能力，DSH 随后允许或禁止贴图。 */
	const toggleImageBridge = async (enabled) => {
		if (imageBridge === void 0 || !imageBridge.writable || bridgeSaving) return;
		setBridgeSaving(true);
		setBridgeError(null);
		try {
			const res = await fetch(IMAGE_BRIDGE_PATH, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify({ enabled })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : `HTTP ${res.status}`);
			if (data.imageBridge !== void 0) setImageBridge(data.imageBridge);
			else setImageBridge({
				...imageBridge,
				enabled
			});
		} catch (error) {
			setBridgeError(error instanceof Error ? error.message : String(error));
		} finally {
			setBridgeSaving(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		style: {
			display: "inline-flex",
			alignItems: "center",
			gap: 0,
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: "var(--dsh-content-font-size-secondary, 13px)",
			lineHeight: "18px",
			fontVariantNumeric: "tabular-nums",
			whiteSpace: "nowrap",
			flex: "0 0 auto",
			minWidth: "max-content"
		},
		title: [creditsTitle, queueTitle].filter(Boolean).join(DOCK_SEGMENT_SEPARATOR),
		children: [
			showCredits && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				ref: triggerRef,
				type: "button",
				"aria-haspopup": "dialog",
				"aria-expanded": anchor !== null,
				"aria-label": t("creditsDockPanelTitle"),
				title: [creditsTitle].filter(Boolean).join(" · "),
				onClick: toggle,
				style: {
					all: "unset",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					flex: "none",
					boxSizing: "border-box",
					width: 18,
					height: 18,
					borderRadius: "50%",
					border: "0.5px solid var(--dsw-alias-border-l2)",
					background: "var(--dsw-alias-bg-layer-3)",
					color: "inherit",
					cursor: "pointer"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					width: "12",
					height: "12",
					viewBox: "0 0 16 16",
					"aria-hidden": "true",
					focusable: "false",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "6.2",
						cy: "8",
						r: "4.3",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.3"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "9.8",
						cy: "8",
						r: "4.3",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.3",
						opacity: "0.45"
					})]
				})
			}),
			showQueue && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [showCredits && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				children: " · "
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("queueDock", { position: queued.position }) })] }),
			anchor !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: panelRef,
				role: "dialog",
				"aria-label": t("creditsDockPanelTitle"),
				style: {
					position: "fixed",
					left: anchor.left,
					top: anchor.top,
					transform: anchor.above ? "translateY(-100%)" : void 0,
					width: PANEL_WIDTH,
					maxWidth: "calc(100vw - 16px)",
					zIndex: 1e3,
					display: "flex",
					flexDirection: "column",
					gap: 8,
					padding: 12,
					boxSizing: "border-box",
					borderRadius: "var(--dsw-radius-lg, 10px)",
					border: "0.5px solid var(--dsw-alias-settings-card-stroke, rgba(127, 127, 127, 0.28))",
					background: "var(--dsw-alias-settings-card-fill, rgba(32, 32, 32, 0.96))",
					boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)",
					color: "var(--dsw-alias-label-primary)",
					fontSize: "var(--dsh-content-font-size-secondary, 13px)",
					lineHeight: "18px",
					whiteSpace: "normal"
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 8
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: { fontWeight: 600 },
							children: t("creditsDockPanelTitle")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							size: "sm",
							disabled: refreshing,
							onClick: () => void forceRefresh(),
							children: refreshing ? t("creditsDockRefreshing") : t("creditsDockRefresh")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							color: "var(--dsw-alias-label-secondary)",
							fontSize: 12
						},
						children: preferredRow !== void 0 ? t("creditsDockCurrentAccount", { name: preferredRow.name }) : t("creditsDockCurrentAuto")
					}),
					lastAccount !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							color: "var(--dsw-alias-label-tertiary)",
							fontSize: 12
						},
						title: lastAccount.reason,
						children: [t("creditsDockLastAccount", { name: lastName ?? lastAccount.accountId }), lastAccount.fallback ? ` · ${t("creditsDockFallback")}` : ""]
					}),
					imageBridge !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 2
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
								checked: imageBridge.enabled,
								disabled: !imageBridge.writable || bridgeSaving,
								onChange: (on) => void toggleImageBridge(on),
								label: t("imageBridgeToggle", { model: imageBridge.model })
							}),
							!imageBridge.writable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--dsw-alias-label-tertiary)",
									fontSize: 11
								},
								children: t("imageBridgeNotWritable")
							}),
							bridgeError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--dsw-alias-state-error-primary)",
									fontSize: 11
								},
								children: t("imageBridgeFailed", { message: bridgeError })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "minmax(0, 1fr) auto",
							gap: "4px 12px",
							alignItems: "center",
							borderTop: "0.5px solid var(--dsw-alias-border-l2, rgba(127, 127, 127, 0.22))",
							paddingTop: 8,
							color: "var(--dsw-alias-label-tertiary)"
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("creditsDockColAccount") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: { justifySelf: "end" },
								children: t("creditsDockColBalance")
							}),
							rows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: { gridColumn: "1 / -1" },
								children: t("creditsDockEmpty")
							}),
							rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: switching !== null,
								title: t("creditsDockSwitchHint"),
								onClick: () => void chooseAccount(row.id),
								style: {
									gridColumn: "1 / -1",
									display: "grid",
									gridTemplateColumns: "minmax(0, 1fr) auto",
									alignItems: "center",
									gap: "4px 12px",
									width: "100%",
									margin: 0,
									padding: "2px 0",
									border: 0,
									borderRadius: 4,
									background: preferredId === row.id ? "var(--dsw-alias-bg-layer-3)" : "transparent",
									color: "inherit",
									font: "inherit",
									textAlign: "left",
									cursor: switching === null ? "pointer" : "wait",
									opacity: switching !== null && switching !== row.id ? .6 : 1
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 6,
										minWidth: 0
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: row.remain === null ? "warning" : "done" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											style: {
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
												color: "var(--dsw-alias-label-primary)"
											},
											title: row.error === void 0 ? row.name : row.error,
											children: row.name
										}),
										preferredId === row.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											style: {
												flex: "none",
												padding: "0 4px",
												borderRadius: 4,
												background: "var(--dsw-alias-bg-layer-3)",
												color: "var(--dsw-alias-label-secondary)",
												fontSize: 11,
												lineHeight: "16px"
											},
											children: t("accountInUse")
										})
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: {
										justifySelf: "end",
										fontVariantNumeric: "tabular-nums"
									},
									children: row.remain === null ? "—" : formatNumber(row.remain)
								})]
							}, row.id))
						]
					}),
					rows.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							color: "var(--dsw-alias-label-tertiary)",
							fontSize: 12
						},
						children: t("creditsDockSwitchHint")
					}),
					preferredId !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: switching !== null,
						onClick: () => void chooseAccount(null),
						style: {
							alignSelf: "flex-start",
							display: "inline-flex",
							alignItems: "center",
							gap: 4,
							margin: 0,
							padding: 0,
							border: 0,
							background: "none",
							color: "var(--dsw-alias-brand-text)",
							font: "inherit",
							fontSize: 12,
							cursor: switching === null ? "pointer" : "wait"
						},
						children: t("creditsDockAuto")
					}),
					switchError !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							color: "var(--dsw-alias-state-error-primary)",
							fontSize: 12
						},
						children: t("creditsDockSwitchFailed", { message: switchError })
					}),
					rows.filter((row) => row.expiring > 0).map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							color: "var(--dsw-alias-state-warn-label, var(--dsw-alias-label-secondary))"
						},
						children: t("creditsDockExpiring", {
							account: row.name,
							expiring: formatNumber(row.expiring)
						})
					}, `${row.id}-expiring`)),
					lastUpdated !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: { color: "var(--dsw-alias-label-tertiary)" },
						children: t("creditsDockUpdated", { time: lastUpdated })
					})
				]
			})
		]
	});
}
//#endregion
//#region src/client/locales.ts
const zh = {
	tabLabel: "CodeArts",
	tabsLabel: "CodeArts 设置",
	tabAccounts: "账号 · {n}",
	tabModels: "模型 · {n}/{total}",
	tabUsage: "用量",
	cardTitle: "DSH CodeArts Connect",
	statusSignedIn: "已登录",
	statusSignedOut: "未登录",
	statusExpired: "凭证已过期",
	descSignedIn: "凭证已就绪，勾选的模型会出现在模型选择器里。",
	descSignedOut: "用华为云账号登录，或手动粘贴一个 CodeArts cloud_dragon_token。",
	storedMeta: "{label} · 存于 {time}",
	storedMetaNoLabel: "存于 {time}",
	refresh: "刷新",
	clearToken: "清除全部凭据",
	tokenLabel: "cloud_dragon_token",
	tokenPlaceholder: "粘贴从 CodeArts 网页/桌面端拿到的 token……",
	labelLabel: "备注（可选）",
	labelPlaceholder: "例如账号昵称，便于区分",
	saveToken: "保存 token",
	expiredHint: "凭证已过期，请重新登录以继续使用；已勾选的模型设置会保留。",
	accountsTitle: "账号",
	accountRemove: "删除",
	addAccount: "添加账号",
	pasteTokenAdd: "粘贴 Token 添加",
	accountsRotateHint: "已存多个账号：请求会自动轮转，某个账号忙时改用下一个；点「使用此账号」可优先用指定的号。",
	accountUse: "使用此账号",
	accountInUse: "当前使用",
	accountPinnedHint: "已指定优先使用 {name}；它忙或不可用时会临时换到其它号。",
	accountAuto: "恢复自动轮转",
	accountPreferenceFailed: "设置账号失败：{message}",
	accountNeedsSignIn: "需重新登录",
	accountNoKey: "无 AK/SK",
	accountStored: "获取于 {time}",
	accountExpires: "{time} 过期",
	accountExpired: "已于 {time} 过期",
	modelsTitle: "可选模型",
	optionalModelsHint: "仅勾选的模型会出现在模型选择器里。",
	optionalModelsAllHint: "所有模型默认都出现在选择器里；取消勾选不想用的即可。",
	selectedCount: "已选 {n} / {total}",
	selectAll: "全选",
	benefit: "福利",
	benefitBlocked: "福利今日不可用",
	benefitBlockedHint: "{n} 个福利模型今天被上游判定没有权益（活动领完或渠道未开），发出去会直接报 benefit not found。",
	modelImages: "识图",
	modelImagesBridge: "识图·转述",
	refreshModels: "刷新模型列表",
	refreshing: "刷新中…",
	refreshed: "已刷新：{n} 个模型，其中 {benefit} 个走福利路由",
	refreshStale: "上游没回应，仍是旧名单（{n} 个模型）",
	refreshFailed: "刷新失败：{message}",
	saveModels: "保存模型选择",
	saving: "保存中…",
	saved: "已保存",
	signIn: "使用华为云账号登录",
	signingIn: "登录中…（请在浏览器完成授权）",
	openManually: "授权链接（5 分钟内有效）：",
	addAccountDialogTitle: "添加账号",
	addAccountDialogHint: "如果当前浏览器已经登录了某个华为云账号，直接打开这个链接会授权成同一个账号，加不出新号。请复制下面的链接，在无痕窗口、另一个浏览器或另一个浏览器用户配置里打开，再登录要添加的账号。",
	addAccountDialogCopy: "复制链接",
	addAccountDialogCopied: "已复制",
	addAccountDialogCopyFailed: "复制失败，请手动选中链接复制",
	addAccountDialogWaiting: "授权完成后这个框会自动关闭；关掉也不影响登录，链接仍留在卡片上。",
	addAccountDialogClose: "关闭",
	manualToken: "手动粘贴 token（降级）",
	loginFailed: "登录失败，请重试",
	modelsLoading: "模型勾选区加载中…（若长期不出现，请确认已登录且 DSH 已完全重启）",
	usageTitle: "本机用量",
	usageToday: "今日",
	usageTodayTotal: "今日合计",
	usageLast30: "近 30 天",
	usageByAccount: "今日按账号",
	usageRequests: "{n} 次请求",
	usageRequestCount: "{n} 条",
	usageTokens: "输入 {prompt} · 输出 {completion}",
	usageAllTime: "累计（{days} 天）",
	usageByModel: "今日按模型",
	usageSlots: "会话槽位",
	usageStateOk: "可用",
	usageStateCapped: "撞上限，优先避开",
	usageStateCooling: "冷却中",
	usageStateDisabled: "已停用",
	usageNoQuota: "这里是本机经插件发出的请求统计（不等于账号总额度）；官方用量明细见",
	usageEmpty: "还没有记录：发一条消息就会开始累计。",
	creditsUnit: "积分",
	creditsUsed: "已用 {used}",
	creditsUsedOfTotal: "已用 {used} / {total}",
	creditsTotal: "总额度 {total}",
	creditsExpiringShort: "即将到期 {expiring}",
	creditsUpdated: "{time} 更新",
	creditsReset: "额度重置 {date}",
	creditsDetailLink: "查看积分明细 →",
	creditsTokensToday: "今日 token {used} / {limit}",
	creditsTokensBalance: "余额 {balance}",
	creditsUnavailable: "积分不可用：{message}",
	creditsNeedSignIn: "这个账号需要重新登录",
	creditsDock: "积分 {remain}",
	creditsDockTitle: "CodeArts 剩余积分 {remain} / {total}",
	creditsDockPanelTitle: "CodeArts 积分",
	creditsDockCurrentAccount: "当前使用：{name}",
	creditsDockCurrentAuto: "当前使用：自动轮转",
	creditsDockSwitchHint: "点击账号行切换优先账号",
	creditsDockAuto: "自动轮转",
	creditsDockSwitchFailed: "切换失败：{message}",
	creditsDockLastAccount: "上次实际使用：{name}",
	creditsDockFallback: "回退",
	imageBridgeToggle: "用 {model} 转述图片（纯文本模型可用）",
	imageBridgeNotWritable: "当前宿主不允许修改这个开关。",
	imageBridgeFailed: "图片转述设置失败：{message}",
	creditsDockRefresh: "刷新积分",
	creditsDockRefreshing: "刷新中…",
	creditsDockColAccount: "账号",
	creditsDockColBalance: "剩余积分",
	creditsDockEmpty: "暂时没有积分数据",
	creditsDockExpiring: "{account}：{expiring} 积分将在本周期结束时作废",
	creditsDockUpdated: "最近刷新 {time}",
	dockProvider: "Provider {provider}",
	dockModel: "Model {model}",
	dockNoModel: "未选择模型",
	tabDisplay: "显示",
	displayTitle: "对话底部显示",
	displayHint: "这两项只管输入框下方那一行的积分按钮与排队两段；中间那段「Provider CodeArts · Model 模型 · 倍率」一直显示，不受开关影响。底部那条每 60 秒读一次设置，所以关掉最多要等一分钟才见效。",
	displayCreditsToggle: "显示积分按钮（点开可看各账号明细）",
	displayQueueToggle: "显示上游排队位置",
	displayNotWritable: "这个宿主没给插件开配置存储，开关只能看不能改。",
	displayFailed: "保存失败：{message}",
	queueDock: "排队第 {position} 位",
	queueDockTitle: "上游排队：{model} · 第 {position} 位 / 共 {length} 条",
	claimButton: "签到领积分",
	claimButtonDone: "今日已领",
	claimPending: "领取中…",
	claimAll: "全部账号领取",
	claimHint: "每天领一次 1000 积分，走官方福利中心接口（与客户端里那个「每日签到」同一件事）。",
	claimDone: "已领取 {amount} 积分",
	claimAlready: "今日已领，明天再来",
	claimUnavailable: "这个账号当前没有可领的签到活动",
	claimFailed: "领取失败：{message}"
};
const en = {
	tabLabel: "CodeArts",
	tabsLabel: "CodeArts settings",
	tabAccounts: "Accounts · {n}",
	tabModels: "Models · {n}/{total}",
	tabUsage: "Usage",
	cardTitle: "DSH CodeArts Connect",
	statusSignedIn: "Signed in",
	statusSignedOut: "Not signed in",
	statusExpired: "Credential expired",
	descSignedIn: "Credential is ready. Checked models show up in the model picker.",
	descSignedOut: "Sign in with your Huawei Cloud account, or paste a CodeArts cloud_dragon_token.",
	storedMeta: "{label} · stored {time}",
	storedMetaNoLabel: "stored {time}",
	refresh: "Refresh",
	clearToken: "Clear all credentials",
	tokenLabel: "cloud_dragon_token",
	tokenPlaceholder: "Paste the token taken from the CodeArts web/desktop client……",
	labelLabel: "Label (optional)",
	labelPlaceholder: "e.g. account nickname",
	saveToken: "Save token",
	expiredHint: "Your credential has expired. Sign in again to continue; your model selection is kept.",
	accountsTitle: "Accounts",
	accountRemove: "Remove",
	addAccount: "Add account",
	pasteTokenAdd: "Paste a token",
	accountsRotateHint: "Multiple accounts stored: requests rotate automatically, so a busy account hands over to the next one. Click “Use this account” to prefer a specific one.",
	accountUse: "Use this account",
	accountInUse: "In use",
	accountPinnedHint: "Preferring {name}; if it is busy or unavailable, another account is used temporarily.",
	accountAuto: "Back to automatic rotation",
	accountPreferenceFailed: "Could not set the account: {message}",
	accountNeedsSignIn: "Needs sign-in",
	accountNoKey: "No AK/SK",
	accountStored: "stored {time}",
	accountExpires: "expires {time}",
	accountExpired: "expired {time}",
	modelsTitle: "Models",
	optionalModelsHint: "Only checked models appear in the model picker.",
	optionalModelsAllHint: "All models show in the picker by default; uncheck the ones you don’t want.",
	selectedCount: "{n} of {total} selected",
	selectAll: "Select all",
	benefit: "Benefit",
	benefitBlocked: "Benefit unavailable today",
	benefitBlockedHint: "{n} benefit model(s) were told they have no entitlement today (campaign exhausted or channel not opened); sending to them fails with benefit not found.",
	modelImages: "Images",
	modelImagesBridge: "Images (captioned)",
	refreshModels: "Refresh models",
	refreshing: "Refreshing…",
	refreshed: "Refreshed: {n} models, {benefit} on the benefit route",
	refreshStale: "Upstream did not answer; still showing the old {n} models",
	refreshFailed: "Refresh failed: {message}",
	saveModels: "Save selection",
	saving: "Saving…",
	saved: "Saved",
	signIn: "Sign in with Huawei Cloud",
	signingIn: "Signing in… (finish authorization in your browser)",
	openManually: "Authorization link (valid for 5 minutes):",
	addAccountDialogTitle: "Add account",
	addAccountDialogHint: "If this browser is already signed in to Huawei Cloud, opening this link directly just authorizes the same account and no new account is added. Copy the link below and open it in a private window, another browser, or another browser profile, then sign in to the account you want to add.",
	addAccountDialogCopy: "Copy link",
	addAccountDialogCopied: "Copied",
	addAccountDialogCopyFailed: "Copy failed — select and copy the link manually",
	addAccountDialogWaiting: "This dialog closes itself once authorization finishes. Closing it does not cancel the sign-in; the link stays on the card.",
	addAccountDialogClose: "Close",
	manualToken: "Paste token manually (fallback)",
	loginFailed: "Sign-in failed, please retry",
	modelsLoading: "Loading model selection… (if it never appears, make sure you are signed in and DSH was fully restarted)",
	usageTitle: "Local usage",
	usageToday: "Today",
	usageTodayTotal: "Today",
	usageLast30: "Last 30 days",
	usageByAccount: "Today by account",
	usageRequests: "{n} request(s)",
	usageRequestCount: "{n} reqs",
	usageTokens: "in {prompt} · out {completion}",
	usageAllTime: "All time ({days} days)",
	usageByModel: "Today by model",
	usageSlots: "Session slots",
	usageStateOk: "Ready",
	usageStateCapped: "Cap hit, avoiding",
	usageStateCooling: "Cooling down",
	usageStateDisabled: "Disabled",
	usageNoQuota: "Counts the requests this machine sent through the plugin (not the account balance). Official usage:",
	usageEmpty: "Nothing recorded yet: send a message to start counting.",
	creditsUnit: "credits",
	creditsUsed: "{used} used",
	creditsUsedOfTotal: "{used} of {total} used",
	creditsTotal: "{total} total",
	creditsExpiringShort: "{expiring} expiring",
	creditsUpdated: "updated {time}",
	creditsReset: "Quota resets {date}",
	creditsDetailLink: "View credit details →",
	creditsTokensToday: "Today {used} / {limit} tokens",
	creditsTokensBalance: "{balance} left",
	creditsUnavailable: "Credits unavailable: {message}",
	creditsNeedSignIn: "This account needs signing in again",
	creditsDock: "Credits {remain}",
	creditsDockTitle: "CodeArts credits left {remain} / {total}",
	creditsDockPanelTitle: "CodeArts credits",
	creditsDockCurrentAccount: "In use: {name}",
	creditsDockCurrentAuto: "In use: automatic rotation",
	creditsDockSwitchHint: "Click an account row to prefer it",
	creditsDockAuto: "Automatic rotation",
	creditsDockSwitchFailed: "Switch failed: {message}",
	creditsDockLastAccount: "Last used: {name}",
	creditsDockFallback: "fallback",
	imageBridgeToggle: "Caption images with {model} (for text-only models)",
	imageBridgeNotWritable: "This host does not allow changing this switch.",
	imageBridgeFailed: "Image bridge setting failed: {message}",
	creditsDockRefresh: "Refresh credits",
	creditsDockRefreshing: "Refreshing…",
	creditsDockColAccount: "Account",
	creditsDockColBalance: "Credits left",
	creditsDockEmpty: "No credit data yet",
	creditsDockExpiring: "{account}: {expiring} credits expire when this cycle ends",
	creditsDockUpdated: "Last updated {time}",
	dockProvider: "Provider {provider}",
	dockModel: "Model {model}",
	dockNoModel: "No model selected",
	tabDisplay: "Display",
	displayTitle: "Under the chat input box",
	displayHint: "These two only control the credits button and queue segments of that line under the input box; the middle “Provider CodeArts · Model … · rate” segments always show. The bar re-reads settings every 60 seconds, so hiding the rest can take up to a minute.",
	displayCreditsToggle: "Show the credits button (click it for per-account details)",
	displayQueueToggle: "Show the upstream queue position",
	displayNotWritable: "This host gives the plugin nowhere to persist settings, so the switches are read-only.",
	displayFailed: "Failed to save: {message}",
	queueDock: "Queued #{position}",
	queueDockTitle: "Upstream queue: {model} · position {position} of {length}",
	claimButton: "Claim daily credits",
	claimButtonDone: "Claimed today",
	claimPending: "Claiming…",
	claimAll: "Claim for all accounts",
	claimHint: "Claim 1,000 credits once a day through CodeArts’ welfare centre — the same check-in the official client does.",
	claimDone: "Claimed {amount} credits",
	claimAlready: "Already claimed today — come back tomorrow",
	claimUnavailable: "No check-in campaign available for this account",
	claimFailed: "Claim failed: {message}"
};
//#endregion
//#region src/client/index.tsx
const name = "dsh-codearts-connect-client";
const inject = ["slots", "locale"];
function apply(ctx) {
	try {
		const namespace = "settings.codearts";
		ctx.effect(() => ctx.locale.register(namespace, {
			zh,
			en
		}), "dsh-codearts-connect: settings copy");
		const t = ctx.locale.bind(namespace);
		ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
			name: "plugins.bundle.config",
			key: "dsh-codearts-connect",
			locale: namespace
		}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodeArtsPluginCard, { t })));
		ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
			name: "conversation.input.right",
			id: "codearts-credits",
			order: 20,
			locale: namespace,
			inject: () => ({ t })
		}, CodeArtsCreditDock));
	} catch (error) {
		console.error("[dsh-codearts-connect] client card failed to load (host provider unaffected):", error);
	}
}
//#endregion
exports.apply = apply;
exports.inject = inject;
exports.name = name;

    return module.exports;
  }
});
