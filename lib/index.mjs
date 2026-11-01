import { A as clearImageBlocked, B as MANUAL_ACCOUNT_ID, C as prepareChatBody, D as CodeArtsCatalog, E as upstreamErrorMessage, F as isBenefitModel, H as codeartsAuthPath, I as isImageBlocked, L as markImageBlocked, M as filterEnabledModels, N as imageBlockedModels, O as FALLBACK_CODEARTS_MODELS, P as isBenefitBlocked, R as CodeArtsAccountStore, S as pickDailyWelfareCampaign, T as signedGet, U as startLogin, V as codeartsAccountsPath, _ as isParamInvalidFrame, a as IMAGE_UNSUPPORTED_MESSAGE, b as isWelfareClaimedStatus, c as chatStream, d as degradeTokenCeiling, f as fetchCallerIdentity, g as isConcurrencyCap, h as fetchWelfareCampaigns, i as refreshCatalog, j as creditRatioLabel, k as clearBenefitBlocked, l as claimDailyWelfare, m as fetchQueueStatus, n as codeartsUsagePath, o as SNAP_HOST, p as fetchModels, r as discoverModels, s as canonicalModel, t as CodeArtsUsageTracker, u as clearQueueStatus, v as isQueueableRate, w as rateLimitFrame, x as maxTokensCeilingFor, y as isTpmLimit, z as CodeArtsCredentialStore } from "./usage-D-RAq_mV.mjs";
import { i as lazyApi, r as createProvider } from "./models-DJz5BCVv.mjs";
import z from "@deepseek-ai/schemastery";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { resolveRetryPolicy } from "@deepseek-ai/dsh-llm";
import { PiAiAdapter } from "@deepseek-ai/dsh-llm-pi-ai";
import * as settingsModule from "@deepseek-ai/dsh-settings";
/**
* 撞到上游并发上限后，多久内优先不选这个账号。
*
* 这不是冷却：账号本身没坏，只是它的会话槽位暂时满了（约 52 秒才释放）。
* 所以只是一个「倾向」——池里还有别的账号就先换一个；全都这样时照样会选它，
* 因为排队等它总比直接失败强。
*/
const CAPPED_HINT_MS = 3e4;
var CodeArtsAccountPool = class {
	accounts = /* @__PURE__ */ new Map();
	maxConcurrent;
	now;
	constructor(ids, options = {}) {
		this.maxConcurrent = options.maxConcurrent ?? 2;
		this.now = options.now ?? (() => Date.now());
		this.sync(ids);
	}
	/** 让池与账号文档对齐：新增的进来，删掉的出去。已有账号的运行时状态保留。 */
	sync(ids) {
		const wanted = new Set(ids);
		for (const id of [...this.accounts.keys()]) if (!wanted.has(id)) this.accounts.delete(id);
		for (const id of ids) {
			if (this.accounts.has(id)) continue;
			this.accounts.set(id, {
				id,
				activeConcurrent: 0,
				maxConcurrent: this.maxConcurrent,
				coolUntil: 0,
				cappedUntil: 0,
				disabled: false,
				lastUsed: 0,
				errorCount: 0
			});
		}
	}
	list() {
		return [...this.accounts.values()];
	}
	get(id) {
		return this.accounts.get(id);
	}
	/** 账号本身可用（没被禁用、不在冷却中）。 */
	healthy(id) {
		const account = this.accounts.get(id);
		if (account === void 0) return false;
		return !account.disabled && this.now() >= account.coolUntil;
	}
	/** 现在就能接活的账号（健康 + 本地还有空槽位），按「最久未用」排序。 */
	available(exclude) {
		const now = this.now();
		return this.list().filter((a) => !a.disabled && now >= a.coolUntil && !exclude.has(a.id) && a.activeConcurrent < a.maxConcurrent).sort((a, b) => a.lastUsed - b.lastUsed);
	}
	/**
	* 选一个账号。
	*
	* 给了 `preferred` 且它现在能接活，就直接选它 —— 这是设置卡片里「使用此账号」
	* 的手动指定。指定账号不健康、在冷却或本地槽位已满时不硬塞，退回正常的
	* 「最久未用」轮转：指定的意义是不再盲目换号，不是让请求直接失败。
	*
	* 没给指定时，优先挑没人撞上限的（`cappedUntil` 已过的）；如果全都撞了，就退回
	* 其中任意一个 —— 排它的队总比直接失败强。都没得选（全禁用/全在冷却）时返回
	* undefined。
	*/
	pick(exclude = /* @__PURE__ */ new Set(), preferred) {
		const candidates = this.available(exclude);
		if (candidates.length === 0) return void 0;
		if (preferred !== void 0) {
			const wanted = candidates.find((a) => a.id === preferred);
			if (wanted !== void 0) return wanted.id;
		}
		const now = this.now();
		const notCapped = candidates.filter((a) => now >= a.cappedUntil);
		return (notCapped.length > 0 ? notCapped[0] : candidates[0]).id;
	}
	/** 占一个本地槽位。占用失败（已满/不存在）返回 false。 */
	acquire(id) {
		const account = this.accounts.get(id);
		if (account === void 0) return false;
		if (account.activeConcurrent >= account.maxConcurrent) return false;
		account.activeConcurrent += 1;
		account.lastUsed = this.now();
		return true;
	}
	/** 释放槽位；重复释放不会把计数压到负数。 */
	release(id) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		if (account.activeConcurrent > 0) account.activeConcurrent -= 1;
	}
	/**
	* 撞到上游并发上限。
	*
	* **不冷却账号** —— 账号没坏，只是会话槽位暂时满了（约 52 秒释放）。冷却会
	* 让它在一分钟内彻底不可用，反而把后续请求也一起误伤（Go 参考里也是这么
	* 处理的）。这里只记一个「优先避开」的提示，好让并发的请求先去用别的账号。
	*/
	noteConcurrencyCap(id) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		account.cappedUntil = this.now() + CAPPED_HINT_MS;
	}
	/** 凭据失效等硬错误：直接停用，等用户重新登录。 */
	disable(id, reason) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		account.disabled = true;
		account.lastError = reason;
	}
	/**
	* 用户重新登录（凭据已换新）后调用：把账号从禁用/冷却里捞出来。
	*
	* `sync()` 只对齐成员、特意保留运行时状态（account-pool 不读凭据文档），所以
	* 「同一账号重新登录」不会自动清掉 disabled —— 以前只能靠重启（见 issue #1）。
	* 登录成功的语义就是「这个号现在该能用了」，由登录路径显式调这里复位。
	*/
	revive(id) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		account.disabled = false;
		account.coolUntil = 0;
		account.cappedUntil = 0;
		account.errorCount = 0;
		account.lastError = void 0;
	}
	/** 上游 5xx / 软限流：短时冷却。 */
	cooldown(id, ms, reason) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		account.coolUntil = this.now() + ms;
		account.lastError = reason;
	}
	/** 累计错误；达到阈值就冷却。 */
	noteError(id, threshold, cooldownMs, reason) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		account.errorCount += 1;
		account.lastError = reason;
		if (threshold > 0 && account.errorCount >= threshold) account.coolUntil = this.now() + cooldownMs;
	}
	/** 一次成功：清掉错误计数与冷却。 */
	noteSuccess(id) {
		const account = this.accounts.get(id);
		if (account === void 0) return;
		account.errorCount = 0;
		account.coolUntil = 0;
		account.lastError = void 0;
	}
	/** 有没有任何账号可用（含被撞上限提示的）。 */
	hasUsable() {
		const now = this.now();
		return this.list().some((a) => !a.disabled && now >= a.coolUntil);
	}
};
//#endregion
//#region src/queue.ts
/**
* 上游排队的「闸门」。
*
* 26.10.0 起上游有 `GET /api/v1/queue/status`，但它**不是只读查询**：GET 本身会把
* 这个 task 挂进队列、返回队尾位置，`DELETE` 才把它清掉（2026-10-21 实测）。真正
* 的 chat 请求并不看这个号 —— 拿着一张第 535 位的票去 POST，942ms 就开流了。
* 官方客户端的做法是：只对 `enable_queue` 的模型，先轮询排队接口，等状态变成
* `working` 才发聊天请求（见 vscode-codebot 的 `startQueuePolling`）。
*
* 这里**不照搬官方那种「一直等到轮到」**：宿主的流空闲超时只有 90 秒（等待期间
* 一个字节都发不出去，SSE 注释帧也不算事件，实测每 90 秒就被掐一次重来），而
* flash 高峰期队尾有 500+ 号、要等二十几分钟 —— 没有人会挂着对话等它。所以
* `wait()` 只等 `maxWaitMs`（默认 20 秒）：
*  - 等到 working → 放行；
*  - 还在队里 → 返回 `queued` 带上位置和队长度，由 shim 直接回一句「排队中，
*    稍后再试」，让用户自己决定要不要再发一次；
*  - 队列已满 → `queue_full`；连续失败 → `error`。
*
* 三种收尾都会 DELETE 清号，别把幽灵排队留在上游把队列越撑越长。
*
* @module dsh-codearts-connect/queue
*/
const CLEAR_TIMEOUT_MS = 5e3;
var CodeArtsQueueGate = class {
	entries = /* @__PURE__ */ new Map();
	controllers = /* @__PURE__ */ new Set();
	intervalMs;
	maxWaitMs;
	maxErrors;
	query;
	clear;
	now;
	constructor(options = {}) {
		this.intervalMs = options.intervalMs ?? 5e3;
		this.maxWaitMs = options.maxWaitMs ?? 2e4;
		this.maxErrors = options.maxErrors ?? 3;
		this.query = options.fetchStatus ?? fetchQueueStatus;
		this.clear = options.clearStatus ?? ((credential, chatId, model) => clearQueueStatus(credential, chatId, model, AbortSignal.timeout(CLEAR_TIMEOUT_MS)));
		this.now = options.now ?? Date.now;
	}
	/**
	* 占号并**最多等 `maxWaitMs`** 轮到。调用方拿到 `working` 后才发 chat 请求；
	* 其余结果（含 `queued`）都不要再发 —— `queued` 是要把位置原样告诉用户。
	*/
	async wait(credential, chatId, model, signal) {
		if (chatId === "") return { kind: "working" };
		if (signal?.aborted === true) return { kind: "aborted" };
		const controller = new AbortController();
		const onAbort = () => controller.abort();
		signal?.addEventListener("abort", onAbort, { once: true });
		this.controllers.add(controller);
		const entry = {
			id: chatId,
			model,
			position: 0,
			length: 0,
			status: "",
			updatedAt: this.now()
		};
		this.entries.set(chatId, entry);
		let errors = 0;
		const deadlineAt = this.now() + this.maxWaitMs;
		try {
			for (;;) {
				if (controller.signal.aborted) return { kind: "aborted" };
				let status;
				try {
					status = await this.query(credential, chatId, model, controller.signal);
					errors = 0;
				} catch (error) {
					if (controller.signal.aborted) return { kind: "aborted" };
					errors += 1;
					if (errors >= this.maxErrors) return {
						kind: "error",
						message: `查询上游排队状态连续失败 ${errors} 次：${errorText(error)}`
					};
					await this.pause(controller.signal);
					continue;
				}
				entry.status = status.status;
				entry.position = status.queuePosition;
				entry.length = status.queueLength;
				entry.message = status.message;
				entry.updatedAt = this.now();
				const verdict = verdictOf(status);
				if (verdict !== void 0) return verdict;
				if (this.now() >= deadlineAt) return {
					kind: "queued",
					position: status.queuePosition,
					length: status.queueLength,
					message: status.message
				};
				await this.pause(controller.signal, Math.min(this.intervalMs, deadlineAt - this.now()));
			}
		} finally {
			this.controllers.delete(controller);
			signal?.removeEventListener("abort", onAbort);
			if (this.entries.get(chatId) === entry) this.entries.delete(chatId);
			await this.clear(credential, chatId, model).catch(() => {});
		}
	}
	/** 正在排队的条目（给底部条）。 */
	snapshot() {
		return [...this.entries.values()].filter((entry) => entry.position > 0 || entry.status !== "" && entry.status !== "working").map((entry) => ({
			id: entry.id,
			model: entry.model,
			position: entry.position,
			length: entry.length,
			status: entry.status,
			...entry.message === "" ? {} : { message: entry.message },
			updatedAt: entry.updatedAt
		}));
	}
	dispose() {
		for (const controller of [...this.controllers]) controller.abort();
	}
	pause(signal, delay = this.intervalMs) {
		return new Promise((resolve) => {
			const timer = setTimeout(finish, Math.max(0, delay));
			timer.unref?.();
			function finish() {
				clearTimeout(timer);
				signal.removeEventListener("abort", finish);
				resolve();
			}
			signal.addEventListener("abort", finish, { once: true });
		});
	}
};
/**
* 这个状态还要不要继续等。
*
* `working` = 轮到；`queue_full` = 队列已满，上游建议换模型；其余（waiting 等）继续。
* 空状态且位置为 0 说明这个模型根本没排队（如 GLM），直接放行。
*/
function verdictOf(status) {
	const text = status.status.trim().toLowerCase();
	if (text === "working") return { kind: "working" };
	if (text === "queue_full") return {
		kind: "queue_full",
		message: status.message
	};
	if (text === "" && status.queuePosition === 0 && status.queueLength === 0) return { kind: "working" };
}
function errorText(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region src/credits.ts
/**
* CodeArts 积分与额度。
*
* 老结论「CodeArts 没有额度接口」是**错的**。2026-10-10 从官方 CodeArts Agent
* 客户端（`<安装目录>/resources/app/extensions/vscode-codebot/out/extension.js`）
* 里挖出它自己的接口清单，并逐条实测通过：
*
*   GET {SNAP_HOST}/snap-manager/v1/statistics/plugin
*       积分体系：套餐名/状态、总量、已用、剩余、即将过期、额度周期（重置日）
*   GET https://opengw.developer.huaweicloud.com/api/v1/user/tokens/balance
*       日/月 token 额度与余额
*
* 鉴权必须带 AK/SK 签名（SDK-HMAC-SHA256）。官方客户端那里只写了 `x-auth-token`，
* 是因为它走 IDE 内部的请求通道；我们直连时只带 `x-auth-token` 会被 APIG 拒掉：
* `401 APIG.0301 decrypt token fail`（实测三种组合，只有签名那一路 200）。
*
* 卡片每次刷新都会问一次状态，所以这里带 TTL 缓存 + 单飞：命中缓存不打上游，
* 失败也缓存一小段，免得上游抽风时每次刷新都要等一次超时。
*
* @module dsh-codearts-connect/credits
*/
/** 福利网关：token 余额接口在这里（与 benefit/claim、gateway/config 同一个 host）。 */
const BENEFIT_GATEWAY_HOST = "https://opengw.developer.huaweicloud.com";
const EP_STATISTICS_PLUGIN = "/snap-manager/v1/statistics/plugin";
const EP_TOKEN_BALANCE = "/api/v1/user/tokens/balance";
function asRecord(value) {
	return typeof value === "object" && value !== null ? value : {};
}
function asArray(value) {
	return Array.isArray(value) ? value : [];
}
function firstString(...values) {
	for (const value of values) if (typeof value === "string" && value.trim() !== "") return value.trim();
	return "";
}
/**
* 取一个非负数字。
*
* 上游用 `-1` 表示「这个指标不适用」（例如模型维度的 usage_token / model_quota_num），
* 所以负数一律当「没有」而不是当 0 —— 否则界面会把「不适用」显示成「已用 0」。
*/
function nonNegative(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function numberOrZero(value) {
	return nonNegative(value) ?? 0;
}
/** 按 name 找一条 metrics（上游的 metrics 是一个带 name 的数组）。 */
function metricNamed(raw, name) {
	for (const item of asArray(raw)) {
		const metric = asRecord(item);
		if (firstString(metric.name) === name) return metric;
	}
}
function categoryOf(metric) {
	if (metric === void 0) return void 0;
	const total = nonNegative(metric.package_credit_amount);
	const used = nonNegative(metric.package_credit_used);
	const remain = nonNegative(metric.package_credit_remain);
	if (total === void 0 && used === void 0 && remain === void 0) return void 0;
	return {
		total: numberOrZero(total),
		used: numberOrZero(used),
		remain: numberOrZero(remain),
		expiring: numberOrZero(metric.package_credit_expiring_amount)
	};
}
/** 套餐状态映射：与官方客户端 CreditPackageService.mapPackageStatus 一致。 */
function mapPlanStatus(raw) {
	if (raw === "normal") return "active";
	if (raw === "closed") return "expired";
	if (raw === "freeze") return "frozen";
	return "unknown";
}
/**
* 解析 `GET /snap-manager/v1/statistics/plugin` 的响应。
*
* 返回 undefined 表示这不是一份能用的积分文档（上游改了形状/账号没有积分体系）——
* 调用方据此报「积分不可用」，而不是显示一排 0 假装是真的。
*/
function parseCreditStatistics(raw) {
	const body = asRecord(raw);
	const metrics = body.metrics;
	if (!Array.isArray(metrics)) return void 0;
	const total = categoryOf(metricNamed(metrics, "usageTotalPackageCredit"));
	if (total === void 0) return void 0;
	const pkg = asRecord(body.package);
	const planNameCn = firstString(pkg.package_name_cn);
	const planNameEn = firstString(pkg.package_name_en);
	const packageUrl = firstString(pkg.package_url);
	const periodStart = firstString(body.start_date);
	const periodEnd = firstString(body.end_date);
	return {
		planName: planNameCn !== "" ? planNameCn : planNameEn,
		planNameEn,
		specCode: firstString(pkg.spec_code),
		planStatus: mapPlanStatus(firstString(pkg.status)),
		isCreditPackage: pkg.is_credit_package === true,
		...packageUrl === "" ? {} : { packageUrl },
		...periodStart === "" ? {} : { periodStart },
		...periodEnd === "" ? {} : { periodEnd },
		total,
		...pick("bonus", categoryOf(metricNamed(metrics, "usageBonusPackageCredit"))),
		...pick("basic", categoryOf(metricNamed(metrics, "usageBasicPackageCredit"))),
		...pick("onDemand", categoryOf(metricNamed(metrics, "usageOnDemandPackageCredit"))),
		fetchedAt: Date.now()
	};
}
function pick(key, value) {
	return value === void 0 ? {} : { [key]: value };
}
/** 解析 `GET /api/v1/user/tokens/balance` 的响应（`result` 里是额度口径）。 */
function parseTokenBalance(raw) {
	const result = asRecord(asRecord(raw).result);
	const balance = nonNegative(result.total_balance);
	const quota = nonNegative(result.total_quota);
	if (balance === void 0 && quota === void 0) return void 0;
	return {
		dailyLimit: numberOrZero(result.daily_token_limit),
		dailyUsed: numberOrZero(result.daily_tokens_used),
		monthlyLimit: numberOrZero(result.monthly_token_limit),
		monthlyUsed: numberOrZero(result.monthly_tokens_used),
		balance: numberOrZero(balance),
		quota: numberOrZero(quota)
	};
}
function errorOf(action, result) {
	return new Error(`${action} HTTP ${result.status} ${result.message}`.trim().slice(0, 300));
}
/**
* 拉一次积分与 token 额度。
*
* 积分是主口径：它失败就整体失败（卡片要能看见原因）。token 额度是附带的，
* 它失败只让 `tokens` 缺席 —— 别让一个次要接口把主数字一起拖没。
*/
async function fetchCredits(credential, signal) {
	const [statistics, balance, welfare] = await Promise.all([
		signedGet(`${SNAP_HOST}${EP_STATISTICS_PLUGIN}`, credential, void 0, signal),
		signedGet(`${BENEFIT_GATEWAY_HOST}${EP_TOKEN_BALANCE}`, credential, void 0, signal).catch(() => ({
			ok: false,
			status: 0,
			message: "request failed"
		})),
		fetchWelfareCampaigns(credential, signal).then((campaigns) => {
			const daily = pickDailyWelfareCampaign(campaigns);
			if (daily === void 0) return void 0;
			return {
				claimable: daily.claimable,
				claimedToday: !daily.claimable && isWelfareClaimedStatus(daily.status),
				amount: daily.amount
			};
		}).catch(() => void 0)
	]);
	if (!statistics.ok) throw errorOf("statistics", statistics);
	const credits = parseCreditStatistics(safeJson(statistics.text));
	if (credits === void 0) throw new Error("statistics response carries no credit metrics");
	const tokens = balance.ok ? parseTokenBalance(safeJson(balance.text)) : void 0;
	return {
		credits,
		...tokens === void 0 ? {} : { tokens },
		...welfare === void 0 ? {} : { welfare }
	};
}
function safeJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return;
	}
}
/**
* 积分缓存（TTL + 单飞）。
*
* 单飞很重要：卡片刷新、对话底部的轮询可能同时打进来，没有它就会并发问上游好几次；
* 而上游对同一账号的并发是有成本/风险的。
*/
var CodeArtsCreditCache = class {
	/** 按账号分槽：多账号下每个号有自己的余额，不能共用一个快照。 */
	states = /* @__PURE__ */ new Map();
	inflights = /* @__PURE__ */ new Map();
	ttlMs;
	failureTtlMs;
	load;
	now;
	constructor(options = {}) {
		this.ttlMs = options.ttlMs ?? 6e4;
		this.failureTtlMs = options.failureTtlMs ?? 15e3;
		this.load = options.load ?? fetchCredits;
		this.now = options.now ?? (() => Date.now());
	}
	/** 某账号的缓存内容（不触发请求），供只想读快照的场景使用。 */
	peek(accountId) {
		return this.states.get(accountId);
	}
	/** 丢掉缓存，下次 get 会重新拉（重新登录/添加账号后调用）。省略账号则清空全部。 */
	invalidate(accountId) {
		if (accountId === void 0) {
			this.states.clear();
			this.inflights.clear();
			return;
		}
		this.states.delete(accountId);
		this.inflights.delete(accountId);
	}
	/**
	* 取一次某账号的积分。命中缓存直接返回；否则合并成一次上游请求。
	* **不抛异常**：失败以 `phase: 'error'` 返回，调用方（状态路由）照样能渲染。
	*/
	async get(accountId, credential, signal) {
		const cached = this.states.get(accountId);
		if (cached !== void 0) {
			const ttl = cached.phase === "ok" ? this.ttlMs : this.failureTtlMs;
			if (this.now() - cached.at < ttl) return cached;
		}
		const existing = this.inflights.get(accountId);
		if (existing !== void 0) return existing;
		const inflight = this.run(accountId, credential, signal).finally(() => {
			this.inflights.delete(accountId);
		});
		this.inflights.set(accountId, inflight);
		return inflight;
	}
	async run(accountId, credential, signal) {
		try {
			const state = {
				phase: "ok",
				value: await this.load(credential, signal),
				at: this.now()
			};
			this.states.set(accountId, state);
			return state;
		} catch (error) {
			const state = {
				phase: "error",
				message: error instanceof Error ? error.message : String(error),
				at: this.now()
			};
			this.states.set(accountId, state);
			return state;
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@earendil-works+pi-ai@1.3.0_05ce1760060b7c83464e6bbdb41c0e3a/node_modules/@earendil-works/pi-ai/dist/api/openai-completions.lazy.js
const openAICompletionsApi = () => lazyApi(() => import("./openai-completions-D9EdHrx9.mjs"));
//#endregion
//#region src/adapter.ts
/**
* The `codearts` pi-ai provider.
*
* One loopback-backed adapter registered into the Harness LLM seam, assembled
* from the same public `dsh-llm-pi-ai` extension points dsh-codebuddy-cli uses.
* The shim does the CodeArts wire translation; this file only describes the
* models and points pi-ai at the shim's OpenAI-compatible endpoint.
*
* MVP simplifications vs dsh-codebuddy-cli:
*   - only the default-slot credit multiplier goes into the model name (`(x0.18)`);
*     per-request cost is not modelled (subscription quota, cost reported as zero)
*   - reasoning levels are surfaced only where upstream's thinking-variants names
*     them (`GLM-5.2` → high/max); everything else stays a plain chat model
*
* @module dsh-codearts-connect/adapter
*/
/** Provider route this bundle owns. Keep in sync with cordis.patch.yml. */
const CODEARTS_PROVIDER = "codearts";
/**
* Provider idle ceiling while one stream read is outstanding.
*
* 90s 而不是常见的 300s：华为免费推理后端实测会流中途停摆（吐几个 token 后
* 长时间静默），300s 意味着用户要在"等待"里干等 5 分钟才进入自动重试。
* 90s 足够容忍首 token 冷启动与推理间隙，又能让 DSH 的重试策略
* （maxRetries=5, TIMEOUT 可重试）更快接管。
*/
const CODEARTS_STREAM_IDLE_TIMEOUT_MS = 9e4;
/** No per-token pricing is knowable for a subscription quota; report zero. */
const NO_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const REQUEST_IMAGE_BUDGETS = {
	maxRequestImageBytes: 20971520,
	requestImagePixelBudget: 4194304,
	requestImageMaxBytes: 1048576
};
/** Inert pi-ai auth plane: the codearts route authenticates only via the shim secret. */
const INERT_AUTH = {
	credentials: {
		async read() {},
		async list() {
			return [];
		},
		async modify() {
			throw new Error("dsh-codearts-connect: the codearts route has no pi-ai credential lifecycle");
		},
		async delete() {}
	},
	authContext: {
		async env() {},
		async fileExists() {
			return false;
		}
	}
};
/** pi-ai's selectable levels, in escalation order. */
const REASONING_LEVELS = [
	"off",
	"minimal",
	"low",
	"medium",
	"high",
	"xhigh",
	"max"
];
/**
* Turn upstream's thinking strengths into pi-ai reasoning metadata.
*
* Every level upstream does not declare is pinned to `null`: pi-ai treats a
* missing entry as supported, so leaving them out would offer Off/Minimal/Low/
* Medium for a model that only knows high/max. `off` is pinned as well — the
* gateway's default is already high, and claiming Off would send no effort
* field and still think.
*/
function thinkingFields(strengths) {
	const offered = new Set(strengths ?? []);
	if (!REASONING_LEVELS.some((level) => level !== "off" && offered.has(level))) return { reasoning: false };
	const map = {};
	for (const level of REASONING_LEVELS) map[level] = offered.has(level) ? level : null;
	return {
		reasoning: true,
		thinkingLevelMap: map
	};
}
/** Build one pi-ai model descriptor pointing at the loopback shim. */
function toPiModel(info, baseUrl) {
	const thinking = thinkingFields(info.thinking?.strengths);
	return {
		id: info.id,
		name: info.name,
		api: "openai-completions",
		provider: CODEARTS_PROVIDER,
		baseUrl,
		input: info.supportsImages === true ? ["text", "image"] : ["text"],
		reasoning: thinking.reasoning,
		...thinking.thinkingLevelMap === void 0 ? {} : { thinkingLevelMap: thinking.thinkingLevelMap },
		cost: NO_COST,
		contextWindow: info.contextWindow,
		maxTokens: info.maxTokens
	};
}
function createCodeArtsAdapter(options) {
	const { shim, catalog, enabledModels, resolveAttachments } = options;
	const buildModels = () => {
		const baseUrl = `${shim.baseUrl()}/v1`;
		return catalog.current().map((info) => toPiModel(info, baseUrl));
	};
	const provider = {
		...createProvider({
			id: CODEARTS_PROVIDER,
			name: "CodeArts",
			auth: { apiKey: {
				name: "CodeArts token",
				async resolve({ credential }) {
					const apiKey = credential?.key;
					return apiKey === void 0 || apiKey.length === 0 ? void 0 : {
						auth: { apiKey },
						source: "CodeArts"
					};
				}
			} },
			models: buildModels(),
			api: openAICompletionsApi()
		}),
		getModels: () => buildModels()
	};
	const profile = {
		provider: CODEARTS_PROVIDER,
		displayName: "CodeArts",
		streamIdleTimeoutMs: CODEARTS_STREAM_IDLE_TIMEOUT_MS,
		retryPolicy: resolveRetryPolicy(void 0, "dsh-codearts-connect retryPolicy"),
		configuredMaxTokens: /* @__PURE__ */ new Map(),
		modelErrors: /* @__PURE__ */ new Map(),
		...REQUEST_IMAGE_BUDGETS,
		piProvider: provider
	};
	let profiles = /* @__PURE__ */ new Map([[CODEARTS_PROVIDER, profile]]);
	return {
		adapter: new CodeArtsPiAiAdapter(catalog, enabledModels, {
			profiles: () => profiles,
			auth: INERT_AUTH,
			resolveApiKey: async () => shim.token(),
			...resolveAttachments === void 0 ? {} : { resolveAttachments }
		}),
		invalidate: () => {
			profiles = /* @__PURE__ */ new Map([[CODEARTS_PROVIDER, profile]]);
		}
	};
}
/**
* Adapter that narrows the *offered* model surface to the enabled allowlist
* (dispatch stays whole). Mirrors dsh-codebuddy-cli's CodeBuddyPiAiAdapter.
*/
var CodeArtsPiAiAdapter = class extends PiAiAdapter {
	catalog;
	enabledModels;
	constructor(catalog, enabledModels, options) {
		super(options);
		this.catalog = catalog;
		this.enabledModels = enabledModels;
	}
	async listModels(provider) {
		const models = await super.listModels(provider);
		const allowed = filterEnabledModels(this.catalog.current(), this.enabledModels?.());
		const catalogIds = new Set(this.catalog.current().map((entry) => entry.id));
		const allowedIds = new Set(allowed.map((entry) => entry.id));
		return models.filter((model) => !catalogIds.has(model.id) || allowedIds.has(model.id));
	}
	async resolveModel(provider, model, signal) {
		return super.resolveModel(provider, model, signal);
	}
};
//#endregion
//#region src/pi-ai-compat.ts
/**
* `@earendil-works/pi-ai` 运行时自检。
*
* 本插件编译时对齐的是 1.3.0，而宿主（`dsh-llm-pi-ai` 0.2.1-rc.2 起）会先把系统提示
* 折叠成一条 `role:"system"`、`content` 为**字符串**的消息，再交给 provider。1.3.0 之前
* 的 `estimateMessageTokens` 没有 system 分支：字符串内容被按字符遍历，每个"块"是单个
* 字符，`block.name` 为 undefined，于是每条消息都死在
* `Cannot read properties of undefined (reading 'length')` 上 —— 而且是在出网之前，
* 用户只看得到一句「本轮运行失败」。
*
* 什么时候会拿到旧的那份：profile 顶层被别的插件 hoist 了一个低版本，而本插件的依赖
* 没落地到自己的 `node_modules`。1.1.4 起 pi-ai 直接打包进 `lib/`（不再经 npm 解析），
* 版本漂移在结构上不可能了；这里仍探测一次，把「产物损坏/不兼容」明说，而不是让
* 每条消息各自崩在一个看不懂的 TypeError 上。
*
* 探测用能力而不是版本号：不依赖 package.json 能不能读到，也对未来的版本漂移免疫。
*
* @module dsh-codearts-connect/pi-ai-compat
*/
/** 折叠后的系统消息要能被估token；从这一版起才支持。 */
const MIN_PI_AI_VERSION = "1.3.0";
let probe;
/** 不兼容时的说明；兼容时 undefined。结果只算一次（模块加载后版本不会再变）。 */
function probePiAiCompat() {
	probe ??= runProbe();
	return probe;
}
async function runProbe() {
	const hint = `需要 @earendil-works/pi-ai >= ${MIN_PI_AI_VERSION} 的行为；1.1.4 起它已打进插件产物，探测失败说明产物损坏或被改动，请重装 dsh-codearts-connect`;
	let estimate;
	try {
		({estimateMessageTokens: estimate} = await import("./estimate-ZNuMNXp1.mjs").then((n) => n.n));
	} catch (error) {
		return `pi-ai 不兼容：读不到 @earendil-works/pi-ai/utils/estimate（${messageOf(error)}）。${hint}`;
	}
	if (typeof estimate !== "function") return `pi-ai 不兼容：这份 @earendil-works/pi-ai 没有 estimateMessageTokens。${hint}`;
	try {
		estimate({
			role: "system",
			content: "probe"
		});
	} catch (error) {
		return `pi-ai 不兼容：这份 @earendil-works/pi-ai 处理不了宿主折叠出的 system 消息（${messageOf(error)}），每条请求都会在出网前失败。${hint}`;
	}
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region src/loopback.ts
/**
* Shared loopback gates for the plugin's local HTTP surfaces: the loopback
* shim and the same-origin web-status route. Both are only ever meant to be
* addressed through the machine's loopback interface.
*
* The 127.0.0.1 bind alone is not a trust boundary (any local process or a
* DNS-rebinding page can reach 127.0.0.1), so both surfaces also check the
* Host and Origin headers.
*
* @module dsh-codearts-connect/loopback
*/
/**
* Loopback hostnames a local plugin surface may be addressed by.
*
* `0.0.0.0` and `::` are deliberately absent: they are wildcard *bind*
* addresses, not loopback identities, and accepting them in a Host header
* would let a request that never went through the loopback interface pass.
*/
const LOOPBACK_HOSTS = /* @__PURE__ */ new Set([
	"127.0.0.1",
	"localhost",
	"[::1]"
]);
/** Strip the optional :port from a Host header value, IPv6-bracket aware. */
function hostnameOfHost(host) {
	let hostname = host.trim().toLowerCase();
	if (hostname.startsWith("[")) {
		const end = hostname.indexOf("]");
		return end === -1 ? hostname : hostname.slice(0, end + 1);
	}
	const colon = hostname.lastIndexOf(":");
	if (colon !== -1 && !hostname.slice(0, colon).includes(":") && /^\d+$/.test(hostname.slice(colon + 1))) hostname = hostname.slice(0, colon);
	return hostname;
}
/**
* The request's Host header must name the loopback interface. A DNS-rebinding
* page (attacker domain re-resolved to 127.0.0.1) sends its own domain in
* Host, so this check drops those before any routing happens.
*/
function hostIsLoopback(host) {
	if (host === void 0 || host.trim() === "") return false;
	return LOOPBACK_HOSTS.has(hostnameOfHost(host));
}
/**
* A browser-sent Origin (present header) must be loopback. Non-browser
* clients (the plugin's own fetch calls) send no Origin at all and pass.
*/
function originIsLoopback(origin) {
	if (origin === void 0 || origin.trim() === "") return true;
	try {
		const { hostname } = new URL(origin);
		return LOOPBACK_HOSTS.has(hostname) || hostname === "::1";
	} catch {
		return false;
	}
}
//#endregion
//#region src/shim.ts
/**
* Loopback OpenAI-compatible endpoint for CodeArts.
*
* DSH's pi-ai provider points here. The shim validates the loopback + shared
* secret, resolves the pasted `cloud_dragon_token`, and forwards the request
* to CodeArts' `/api/v2/chat/completions` — whose SSE chunk shape is already
* OpenAI-compatible, so we pipe the upstream stream straight through.
*
* Inbound hardening (copied from dsh-codebuddy-cli): bind 127.0.0.1 only,
* require a loopback Host header, a loopback Origin, and the per-process
* shared secret as `Authorization: Bearer`. Any local attacker hitting the
* port still cannot forge the secret.
*
* @module dsh-codearts-connect/shim
*/
const REQUEST_BODY_LIMIT = 67108864;
const KIND_STATUS = {
	hard_credit: 402,
	soft_rate: 429,
	session_dead: 401,
	not_found: 502,
	server: 502,
	client: 400
};
function isJsonContentType(req) {
	const type = req.headers["content-type"];
	return typeof type === "string" && type.trim().toLowerCase().startsWith("application/json");
}
function writeJson(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"Content-Type": "application/json",
		"Content-Length": Buffer.byteLength(payload)
	});
	res.end(payload);
}
function writeOpenAIError(res, status, kind, message) {
	writeJson(res, status, { error: {
		message,
		type: kind,
		code: kind
	} });
}
/**
* 排队没等到时回给用户的那句：优先用上游自己的文案（它就是写给人看的，带位置和
* 「建议切换模型/升级套餐」），上游没给才自己拼。
*/
function queuedMessage(model, gate) {
	const upstream = gate.message.trim();
	return `${upstream === "" ? `上游排队中：${model} 第 ${gate.position} 位（共 ${gate.length} 条）` : upstream} 插件没有一直等下去，请稍后重试。`;
}
/**
* 「一个账号都选不出来」时的报错：把真实原因说清 —— 是禁用（附最后错误）、冷却
* （附剩余秒数），还是本地槽位全满。以前三种都回同一句「没有可用账号」，禁用那
* 种还把真因（比如 billion-context 本地拒签的 403）整个吞掉（issue #1）。
*
* 全部被禁用时回 401（宿主只自动重试 429，401 一次就把「去重新登录」说清）；
* 只要还有会自己恢复的（冷却/槽位满）就回 429，宿主重试有概率直接救回来。
*/
function noAccountError(accounts) {
	const now = Date.now();
	const disabled = accounts.filter((a) => a.disabled);
	const cooling = accounts.filter((a) => !a.disabled && now < a.coolUntil);
	const busy = accounts.filter((a) => !a.disabled && now >= a.coolUntil);
	const parts = [];
	if (disabled.length > 0) {
		const reasons = disabled.map((a) => a.lastError === void 0 ? a.id : `${a.id}（${a.lastError.slice(0, 120)}）`).join("、");
		parts.push(`${disabled.length} 个被禁用：${reasons}——请到设置卡片重新登录（若在用 billion-context，先检查它的 resign 配置）`);
	}
	if (cooling.length > 0) {
		const secs = Math.max(1, Math.ceil((Math.min(...cooling.map((a) => a.coolUntil)) - now) / 1e3));
		parts.push(`${cooling.length} 个在短时冷却中（约 ${secs} 秒后恢复）`);
	}
	if (busy.length > 0) parts.push(`${busy.length} 个的本地并发槽位已满（每账号最多 ${busy[0]?.maxConcurrent ?? 2} 个在飞请求），等几秒再发`);
	const message = `codearts 当前没有可用账号：${parts.join("；")}`;
	return disabled.length === accounts.length ? {
		status: 401,
		kind: "session_dead",
		message
	} : {
		status: 429,
		kind: "soft_rate",
		message
	};
}
function readBody$1(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > REQUEST_BODY_LIMIT) {
				reject(/* @__PURE__ */ new Error("request body too large"));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks)));
		req.on("error", reject);
	});
}
/** 一次请求最多试几个账号（与 Go 参考的 MaxRotate 一致）。 */
const MAX_ROTATE = 3;
const MAX_CEILING_HEALS = 3;
/**
* 所有账号都撞上并发上限时，回落到「在同一账号上原地重发」的预算。
*
* 2026-09-30 实测：一个上游会话要 ~52s 才被释放，而且**中途打断并不减免** ——
* 只跑了 98ms 就中止的请求，同样占满一个名额 52s。所以用户「打断 → 马上重问」
* 时等的就是这个 52s。池里有别的账号时下面会直接换号（不用等）；这条是最后一根
* 稻草，必须盖过 52s，否则用户看到的不是「稍等一下」而是直接失败。
*
* 上限受 pi-ai 的 90s idle 超时约束：等待期间我们发不出任何内容，超过 90s 用户
* 看到的就是超时。75s 给 52s 留了余量，也还在 90s 之内。
*/
const CAP_WAIT_LIMIT = 75e3;
const CAP_RETRY_GAP = 3e3;
/** 上游 5xx 后短时冷却该账号。 */
const SERVER_COOLDOWN_MS = 3e4;
/** 零散错误累计到阈值后冷却该账号。 */
const ERROR_COOLDOWN_MS = 6e4;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const recentShapes = [];
/** 最近的请求形状，最新在前。 */
function recentRequestShapes() {
	return [...recentShapes].reverse();
}
function noteRequestShape(raw, model) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return;
	}
	if (parsed === null || typeof parsed !== "object") return;
	const list = Array.isArray(parsed.messages) ? parsed.messages : [];
	const roles = list.map((message) => {
		if (message === null || typeof message !== "object") return "";
		const role = message.role;
		return typeof role === "string" ? role : "";
	});
	recentShapes.push({
		at: Date.now(),
		model,
		messages: list.length,
		roles,
		emptyRoleAt: roles.map((role, index) => role === "" ? index : -1).filter((index) => index >= 0),
		tools: Array.isArray(parsed.tools) ? parsed.tools.length : 0
	});
	if (recentShapes.length > 8) recentShapes.shift();
}
function createCodeArtsShim(options) {
	const { store, catalog } = options;
	const logger = options.logger;
	const usage = options.usage;
	const queue = options.queue;
	const pool = options.pool ?? new CodeArtsAccountPool([]);
	const SHARED_SECRET = randomBytes(32).toString("base64url");
	function bearerOk(req) {
		const header = req.headers.authorization;
		if (typeof header !== "string") return false;
		const match = /^Bearer\s+(.+)$/i.exec(header.trim());
		if (match === null) return false;
		const presented = match[1];
		const a = Buffer.from(presented);
		const b = Buffer.from(SHARED_SECRET);
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	}
	const server = createServer((req, res) => {
		handle(req, res);
	});
	const ready = new Promise((resolve, reject) => {
		server.once("listening", () => resolve());
		server.once("error", reject);
	});
	server.listen(0, "127.0.0.1");
	const baseUrl = () => {
		const address = server.address();
		if (address === null || typeof address === "string") throw new Error("codearts shim has no listening address");
		return `http://127.0.0.1:${address.port}`;
	};
	async function handle(req, res) {
		try {
			if (!hostIsLoopback(req.headers.host)) {
				writeOpenAIError(res, 403, "host_not_allowed", "Host header must name the loopback interface");
				return;
			}
			if (!originIsLoopback(req.headers.origin)) {
				writeOpenAIError(res, 403, "origin_not_allowed", "Origin must be a loopback origin");
				return;
			}
			if (!bearerOk(req)) {
				writeOpenAIError(res, 401, "unauthorized", "missing or invalid Authorization bearer");
				return;
			}
			const url = req.url ?? "/";
			if (req.method === "GET" && (url === "/healthz" || url === "/healthz/")) {
				writeJson(res, 200, { ok: true });
				return;
			}
			if (req.method === "GET" && (url === "/v1/models" || url === "/v1/models/")) {
				writeJson(res, 200, {
					object: "list",
					data: catalog.current().map((model) => ({
						id: model.id,
						object: "model",
						created: 0,
						owned_by: "codearts"
					}))
				});
				return;
			}
			if (req.method === "POST" && (url === "/v1/chat/completions" || url === "/v1/chat/completions/")) {
				await chatCompletions(req, res);
				return;
			}
			writeOpenAIError(res, 404, "not_found", `no such route: ${req.method} ${url}`);
		} catch (error) {
			if (!res.headersSent) writeOpenAIError(res, 500, "internal", String(error));
			else res.end();
		}
	}
	/** 该模型的上下文窗口（catalog 里查，大小写不敏感）；查不到返回 0 = 不做超长预判。 */
	function contextWindowFor(id) {
		const lower = id.trim().toLowerCase();
		for (const model of catalog.current()) if (model.id.toLowerCase() === lower) return model.contextWindow;
		return 0;
	}
	/**
	* 打开上游流；撞到「参数非法」就把该模型的 max_tokens 上限折半降一档再开一次。
	*
	* 上游的 max_tokens 上限由服务端控制、会漂（GLM-5.2 标称 131072，2026-10-10 起
	* 直接被拒），手工实测表必然滞后。而这类错误是**流内**帧（HTTP 仍 200），只能在
	* 第一帧判 —— 此时还没有任何内容产出，重发是安全的。降档结果记在 upstream 的
	* 进程内表里，该模型后续请求直接从新上限起步，不必每轮再白撞一次。
	*/
	async function openWithCeilingHeal(credential, raw, contextWindow, signal) {
		for (let heal = 0;; heal += 1) {
			const prepared = prepareChatBody(raw, contextWindow);
			if (prepared.error !== void 0) return {
				prepared,
				result: {
					ok: false,
					kind: "client",
					status: 400,
					message: prepared.error
				}
			};
			const result = await chatStream(credential, prepared, signal);
			if (!result.ok) return {
				prepared,
				result
			};
			const reader = result.stream.getReader();
			const first = await reader.read();
			const head = first.done ? void 0 : first.value;
			const rate = head === void 0 ? void 0 : rateLimitFrame(new TextDecoder().decode(head));
			if (rate !== void 0) {
				reader.releaseLock();
				await result.stream.cancel().catch(() => {});
				logger?.warn(`dsh-codearts-connect: ${prepared.model} 首帧被判限流（${rate.code}），进入本地排队`);
				return {
					prepared,
					result: {
						ok: false,
						kind: "soft_rate",
						status: 429,
						message: `${rate.code}: ${rate.message}`
					}
				};
			}
			const shouldHeal = heal < MAX_CEILING_HEALS && head !== void 0 && isParamInvalidFrame(new TextDecoder().decode(head));
			reader.releaseLock();
			if (!shouldHeal) return {
				prepared,
				result,
				head
			};
			await result.stream.cancel().catch(() => {});
			if (degradeTokenCeiling(prepared.model) === 0) return {
				prepared,
				result: {
					ok: false,
					kind: "client",
					status: 400,
					message: `${prepared.model}: max_tokens 已降到下限仍被判参数非法`
				}
			};
			logger?.warn(`dsh-codearts-connect: ${prepared.model} 被判参数非法，max_tokens 降档到 ${maxTokensCeilingFor(prepared.model)} 后重发`);
		}
	}
	/**
	* 在**同一个账号**上重发，直到不再被限流或预算耗尽。
	*
	* 并发槽位是账号级的：有别的号就该换号，等 52s 是最后手段。
	* TPM 是模型级配额：换号只是换个账号撞同一堵墙，只能原地等窗口滑过去 ——
	* 间隔逐次翻倍（3s → 6s → 12s → 24s，封顶 30s），避免在配额已经满的时候
	* 把重试本身也打成一波流量。
	*
	* 命中限流不甩给 pi-ai：429 会被重试 5 次，每次再撞一次限流，越试越满。
	*/
	async function openStream(credential, raw, contextWindow, signal) {
		const started = Date.now();
		const until = started + CAP_WAIT_LIMIT;
		let gap = CAP_RETRY_GAP;
		for (;;) {
			const opened = await openWithCeilingHeal(credential, raw, contextWindow, signal);
			const waitedMs = Date.now() - started;
			if (opened.result.ok || signal.aborted) return {
				...opened,
				waitedMs
			};
			if (!isQueueableRate(opened.result)) return {
				...opened,
				waitedMs
			};
			if (isTpmLimit(opened.result)) gap = Math.min(gap * 2, 3e4);
			if (Date.now() + gap > until) return {
				...opened,
				waitedMs
			};
			await sleep(gap);
		}
	}
	/** 先交回降档判定读过的那一帧（它是流的开头，丢了就少一段），再接着读剩下的。 */
	async function* drainFrames(reader, head) {
		if (head !== void 0) yield head;
		for (;;) {
			const { done, value } = await reader.read();
			if (done) return;
			if (value !== void 0) yield value;
		}
	}
	async function chatCompletions(req, res) {
		if (!isJsonContentType(req)) {
			writeOpenAIError(res, 415, "unsupported_media_type", "Content-Type must be application/json");
			return;
		}
		const raw = (await readBody$1(req)).toString("utf8");
		let contextWindow = 0;
		try {
			const inbound = JSON.parse(raw);
			if (typeof inbound.model === "string") contextWindow = contextWindowFor(canonicalModel(inbound.model));
		} catch {}
		const checked = prepareChatBody(raw, contextWindow);
		noteRequestShape(raw, checked.model);
		if (checked.error !== void 0) {
			writeOpenAIError(res, 400, "context_overflow", checked.error);
			return;
		}
		const wantsImage = raw.includes("\"image_url\"") || raw.includes("\"type\":\"image\"");
		const modelInfo = catalog.current().find((model) => model.id.toLowerCase() === checked.model.toLowerCase());
		if (wantsImage && modelInfo?.supportsImages === false) {
			writeOpenAIError(res, 400, "image_not_supported", IMAGE_UNSUPPORTED_MESSAGE);
			return;
		}
		const controller = new AbortController();
		res.on("close", () => {
			if (!res.writableEnded) controller.abort();
		});
		let ids;
		try {
			ids = await store.ids();
		} catch (error) {
			writeOpenAIError(res, 401, "not_signed_in", String(error));
			return;
		}
		if (ids.length === 0) {
			writeOpenAIError(res, 401, "not_signed_in", "no CodeArts account stored; sign in from the CodeArts settings card");
			return;
		}
		pool.sync(ids);
		const preferred = options.preferredAccount?.();
		const preferredId = preferred !== void 0 && ids.includes(preferred) ? preferred : void 0;
		const tried = /* @__PURE__ */ new Set();
		let cappedAccount;
		let tpmAccount;
		let queueWaitedMs = 0;
		let lastKind;
		let lastStatus = 0;
		let lastMessage = "";
		for (let attempt = 0; attempt < MAX_ROTATE; attempt += 1) {
			const id = pool.pick(tried, attempt === 0 ? preferredId : void 0);
			if (id === void 0) break;
			tried.add(id);
			if (!pool.acquire(id)) continue;
			try {
				const credential = await store.resolve(id);
				if (credential === void 0) {
					pool.disable(id, "no credential");
					continue;
				}
				if (queue !== void 0) {
					const gate = await queue.wait(credential, checked.chatId, checked.model, controller.signal);
					if (controller.signal.aborted) return;
					if (gate.kind === "queued") {
						writeOpenAIError(res, 400, "queued", queuedMessage(checked.model, gate));
						return;
					}
					if (gate.kind === "queue_full" || gate.kind === "error") {
						writeOpenAIError(res, gate.kind === "queue_full" ? 429 : 502, gate.kind, gate.message);
						return;
					}
				}
				const opened = await openWithCeilingHeal(credential, raw, contextWindow, controller.signal);
				const { prepared, result } = opened;
				if (controller.signal.aborted) {
					if (result.ok) await result.stream.cancel().catch(() => {});
					return;
				}
				if (result.ok) {
					pool.noteSuccess(id);
					await pipeToResponse(res, result.stream, controller.signal, {
						accountId: id,
						model: prepared.model
					}, opened.head);
					return;
				}
				lastKind = result.kind;
				lastStatus = result.status;
				lastMessage = result.message;
				if (isConcurrencyCap(result)) {
					pool.noteConcurrencyCap(id);
					cappedAccount = id;
					continue;
				}
				if (isTpmLimit(result)) {
					tpmAccount = id;
					break;
				}
				if (result.kind === "session_dead") {
					pool.disable(id, result.message);
					continue;
				}
				if (result.kind === "server" || result.kind === "soft_rate") {
					pool.cooldown(id, SERVER_COOLDOWN_MS, result.message);
					break;
				}
				pool.noteError(id, 3, ERROR_COOLDOWN_MS, result.message);
				break;
			} finally {
				pool.release(id);
			}
		}
		if (controller.signal.aborted) return;
		const queueAccount = cappedAccount ?? tpmAccount;
		if (queueAccount !== void 0) {
			if (pool.acquire(queueAccount)) try {
				const credential = await store.resolve(queueAccount);
				if (credential !== void 0) {
					const opened = await openStream(credential, raw, contextWindow, controller.signal);
					const { result } = opened;
					queueWaitedMs = opened.waitedMs;
					if (controller.signal.aborted) {
						if (result.ok) await result.stream.cancel().catch(() => {});
						return;
					}
					if (result.ok) {
						pool.noteSuccess(queueAccount);
						await pipeToResponse(res, result.stream, controller.signal, {
							accountId: queueAccount,
							model: opened.prepared.model
						}, opened.head);
						return;
					}
					lastKind = result.kind;
					lastStatus = result.status;
					lastMessage = result.message;
				}
			} finally {
				pool.release(queueAccount);
			}
		}
		if (lastKind === void 0) {
			const none = noAccountError(pool.list());
			writeOpenAIError(res, none.status, none.kind, none.message);
			return;
		}
		const explanation = upstreamErrorMessage(lastMessage, lastStatus);
		const waited = queueWaitedMs >= 1e3 ? `（本地已排队重试 ${Math.round(queueWaitedMs / 1e3)} 秒）` : "";
		writeOpenAIError(res, KIND_STATUS[lastKind], lastKind, `${explanation}${waited}`);
	}
	/**
	* 记下一帧里的上游流内错误。判据宽松（帧文本含 "error" 才解析），解析不出来就忽略 ——
	* 诊断不能影响转发。
	*/
	function logInStreamError(frame, model) {
		try {
			const payload = frame.startsWith("data:") ? frame.slice(5).trim() : frame;
			const ev = JSON.parse(payload);
			if (ev.error === void 0) return;
			const code = String(ev.error.code ?? "");
			const message = String(ev.error.message ?? "").slice(0, 200);
			logger?.error(`dsh-codearts-connect: 上游流内报错 model=${model} code=${code} msg=${message}`);
		} catch {}
	}
	/** 把上游 SSE 按事件边界转发给 DSH，直到流结束或被中止。 */
	async function pipeToResponse(res, stream, signal, attribution, head) {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			"X-Accel-Buffering": "no"
		});
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		let buf = "";
		if (usage !== void 0 && attribution !== void 0) usage.noteRequest(attribution.accountId, attribution.model);
		let sawDone = false;
		const finish = () => {
			if (!res.writable || res.writableEnded) return;
			res.end(sawDone ? void 0 : "data: [DONE]\n\n");
		};
		try {
			for await (const value of drainFrames(reader, head)) {
				buf += decoder.decode(value, { stream: true });
				let idx;
				while ((idx = buf.indexOf("\n\n")) >= 0) {
					const frame = buf.slice(0, idx);
					buf = buf.slice(idx + 2);
					if (!frame) continue;
					if (frame.trim() === "data: [DONE]") sawDone = true;
					if (frame.includes("\"error\"")) logInStreamError(frame, attribution?.model ?? "");
					if (usage !== void 0 && attribution !== void 0 && frame.includes("\"usage\"")) recordFrameUsage(frame, attribution);
					if (res.writable) res.write(frame + "\n\n");
				}
			}
			finish();
		} catch (error) {
			if (!signal.aborted) logger?.warn("dsh-codearts-connect: upstream stream failed mid-flight", error);
			finish();
		}
	}
	/** 从一帧 SSE 文本里取 usage 计入账本（解析失败就算了，不能影响转发）。 */
	function recordFrameUsage(frame, attribution) {
		if (usage === void 0) return;
		for (const line of frame.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed.startsWith("data:")) continue;
			const payload = trimmed.slice(5).trim();
			if (payload === "" || payload === "[DONE]") continue;
			try {
				const parsed = JSON.parse(payload);
				if (parsed.usage !== void 0 && parsed.usage !== null) usage.noteUsage(attribution.accountId, attribution.model, parsed.usage);
			} catch {}
		}
	}
	return {
		ready,
		baseUrl,
		token: () => SHARED_SECRET,
		close: () => new Promise((resolve, reject) => {
			server.close(() => resolve());
			server.closeAllConnections();
			server.once("error", reject);
		})
	};
}
//#endregion
//#region src/web-status.ts
/** 登录后问身份的超时：它是「顺手做对」，不能拖住登录落库。 */
const IDENTITY_TIMEOUT_MS = 8e3;
/** Route paths (same-origin under the DSH web origin). */
const CODEARTS_STATUS_PATH = "/api/codearts/status";
const CODEARTS_MODELS_PATH = "/api/codearts/models";
const CODEARTS_MODELS_SELECTION_PATH = "/api/codearts/enabled-models";
const CODEARTS_TOKEN_PATH = "/api/codearts/token";
const CODEARTS_LOGIN_PATH = "/api/codearts/login";
const CODEARTS_LOGIN_STATUS_PATH = "/api/codearts/login/status";
/** 删除某个账号：DELETE /api/codearts/accounts?id=<accountId> */
const CODEARTS_ACCOUNTS_PATH = "/api/codearts/accounts";
/** POST /api/codearts/account-preference { id } — 手动指定优先账号（空串/ null = 自动轮转）。 */
const CODEARTS_ACCOUNT_PREFERENCE_PATH = "/api/codearts/account-preference";
/** POST /api/codearts/claim — 领一次福利中心的每日签到积分（幂等由上游按天去重）。 */
const CODEARTS_CLAIM_PATH = "/api/codearts/claim";
/** POST /api/codearts/refresh-models — 立刻重拉一次模型目录，并清掉「福利今日不可用」标记。 */
const CODEARTS_REFRESH_MODELS_PATH = "/api/codearts/refresh-models";
/** GET /api/codearts/queue — 上游排队位置（只在等开流期间有值，底部积分条旁边展示）。 */
const CODEARTS_QUEUE_PATH = "/api/codearts/queue";
/**
* GET/POST /api/codearts/dock — 对话底部那一行的显隐开关。
* GET 给当前值与 writable，POST 收 `{credits?, queue?}` 写进 settings。
*/
const CODEARTS_DOCK_PATH = "/api/codearts/dock";
/** 最近出站请求的**形状**摘要（只有 role 名与计数，不含内容），排障用。 */
const CODEARTS_DEBUG_PATH = "/api/codearts/debug";
/**
* 由完整目录 + 已存 enabled 计算 selection。
* - enabled 为空/未存 => 全部勾选（restricted=false）
* - enabled 为非空列表 => 仅勾选其中的（restricted=true），缺的按未勾选
* 福利模型用 catalog 的 benefit 标记（这里靠 model.benefit 字段，由调用方注入）。
*/
function selectionOf(models, enabled, writable) {
	const allowed = new Set(enabled ?? []);
	const restricted = enabled !== void 0 && enabled.length > 0;
	return {
		choices: models.map((m) => ({
			id: m.id,
			name: m.name,
			benefit: m.benefit,
			blocked: m.blocked,
			ratio: m.ratio,
			supportsImages: m.supportsImages,
			enabled: restricted ? allowed.has(m.id) : true
		})),
		restricted,
		writable
	};
}
/** 目录 -> 勾选 UI 的选项（福利标记、今日不可用标记与倍率都在这里算）。 */
function choicesOf(deps) {
	return deps.models().map((m) => {
		const benefit = isBenefitModel(m.id);
		const ratio = creditRatioLabel(m.ratio, benefit);
		return {
			id: m.id,
			name: m.name,
			benefit,
			blocked: isBenefitBlocked(m.id),
			...ratio === void 0 ? {} : { ratio },
			...m.supportsImages === true ? { supportsImages: true } : {}
		};
	});
}
/**
* 目录 -> 底栏/卡片用的模型徽章。
*
* 倍率在这里就算好（`creditRatioLabel`：福利恒为 `x0.00`），客户端拿到的是可以直接
* 印出来的字符串 —— 底栏那一行要把它作为独立的一段，所以不能只给带尾巴的名字。
*/
function modelBadgesOf(models) {
	return models.map((m) => {
		const ratio = creditRatioLabel(m.ratio, isBenefitModel(m.id));
		return {
			id: m.id,
			name: m.name,
			...ratio === void 0 ? {} : { ratio }
		};
	});
}
/** 开关的默认值：没有 settings provider（或老配置没这两个键）时保持原有行为 —— 都显示。 */
const DEFAULT_DOCK_FLAGS = {
	credits: true,
	queue: true
};
/**
* 把逐账号的领取结果汇总成一条：HTTP 层只看 ok，卡片看 results 逐号展示。
* 有一个号失败就算整批 ok=false，但别的号领到的结果照样在 results 里。
*/
function summarizeClaims(results) {
	const failed = results.find((result) => result.state === "failed");
	const claimed = results.filter((result) => result.claimed);
	const messages = [...new Set(results.map((result) => result.message).filter((message) => message !== ""))];
	return {
		ok: results.length > 0 && failed === void 0,
		claimed: claimed.length > 0,
		state: claimed.length > 0 ? "claimed" : failed?.state ?? results[0]?.state ?? "failed",
		amount: claimed.reduce((sum, result) => sum + result.amount, 0),
		message: results.length === 1 ? results[0].message : messages.join("; ").slice(0, 300),
		results
	};
}
function json(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"Content-Type": "application/json",
		"Content-Length": Buffer.byteLength(payload)
	});
	res.end(payload);
}
function loopbackRequest(req) {
	return hostIsLoopback(req.headers.host) && originIsLoopback(req.headers.origin);
}
function safeMessage(error) {
	return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}
function readBody(req, limit = 1 << 20) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > limit) {
				reject(/* @__PURE__ */ new Error("request body too large"));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		req.on("error", reject);
	});
}
/** Build the status document (no token material crosses to the browser). */
/**
* 登录后立刻问一次身份（有超时，失败返回 null）。
*
* 这一步是「尽量做对」而不是必须：拿不到身份也要能把账号存下来，只是会退回
* 「每次登录各自成一条」的旧行为。
*/
async function probeIdentity(token) {
	const credential = {
		token: token.securityToken,
		accessKeyId: token.accessKeyId,
		secretAccessKey: token.secretAccessKey,
		securityToken: token.securityToken
	};
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), IDENTITY_TIMEOUT_MS);
	timer.unref?.();
	try {
		return await fetchCallerIdentity(credential, controller.signal);
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}
/** 账号还能用吗（没被标 stale、也没过期）。 */
function accountUsable(summary) {
	if (summary.stale) return false;
	if (typeof summary.expiration !== "string") return true;
	const at = Date.parse(summary.expiration);
	return !Number.isFinite(at) || at > Date.now();
}
/** 池状态 -> 卡片能直接渲染的槽位信息。 */
function slotsOf(deps) {
	const runtime = deps.pool?.() ?? [];
	const now = Date.now();
	return runtime.map((account) => {
		const state = account.disabled ? "disabled" : now < account.coolUntil ? "cooling" : now < account.cappedUntil ? "capped" : "ok";
		const detail = state === "capped" ? `upstream session cap hit; avoiding it for ~${Math.ceil((account.cappedUntil - now) / 1e3)}s` : state === "cooling" ? `cooling down for ~${Math.ceil((account.coolUntil - now) / 1e3)}s` : state === "disabled" ? account.lastError ?? "disabled" : void 0;
		return {
			id: account.id,
			active: account.activeConcurrent,
			max: account.maxConcurrent,
			state,
			...detail === void 0 ? {} : { detail }
		};
	});
}
/** 用量账本 -> 卡片文档；没有账本（未注入）时给一份空壳，卡片就不会瞎显示。 */
function usageOf(deps) {
	const snapshot = deps.usage?.();
	const noTotals = {
		requests: 0,
		promptTokens: 0,
		completionTokens: 0,
		totalTokens: 0
	};
	return {
		today: snapshot?.today ?? noTotals,
		allTime: snapshot?.allTime ?? noTotals,
		last30: snapshot?.last30 ?? noTotals,
		byModelToday: snapshot?.byModelToday ?? [],
		byAccountToday: snapshot?.byAccountToday ?? {},
		days: snapshot?.days ?? 0,
		...snapshot?.lastAt === void 0 ? {} : { lastAt: snapshot.lastAt },
		slots: slotsOf(deps)
	};
}
/**
* 积分区块。
*
* 积分是「锦上添花」：拉不到也绝不能把状态接口本身拖垮，所以失败一律降级成
* `creditsError` 交给卡片显示原因（超时由注入方在自己的闭包里保证）。
*
* `force` 是给对话底部弹层那个「刷新积分」按钮用的：不强制的话它会命中 60 秒缓存，
* 按钮点了数字不动 —— 那还不如不给这个按钮。
*/
async function creditsOf(deps, force) {
	const load = force ? deps.refreshCredits ?? deps.credits : deps.credits;
	if (load === void 0) return {};
	try {
		const entries = await load();
		const primary = entries.find((entry) => entry.credits !== void 0) ?? entries[0];
		return {
			...primary?.credits === void 0 ? {} : { credits: primary.credits },
			...primary?.credits === void 0 && primary?.creditsError !== void 0 ? { creditsError: primary.creditsError } : {},
			...entries.length === 0 ? {} : { creditsByAccount: entries }
		};
	} catch (error) {
		return { creditsError: safeMessage(error) };
	}
}
async function buildStatus(deps, force = false) {
	const models = modelBadgesOf(deps.models());
	const accounts = await deps.store.list();
	const cred = await deps.store.current();
	const usage = usageOf(deps);
	const dock = deps.dock === void 0 ? {} : { dock: deps.dock() };
	const preference = deps.preferredAccount === void 0 ? {} : { preferredAccountId: deps.preferredAccount() ?? "" };
	const piAi = await probePiAiCompat();
	const compat = piAi === void 0 ? {} : { piAiError: piAi };
	if (accounts.length === 0 || cred === void 0) return {
		status: "signed-out",
		models,
		accounts,
		usage,
		...dock,
		...preference,
		...compat
	};
	const usable = accounts.some(accountUsable);
	const identity = {
		...cred.label === void 0 ? {} : { label: cred.label },
		...cred.storedAt === void 0 ? {} : { storedAt: cred.storedAt },
		models,
		accounts,
		usage,
		...dock,
		...preference
	};
	if (!usable) return {
		status: "expired",
		...identity,
		...compat
	};
	return {
		status: "signed-in",
		...identity,
		...compat,
		...await creditsOf(deps, force)
	};
}
/** GET /api/codearts/status */
function statusHandler(deps) {
	return async (req, res) => {
		if (req.method !== "GET") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		try {
			json(res, 200, await buildStatus(deps, new URL(req.url ?? "", "http://localhost").searchParams.get("force") === "1"));
		} catch (error) {
			json(res, 500, { error: safeMessage(error) });
		}
	};
}
/**
* GET/POST /api/codearts/dock — 对话底部那一行的显隐开关读写。
*
* 和 enabled-models 同一套规矩：GET 给当前值 + writable，POST 只收布尔、
* 没接 settings provider 时回 403 让卡片把勾选框置灰。
*/
function dockHandler(deps) {
	return async (req, res) => {
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		const current = deps.dock?.() ?? DEFAULT_DOCK_FLAGS;
		if (req.method === "GET") {
			json(res, 200, {
				dock: current,
				writable: deps.setDock !== void 0
			});
			return;
		}
		if (req.method === "POST") {
			if (deps.setDock === void 0) {
				json(res, 403, { error: "dock-not-writable" });
				return;
			}
			const type = req.headers["content-type"];
			if (typeof type !== "string" || !type.trim().toLowerCase().startsWith("application/json")) {
				json(res, 415, { error: "content-type must be application/json" });
				return;
			}
			try {
				const body = JSON.parse(await readBody(req));
				const touched = ["credits", "queue"].filter((key) => body[key] !== void 0);
				if (touched.length === 0 || touched.some((key) => typeof body[key] !== "boolean")) {
					json(res, 400, { error: "expected {\"credits\"?: boolean, \"queue\"?: boolean}" });
					return;
				}
				if (!await deps.setDock(Object.fromEntries(touched.map((key) => [key, body[key]])))) {
					json(res, 403, { error: "dock-not-writable" });
					return;
				}
				json(res, 200, {
					dock: deps.dock?.() ?? DEFAULT_DOCK_FLAGS,
					writable: true
				});
			} catch (error) {
				json(res, 500, { error: safeMessage(error) });
			}
			return;
		}
		json(res, 405, { error: "method not allowed" });
	};
}
/** GET /api/codearts/models — currently offered model ids (honours allowlist). */
function modelsHandler(deps) {
	return async (req, res) => {
		if (req.method !== "GET") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		json(res, 200, { models: modelBadgesOf(filterEnabledModels(deps.models(), deps.enabledModels?.())) });
	};
}
/**
* GET/POST /api/codearts/enabled-models — 模型勾选的读写。
* GET 返回 selection（choices + restricted + writable）；POST 接收 {enabledModels}
* 写入 settings（全选时传空数组表示"全部"）。与 codebuddy 的 /plugins/<id>/enabled-models 对齐。
*/
function modelsSelectionHandler(deps) {
	return async (req, res) => {
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		if (req.method === "GET") {
			const all = choicesOf(deps);
			const writable = deps.setEnabledModels !== void 0;
			json(res, 200, { selection: selectionOf(all, deps.enabledModels?.(), writable) });
			return;
		}
		if (req.method === "POST") {
			if (!deps.setEnabledModels) {
				json(res, 403, { error: "selection-not-writable" });
				return;
			}
			const type = req.headers["content-type"];
			if (typeof type !== "string" || !type.trim().toLowerCase().startsWith("application/json")) {
				json(res, 415, { error: "content-type must be application/json" });
				return;
			}
			try {
				const body = JSON.parse(await readBody(req));
				if (!Array.isArray(body.enabledModels) || !body.enabledModels.every((x) => typeof x === "string")) {
					json(res, 400, { error: "expected {\"enabledModels\": string[]}" });
					return;
				}
				if (!await deps.setEnabledModels(body.enabledModels)) {
					json(res, 403, { error: "selection-not-writable" });
					return;
				}
				json(res, 200, { selection: selectionOf(choicesOf(deps), deps.enabledModels?.(), true) });
			} catch (error) {
				json(res, 500, { error: safeMessage(error) });
			}
			return;
		}
		json(res, 405, { error: "method not allowed" });
	};
}
/** POST /api/codearts/token { token, label? } — store a pasted token. */
function tokenPostHandler(deps) {
	return async (req, res) => {
		if (req.method !== "POST") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		const type = req.headers["content-type"];
		if (typeof type !== "string" || !type.trim().toLowerCase().startsWith("application/json")) {
			json(res, 415, { error: "content-type must be application/json" });
			return;
		}
		try {
			const body = JSON.parse(await readBody(req));
			const token = typeof body?.token === "string" ? body.token.trim() : "";
			if (token === "") {
				json(res, 400, { error: "expected {\"token\": string}" });
				return;
			}
			const label = typeof body?.label === "string" && body.label.trim() !== "" ? body.label.trim() : void 0;
			await deps.store.set(token, label);
			deps.reviveAccount?.(MANUAL_ACCOUNT_ID);
			json(res, 200, await buildStatus(deps));
		} catch (error) {
			json(res, 500, { error: safeMessage(error) });
		}
	};
}
/** DELETE /api/codearts/token — forget the stored token. */
function tokenDeleteHandler(deps) {
	return async (req, res) => {
		if (req.method !== "DELETE") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!hostIsLoopback(req.headers.host) || !originIsLoopback(req.headers.origin)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		try {
			await deps.store.clear();
			if (deps.preferredAccount?.() !== void 0) await deps.setPreferredAccount?.("");
			json(res, 200, await buildStatus(deps));
		} catch (error) {
			json(res, 500, { error: safeMessage(error) });
		}
	};
}
/**
* DELETE /api/codearts/accounts?id=<accountId> — 删掉一个账号。
*
* id 必须显式给：多账号下「删掉当前那个」是歧义的。改状态的路由，所以和
* /token 一样走 Host + Origin 双校验。
*/
function accountsHandler(deps) {
	return async (req, res) => {
		if (req.method !== "DELETE") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		const id = (new URL(req.url ?? "", "http://localhost").searchParams.get("id") ?? "").trim();
		if (id === "") {
			json(res, 400, { error: "expected ?id=<accountId>" });
			return;
		}
		try {
			await deps.store.remove(id);
			if (deps.preferredAccount?.() === id) await deps.setPreferredAccount?.("");
			json(res, 200, await buildStatus(deps));
		} catch (error) {
			json(res, 500, { error: safeMessage(error) });
		}
	};
}
/**
* POST /api/codearts/account-preference { id } — 手动指定优先账号。
*
* `id` 为空串或 null 表示恢复自动轮转。只接受已存账号的 id：写一个不存在的
* 账号只会让状态接口回一个永远匹配不上的首选，用户看不出哪里错了。
*/
function accountPreferenceHandler(deps) {
	return async (req, res) => {
		if (req.method !== "POST") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		if (deps.setPreferredAccount === void 0) {
			json(res, 403, { error: "account-preference-not-writable" });
			return;
		}
		const setPreferred = deps.setPreferredAccount;
		const type = req.headers["content-type"];
		if (typeof type !== "string" || !type.trim().toLowerCase().startsWith("application/json")) {
			json(res, 415, { error: "content-type must be application/json" });
			return;
		}
		try {
			const parsed = JSON.parse(await readBody(req));
			if (parsed === null || typeof parsed !== "object") {
				json(res, 400, { error: "expected {\"id\": string | null}" });
				return;
			}
			const body = parsed;
			if (body.id !== void 0 && body.id !== null && typeof body.id !== "string") {
				json(res, 400, { error: "expected {\"id\": string | null}" });
				return;
			}
			const id = typeof body.id === "string" ? body.id.trim() : "";
			if (id !== "") {
				if (!(await deps.store.ids()).includes(id)) {
					json(res, 400, { error: "unknown account" });
					return;
				}
			}
			if (!await setPreferred(id)) {
				json(res, 403, { error: "account-preference-not-writable" });
				return;
			}
			json(res, 200, { preferredAccountId: id });
		} catch (error) {
			json(res, 500, { error: safeMessage(error) });
		}
	};
}
/** POST /api/codearts/claim — 领一次每日签到积分；未领到也回 200（看 claimed/state）。 */
function claimHandler(deps) {
	return async (req, res) => {
		if (req.method !== "POST") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (deps.claim === void 0) {
			json(res, 404, { error: "claim not available" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		let accountId;
		const type = req.headers["content-type"];
		if (typeof type === "string" && type.trim().toLowerCase().startsWith("application/json")) try {
			const body = JSON.parse(await readBody(req));
			if (typeof body?.id === "string" && body.id.trim() !== "") accountId = body.id.trim();
		} catch {
			json(res, 400, { error: "expected {\"id\"?: string}" });
			return;
		}
		try {
			const result = await deps.claim(accountId);
			json(res, result.ok ? 200 : 500, result);
		} catch (error) {
			json(res, 500, {
				ok: false,
				claimed: false,
				state: "failed",
				amount: 0,
				message: safeMessage(error)
			});
		}
	};
}
/**
* POST /api/codearts/refresh-models — 立刻重拉目录，并清掉「福利今日不可用」标记。
*
* 清标记放在拉目录**之前**：福利回来时这是唯一的自救出口，不能让用户等到明天。
* 代价是「今天确实领完了」的那种缺失也会被一并清掉，再点一次就重新记上。
*/
function refreshModelsHandler(deps) {
	return async (req, res) => {
		if (req.method !== "POST") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		if (deps.refreshModels === void 0) {
			json(res, 404, { error: "refresh not available" });
			return;
		}
		try {
			clearBenefitBlocked();
			clearImageBlocked();
			const counted = await deps.refreshModels();
			const selection = selectionOf(choicesOf(deps), deps.enabledModels?.(), deps.setEnabledModels !== void 0);
			json(res, 200, {
				ok: true,
				...counted,
				selection
			});
		} catch (error) {
			json(res, 500, {
				ok: false,
				message: safeMessage(error)
			});
		}
	};
}
/** GET /api/codearts/queue — 排队位置快照（无跟踪器/无排队时给空数组）。 */
function queueHandler(deps) {
	return async (req, res) => {
		if (req.method !== "GET") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		json(res, 200, { queue: deps.queue?.() ?? [] });
	};
}
/** GET /api/codearts/debug — 最近出站请求的形状摘要（只有 role 名与计数）。 */
function debugHandler(deps) {
	return async (req, res) => {
		if (req.method !== "GET") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!loopbackRequest(req)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		json(res, 200, { requests: deps.recentRequests?.() ?? [] });
	};
}
/** Mount the status / models / token routes. */
function registerCodeArtsStatusRoute(ctx, deps) {
	ctx.effect(() => {
		const activeLogins = /* @__PURE__ */ new Map();
		/** 已结束登录的终态，供迟到的轮询读取。被读一次即删。 */
		const recentLogins = /* @__PURE__ */ new Map();
		const disposeStatus = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_STATUS_PATH,
			handler: statusHandler(deps)
		});
		const disposeModels = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_MODELS_PATH,
			handler: modelsHandler(deps)
		});
		const disposeModelsSelection = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_MODELS_SELECTION_PATH,
			handler: modelsSelectionHandler(deps)
		});
		const disposeToken = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_TOKEN_PATH,
			handler: tokenHandler(deps)
		});
		const disposeLoginStart = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_LOGIN_PATH,
			handler: loginStartHandler(deps, activeLogins, recentLogins)
		});
		const disposeLoginStatus = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_LOGIN_STATUS_PATH,
			handler: loginPollHandler(deps, activeLogins, recentLogins)
		});
		const disposeAccounts = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_ACCOUNTS_PATH,
			handler: accountsHandler(deps)
		});
		const disposeAccountPreference = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_ACCOUNT_PREFERENCE_PATH,
			handler: accountPreferenceHandler(deps)
		});
		const disposeClaim = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_CLAIM_PATH,
			handler: claimHandler(deps)
		});
		const disposeRefresh = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_REFRESH_MODELS_PATH,
			handler: refreshModelsHandler(deps)
		});
		const disposeQueue = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_QUEUE_PATH,
			handler: queueHandler(deps)
		});
		const disposeDock = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_DOCK_PATH,
			handler: dockHandler(deps)
		});
		const disposeDebug = ctx.webServer.register({
			kind: "exact",
			path: CODEARTS_DEBUG_PATH,
			handler: debugHandler(deps)
		});
		return () => {
			disposeStatus();
			disposeModels();
			disposeModelsSelection();
			disposeToken();
			disposeLoginStart();
			disposeLoginStatus();
			disposeAccounts();
			disposeAccountPreference();
			disposeClaim();
			disposeRefresh();
			disposeQueue();
			disposeDock();
			disposeDebug();
			for (const s of activeLogins.values()) s.close();
			activeLogins.clear();
		};
	}, "dsh-codearts-connect: Web status route");
}
/** /api/codearts/token — 一个席位按方法分派（POST 写入，DELETE 清除）。 */
function tokenHandler(deps) {
	const post = tokenPostHandler(deps);
	const remove = tokenDeleteHandler(deps);
	return (req, res) => req.method === "DELETE" ? remove(req, res) : post(req, res);
}
/** 记一次登录终态；超出容量就丢最旧的，别让这个表无限长。 */
function recordLoginOutcome(recent, url, outcome) {
	if (recent.size >= 20 && !recent.has(url)) {
		const oldest = recent.keys().next().value;
		if (oldest !== void 0) recent.delete(oldest);
	}
	recent.set(url, outcome);
}
/** POST /api/codearts/login — 启动本地 OAuth 回调，返回授权 URL。 */
function loginStartHandler(deps, active, recent) {
	return async (req, res) => {
		if (req.method !== "POST") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!hostIsLoopback(req.headers.host) || !originIsLoopback(req.headers.origin)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		try {
			const session = await startLogin();
			active.set(session.url, session);
			session.promise.then(async (token) => {
				active.delete(session.url);
				try {
					const identity = await probeIdentity(token);
					const id = await deps.store.upsertFromOAuth(token, void 0, identity ?? void 0);
					if (identity !== null && id !== identity.userId) await deps.store.adoptIdentity(id, identity);
					deps.reviveAccount?.(id);
					if (identity !== null && identity.userId !== id) deps.reviveAccount?.(identity.userId);
					recordLoginOutcome(recent, session.url, "done");
				} catch {
					recordLoginOutcome(recent, session.url, "error");
				}
			}, () => {
				active.delete(session.url);
				recordLoginOutcome(recent, session.url, "error");
			});
			const timer = setTimeout(() => {
				session.close();
				if (active.delete(session.url)) recordLoginOutcome(recent, session.url, "error");
			}, 3e5);
			session.promise.finally(() => clearTimeout(timer)).catch(() => {});
			json(res, 200, {
				url: session.url,
				port: session.port
			});
		} catch (error) {
			json(res, 500, { error: safeMessage(error) });
		}
	};
}
/** GET /api/codearts/login/status — 轮询登录结果。 */
function loginPollHandler(_deps, active, recent) {
	return async (req, res) => {
		if (req.method !== "GET") {
			json(res, 405, { error: "method not allowed" });
			return;
		}
		if (!hostIsLoopback(req.headers.host) || !originIsLoopback(req.headers.origin)) {
			json(res, 403, { error: "request-not-trusted" });
			return;
		}
		const key = new URL(req.url ?? "", "http://localhost").searchParams.get("url") ?? "";
		if (active.has(key)) {
			json(res, 200, { status: "pending" });
			return;
		}
		const outcome = recent.get(key);
		if (outcome !== void 0) {
			recent.delete(key);
			json(res, 200, { status: outcome });
			return;
		}
		json(res, 200, { status: "idle" });
	};
}
//#endregion
//#region src/settings-compat.ts
const compatModule = settingsModule;
function plainSettingsSchema(schema) {
	const clone = structuredClone(schema.toJSON());
	for (const node of Object.values(clone.refs ?? {})) if (node !== null && typeof node === "object" && node.meta !== void 0) delete node.meta.volatile;
	return z(clone);
}
function entryNamespaceOf(ctx) {
	const compat = ctx;
	const entry = compat.fiber?.entry;
	const candidates = [
		entry?.options?.id,
		entry?.id,
		compat.loader?.locate?.(compat.fiber)
	];
	for (const candidate of candidates) if (typeof candidate === "string" && candidate !== "") return candidate;
}
function resolveSettingsNamespaceCompat(ctx, provider, fallback) {
	if (compatModule.installSettingsSection !== void 0) return fallback;
	const candidate = provider;
	if (candidate.installSection !== void 0) return fallback;
	if (candidate.configure !== void 0) return entryNamespaceOf(ctx) ?? fallback;
	return fallback;
}
function installSettingsSectionCompat(ctx, ns, schema, entry, hooks) {
	const legacyInstaller = compatModule.installSettingsSection;
	if (legacyInstaller !== void 0) {
		legacyInstaller(ctx, ns, plainSettingsSchema(schema), entry, hooks);
		return;
	}
	ctx.inject(["settings"], (sctx) => {
		const provider = sctx.get("settings");
		if (provider === void 0) return;
		if (provider.installSection !== void 0) {
			provider.installSection(ctx, ns, plainSettingsSchema(schema), entry, hooks);
			return;
		}
		if (provider.configure === void 0) throw new TypeError("dsh-settings exposes neither installSection nor configure");
		sctx.effect(() => {
			const dispose = provider.configure?.({ auto: false }, ctx.fiber);
			return typeof dispose === "function" ? dispose : () => {};
		});
		const namespace = entryNamespaceOf(ctx);
		if (namespace !== void 0) {
			const refresh = () => {
				const descriptor = provider.describe?.().find((entry) => String(entry.ns) === namespace);
				if (descriptor?.value !== void 0) hooks.setSource?.(() => descriptor.value);
				hooks.onChange();
			};
			const settingsEvents = sctx;
			sctx.effect(() => settingsEvents.on("settings/document-updated", (updated) => {
				if (String(updated) === namespace) refresh();
			}));
		}
	});
}
//#endregion
//#region src/index.ts
/** Stable Cordis plugin name. */
const name = "llm-codearts";
/** The llm service is required before the provider can register. */
const inject = ["llm"];
/** Settings namespace owning the configuration card. */
const CODEARTS_SETTINGS_NS = "codearts";
function unwrapVolatileValue(value) {
	if (typeof value === "object" && value !== null && typeof value.get === "function") return value.get();
	return value;
}
function unwrapConfig(value) {
	if (typeof value !== "object" || value === null) return {};
	const out = {};
	for (const [key, field] of Object.entries(value)) out[key] = unwrapVolatileValue(field);
	return out;
}
const Config = z.object({
	enabledModels: z.array(z.string()).description("Model ids offered in the model pickers (empty means every model)").volatile(),
	showCreditDock: z.boolean().default(true).description("Show the remaining-credits line under the chat input box").volatile(),
	showQueueDock: z.boolean().default(true).description("Show the upstream queue position under the chat input box").volatile(),
	preferredAccountId: z.string().default("").description("Account id to prefer for new requests (empty means automatic rotation)").volatile()
});
function settingsCompatNamespace(ctx) {
	return resolveSettingsNamespaceCompat(ctx, ctx.get("settings"), CODEARTS_SETTINGS_NS);
}
function apply(ctx, rawConfig) {
	const config = unwrapConfig(rawConfig);
	const accountsPath = codeartsAccountsPath();
	const store = new CodeArtsAccountStore(accountsPath);
	const pool = new CodeArtsAccountPool([]);
	const catalog = new CodeArtsCatalog();
	const usage = new CodeArtsUsageTracker({ path: codeartsUsagePath() });
	const queue = new CodeArtsQueueGate();
	const credits = new CodeArtsCreditCache();
	/** /status 是卡片与对话底部都会轮询的接口，积分慢请求不能把它拖成转圈。 */
	const CREDIT_TIMEOUT_MS = 8e3;
	/**
	* 拉一次积分（每个账号各自一份）。
	*
	* 积分是**账号级**属性：多账号下每个号的余额、到期、签到状态都不同，所以逐号
	* 并发拉、逐号缓存（缓存键就是账号 id）。一个号失败只影响它自己那一份。
	*/
	const loadCredits = async (signal) => {
		const ids = await store.ids();
		if (ids.length === 0) return [];
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), CREDIT_TIMEOUT_MS);
		timer.unref?.();
		signal?.addEventListener("abort", () => controller.abort(), { once: true });
		try {
			return await Promise.all(ids.map(async (id) => {
				const stored = await store.credential(id);
				if (stored === void 0) return {
					id,
					creditsError: "account no longer stored"
				};
				if (stored.stale === true) return {
					id,
					creditsError: "account needs sign-in"
				};
				try {
					const resolved = await store.resolve(id);
					if (resolved === void 0) return {
						id,
						creditsError: "no usable credential"
					};
					const state = await credits.get(id, resolved, controller.signal);
					return state.phase === "ok" ? {
						id,
						credits: state.value
					} : {
						id,
						creditsError: state.message
					};
				} catch (error) {
					return {
						id,
						creditsError: error instanceof Error ? error.message : String(error)
					};
				}
			}));
		} finally {
			clearTimeout(timer);
		}
	};
	let current = () => config;
	const enabledModels = () => current().enabledModels;
	const setEnabledModels = async (ids) => {
		const settings = ctx.get("settings");
		if (settings === void 0) return false;
		await settings.update(settingsCompatNamespace(ctx), { enabledModels: [...ids] });
		return true;
	};
	const dock = () => ({
		credits: current().showCreditDock !== false,
		queue: current().showQueueDock !== false
	});
	const setDock = async (patch) => {
		const settings = ctx.get("settings");
		if (settings === void 0) return false;
		await settings.update(settingsCompatNamespace(ctx), {
			...patch.credits === void 0 ? {} : { showCreditDock: patch.credits },
			...patch.queue === void 0 ? {} : { showQueueDock: patch.queue }
		});
		return true;
	};
	/** 手动指定的账号 id；空串/未设置 = 自动轮转。 */
	const preferredAccount = () => {
		const id = current().preferredAccountId?.trim() ?? "";
		return id === "" ? void 0 : id;
	};
	const setPreferredAccount = async (id) => {
		const settings = ctx.get("settings");
		if (settings === void 0) return false;
		await settings.update(settingsCompatNamespace(ctx), { preferredAccountId: id });
		return true;
	};
	/** 手动「刷新模型列表」的预算：三路来源各打一次，比每小时的后台刷新更该给足时间。 */
	const MANUAL_REFRESH_MS = 6e4;
	ctx.inject(["webServer"], (webCtx) => registerCodeArtsStatusRoute(webCtx, {
		store,
		models: () => catalog.current(),
		enabledModels,
		setEnabledModels,
		pool: () => pool.list(),
		reviveAccount: (id) => pool.revive(id),
		usage: () => usage.snapshot(),
		queue: () => queue.snapshot(),
		recentRequests: () => recentRequestShapes(),
		credits: (signal) => loadCredits(signal),
		refreshCredits: (signal) => {
			credits.invalidate();
			return loadCredits(signal);
		},
		dock,
		setDock,
		preferredAccount,
		setPreferredAccount,
		claim: async (accountId) => {
			const ids = accountId === void 0 ? await store.ids() : [accountId];
			if (ids.length === 0) return {
				ok: false,
				claimed: false,
				state: "failed",
				amount: 0,
				message: "no usable credential"
			};
			const results = [];
			for (const id of ids) try {
				const stored = await store.credential(id);
				if (stored === void 0 || stored.stale === true) {
					results.push({
						id,
						ok: false,
						claimed: false,
						state: "failed",
						amount: 0,
						message: stored === void 0 ? "account not found" : "account needs sign-in"
					});
					continue;
				}
				const resolved = await store.resolve(id);
				if (resolved === void 0) {
					results.push({
						id,
						ok: false,
						claimed: false,
						state: "failed",
						amount: 0,
						message: "no usable credential"
					});
					continue;
				}
				const outcome = await claimDailyWelfare(resolved, AbortSignal.timeout(2e4));
				if (outcome.state === "claimed") credits.invalidate(id);
				results.push({
					id,
					ok: outcome.state !== "failed",
					claimed: outcome.state === "claimed",
					state: outcome.state,
					amount: outcome.amount,
					message: outcome.message
				});
			} catch (error) {
				results.push({
					id,
					ok: false,
					claimed: false,
					state: "failed",
					amount: 0,
					message: error instanceof Error ? error.message : String(error)
				});
			}
			return summarizeClaims(results);
		},
		refreshModels: async () => {
			const outcome = await refreshCatalog(store, catalog, AbortSignal.timeout(MANUAL_REFRESH_MS));
			const models = catalog.current();
			return {
				models: models.length,
				benefit: models.filter((model) => isBenefitModel(model.id)).length,
				refreshed: outcome?.anySucceeded === true
			};
		}
	}));
	installSettingsSectionCompat(ctx, CODEARTS_SETTINGS_NS, Config, config, {
		setSource(source) {
			current = () => unwrapConfig(source());
		},
		onChange() {}
	});
	let stopped = false;
	ctx.effect(() => () => {
		stopped = true;
		queue.dispose();
		usage.flush().catch(() => {});
		shim.close().catch(() => {});
	});
	const CATALOG_REFRESH_MS = 36e5;
	const CATALOG_EMPTY_RETRY_MS = 6e4;
	const abort = new AbortController();
	const discover = async () => {
		if (stopped) return;
		try {
			const outcome = await refreshCatalog(store, catalog, abort.signal);
			if (outcome === void 0 || stopped) return;
			if (outcome.anySucceeded) {
				const free = outcome.models.filter((model) => model.benefit === true).length;
				ctx.logger.debug(`dsh-codearts-connect: model discovery refreshed the catalog (${outcome.models.length} models, ${free} benefit)`);
			} else ctx.logger.warn("dsh-codearts-connect: model discovery found nothing usable; keeping the current catalog", outcome.accounts.flatMap((account) => account.errors));
		} catch (error) {
			ctx.logger.debug("dsh-codearts-connect: model discovery failed; keeping the current catalog", error);
		}
	};
	let discoveryTimer;
	/** 自我重排的发现循环：目录为空时加快到每分钟，有货后回到每小时。 */
	const discoverLoop = async () => {
		await discover();
		if (stopped) return;
		const delay = catalog.current().length === 0 ? CATALOG_EMPTY_RETRY_MS : CATALOG_REFRESH_MS;
		discoveryTimer = setTimeout(() => void discoverLoop(), delay);
		discoveryTimer.unref?.();
	};
	ctx.effect(() => () => {
		abort.abort();
		if (discoveryTimer !== void 0) clearTimeout(discoveryTimer);
	});
	const shim = createCodeArtsShim({
		store,
		catalog,
		pool,
		usage,
		queue,
		preferredAccount,
		logger: ctx.logger
	});
	usage.load().catch(() => {});
	shim.ready.then(async () => {
		if (stopped) return;
		discoverLoop();
		const incompatible = await probePiAiCompat();
		if (incompatible !== void 0) ctx.logger.error(`dsh-codearts-connect: ${incompatible}`);
		const codearts = createCodeArtsAdapter({
			shim,
			catalog,
			enabledModels,
			resolveAttachments: () => ctx.get("attachments")
		});
		let releaseAdapter;
		let releaseDirectory;
		try {
			releaseAdapter = ctx.llm.registerAdapter([CODEARTS_PROVIDER], codearts.adapter);
			releaseDirectory = ctx.llm.registerConfigurableProviders([{
				provider: CODEARTS_PROVIDER,
				displayName: "CodeArts",
				settingsNs: settingsCompatNamespace(ctx),
				settingsPath: [],
				declared: false
			}]);
		} finally {
			if (releaseAdapter === void 0 || releaseDirectory === void 0) {
				releaseAdapter?.();
				releaseDirectory?.();
			}
		}
		try {
			ctx.effect(() => () => {
				releaseAdapter?.();
				releaseDirectory?.();
			});
		} catch {
			releaseAdapter?.();
			releaseDirectory?.();
		}
	}).catch((error) => {
		ctx.logger.error("dsh-codearts-connect: loopback shim failed to start; provider not registered", error);
	});
}
//#endregion
export { BENEFIT_GATEWAY_HOST, CODEARTS_PROVIDER, CODEARTS_SETTINGS_NS, CodeArtsAccountPool, CodeArtsAccountStore, CodeArtsCatalog, CodeArtsCredentialStore, CodeArtsCreditCache, CodeArtsUsageTracker, Config, FALLBACK_CODEARTS_MODELS, SNAP_HOST, apply, canonicalModel, chatStream, clearBenefitBlocked, clearImageBlocked, codeartsAccountsPath, codeartsAuthPath, codeartsUsagePath, createCodeArtsAdapter, createCodeArtsShim, discoverModels, fetchCredits, fetchModels, filterEnabledModels, imageBlockedModels, inject, isImageBlocked, markImageBlocked, maxTokensCeilingFor, name, parseCreditStatistics, parseTokenBalance, prepareChatBody, refreshCatalog };
