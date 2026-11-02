import { n as __exportAll } from "./rolldown-runtime-B4iAMlE-.mjs";
import { createHash, createHmac, createPrivateKey, createSign, generateKeyPairSync, randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import http from "node:http";
import { existsSync } from "node:fs";
//#region src/dpop.ts
/**
* DPoP（RFC 9449）证明 JWT：ES256 + P-256，供 oauth2/tokens 请求头使用。
* 翻译自 codearts2api 的 internal/upstream/dpop.go。
*
* 关键约束：refresh_token 与首次换取时的 DPoP 公钥绑定，刷新时必须复用同一
* 私钥，否则 STS 报 InvalidDPoPHeader。因此该私钥必须随 refresh_token 一起落盘。
*
* @module dsh-codearts-connect/dpop
*/
const P256_ORDER = BigInt("0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551");
const P256_HALF = P256_ORDER >> 1n;
/** 生成新的 DPoP 私钥（JWK）。 */
function newDPoPPrivateJWK() {
	const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
	const jwk = privateKey.export({ format: "jwk" });
	return {
		kty: jwk.kty,
		crv: jwk.crv,
		x: jwk.x,
		y: jwk.y,
		d: jwk.d
	};
}
function privateKeyFromJWK(jwk) {
	return createPrivateKey({
		key: jwk,
		format: "jwk"
	});
}
function b64u(buf) {
	return Buffer.from(buf).toString("base64url");
}
/**
* 生成 DPoP proof JWT（htm=POST，htu=token 端点）。
* 低 S 归一化以兼容服务端校验。
*/
function signDpopProof(jwk, htu) {
	const key = privateKeyFromJWK(jwk);
	const header = {
		alg: "ES256",
		typ: "dpop+jwt",
		jwk: {
			kty: "EC",
			crv: "P-256",
			x: jwk.x,
			y: jwk.y
		}
	};
	const headerJSON = Buffer.from(JSON.stringify(header));
	const payload = {
		htm: "POST",
		htu,
		iat: Math.floor(Date.now() / 1e3),
		jti: randomBytes(16).toString("hex")
	};
	const payloadJSON = Buffer.from(JSON.stringify(payload));
	const input = `${b64u(headerJSON)}.${b64u(payloadJSON)}`;
	const sig = createSign("SHA256").update(input).sign({
		key,
		dsaEncoding: "ieee-p1363"
	});
	let s = sig.subarray(32, 64);
	let sBig = BigInt(`0x${s.toString("hex")}`);
	if (sBig > P256_HALF) {
		sBig = P256_ORDER - sBig;
		s = Buffer.from(sBig.toString(16).padStart(64, "0"), "hex");
	}
	return `${input}.${b64u(Buffer.concat([sig.subarray(0, 32), s]))}`;
}
//#endregion
//#region src/oauth.ts
/**
* CodeArts OAuth2（PKCE）登录 + 刷新，翻译自 codearts2api 的
* internal/server/oauth.go / cmd/login/main.go / internal/upstream/client.go。
*
* 登录：本地起 127.0.0.1 回调服务 → 浏览器跳 codearts.huaweicloud.com/authorize
* → 用户登录 → 华为回调带 code → 用 code + PKCE verifier + DPoP 私钥换
* security_token + 临时 AK/SK + refresh_token。
*
* 刷新：refresh_token 与 client_id、DPoP 私钥三者绑定，刷新时原样复用。
*
* @module dsh-codearts-connect/oauth
*/
const CLIENT_ID = "codearts-agent";
const PLUGIN_NAME = "snap_AIIDE";
const PLUGIN_VERSION = "5.2.0";
const SNAP_HOST$1 = "https://snap-access.cn-north-4.myhuaweicloud.com";
const STS_HOST = "https://sts.cn-north-4.myhuaweicloud.com";
const PORTAL = "https://codearts.huaweicloud.com/portal";
const REDIRECT_PATH = "/oauth/callback";
function defaultLoginConfig() {
	return {
		clientId: CLIENT_ID,
		snapHost: SNAP_HOST$1,
		stsHost: STS_HOST,
		portal: PORTAL
	};
}
function randomHex(n) {
	return randomBytes(n).toString("hex");
}
function pkce() {
	const verifier = base64url(randomBytes(64));
	return {
		verifier,
		challenge: createHash("sha256").update(verifier).digest("base64url"),
		method: "S256"
	};
}
function base64url(buf) {
	return buf.toString("base64url");
}
/** 构造华为授权页 URL（浏览器打开，用户登录后回调本机）。 */
function buildAuthorizeURL(cfg, ticketId, challenge, method, port) {
	const q = new URLSearchParams();
	q.set("theme", "2");
	q.set("locale", "zh-cn");
	q.set("uri_scheme", cfg.clientId);
	q.set("client_id", cfg.clientId);
	q.set("port", String(port));
	q.set("code_challenge", challenge);
	q.set("code_challenge_method", "SHA-256");
	q.set("ticket_id", ticketId);
	q.set("plugin-name", PLUGIN_NAME);
	q.set("plugin-version", PLUGIN_VERSION);
	return `${cfg.portal}/authorize?${q.toString()}`;
}
/** 换 token 请求体：application/x-www-form-urlencoded（与华为 STS 一致）。 */
function buildTokenBody(cfg, params) {
	return new URLSearchParams({
		client_id: cfg.clientId,
		...params
	}).toString();
}
/** 用授权 code 换 token。 */
async function exchangeCode(cfg, code, verifier, port, dpopJWK, abort) {
	const htu = `${cfg.stsHost}/v1/oauth2/tokens`;
	const dpop = signDpopProof(dpopJWK, htu);
	const body = buildTokenBody(cfg, {
		code,
		code_verifier: verifier,
		grant_type: "authorization_code",
		redirect_uri: `http://127.0.0.1:${port}${REDIRECT_PATH}`
	});
	const res = await fetch(`${htu}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"DPoP": dpop,
			"plugin-name": PLUGIN_NAME,
			"plugin-version": PLUGIN_VERSION
		},
		body,
		signal: abort
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`exchange code failed: ${res.status} ${text}`);
	}
	return parseToken(await res.json(), dpopJWK, cfg.clientId);
}
/** 用 refresh_token 续期。 */
async function refreshToken(cfg, prev, abort) {
	const htu = `${cfg.stsHost}/v1/oauth2/tokens`;
	const dpop = signDpopProof(prev.dpopPrivateKey, htu);
	const body = buildTokenBody(cfg, {
		grant_type: "refresh_token",
		refresh_token: prev.refreshToken
	});
	const res = await fetch(`${htu}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"DPoP": dpop,
			"plugin-name": PLUGIN_NAME,
			"plugin-version": PLUGIN_VERSION
		},
		body,
		signal: abort
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`refresh token failed: ${res.status} ${text}`);
	}
	return parseToken(await res.json(), prev.dpopPrivateKey, prev.clientId, prev);
}
function parseToken(json, dpopJWK, clientId, prev) {
	const cred = json.credentials ?? {};
	return {
		userId: json.user_id ?? prev?.userId ?? "",
		userName: json.user_name ?? prev?.userName ?? "",
		domainId: json.domain_id ?? prev?.domainId ?? "",
		securityToken: cred.security_token ?? cred.SecurityToken ?? "",
		accessKeyId: cred.access_key_id ?? cred.AccessKeyID ?? "",
		secretAccessKey: cred.secret_access_key ?? cred.SecretAccessKey ?? "",
		expiration: cred.expiration ?? cred.Expiration ?? "",
		refreshToken: json.refresh_token ?? json.RefreshToken ?? prev?.refreshToken ?? "",
		clientId,
		dpopPrivateKey: dpopJWK
	};
}
async function startLogin(cfg = defaultLoginConfig()) {
	const ticketId = randomHex(16);
	const { verifier, challenge, method } = pkce();
	const dpopJWK = newDPoPPrivateJWK();
	const codeCh = await new Promise((resolve) => {
		const server = http.createServer();
		const waiters = [];
		server.on("request", (req, res) => {
			const u = new URL(req.url ?? "/", "http://127.0.0.1");
			if (u.pathname !== REDIRECT_PATH) {
				res.writeHead(404).end();
				return;
			}
			const code = u.searchParams.get("code");
			const redirect = u.searchParams.get("redirect");
			if (!code && redirect) {
				res.writeHead(307, { Location: redirect }).end();
				return;
			}
			if (!code) {
				let body = "";
				req.on("data", (c) => body += c);
				req.on("end", () => {
					finish(new URLSearchParams(body).get("code"));
				});
				return;
			}
			finish(code);
			function finish(c) {
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.end("<h3>CodeArts 登录成功，可关闭此页面。</h3>");
				if (c) for (const w of waiters.splice(0)) w(c);
			}
		});
		server.listen(0, "127.0.0.1", () => {
			const port = server.address().port;
			resolve({
				port,
				server,
				take: () => new Promise((r) => waiters.push(r))
			});
		});
	});
	const url = buildAuthorizeURL(cfg, ticketId, challenge, method, codeCh.port);
	const promise = (async () => {
		const timer = setTimeout(() => codeCh.server.close(), 3e5);
		try {
			return await exchangeCode(cfg, await codeCh.take(), verifier, codeCh.port, dpopJWK);
		} finally {
			clearTimeout(timer);
			codeCh.server.close();
		}
	})();
	return {
		url,
		port: codeCh.port,
		promise,
		close: () => codeCh.server.close()
	};
}
//#endregion
//#region src/auth.ts
/**
* CodeArts credential store.
*
* 真实 CodeArts 桌面端聊天需要：STS `security_token` + 临时 AK/SK（HMAC 签名）
* + refresh_token（绑定 DPoP 私钥用于续期）。本模块持久化这全套 OAuth 凭证，
* 并提供自动续期。同时也保留"手动粘贴 security_token"的兜底（但无 AK/SK 时只能
* 作为降级态，聊天会被 APIG 拒）。
*
* @module dsh-codearts-connect/auth
*/
/** 福利领取的上限；失败无所谓，卡住登录才是问题。 */
const CLAIM_TIMEOUT_MS = 15e3;
/** 两条凭证里较新的一条（`storedAt` 缺失视为最旧）。 */
function newerCredential(a, b) {
	const at = typeof a.storedAt === "number" ? a.storedAt : 0;
	return (typeof b.storedAt === "number" ? b.storedAt : 0) > at ? b : a;
}
/** 从 OAuthToken 落库。 */
function credentialFromOAuth(t, label) {
	return {
		token: t.securityToken,
		accessKeyId: t.accessKeyId,
		secretAccessKey: t.secretAccessKey,
		refreshToken: t.refreshToken,
		dpopPrivateKey: t.dpopPrivateKey,
		clientId: t.clientId,
		expiration: t.expiration,
		userId: t.userId,
		userName: t.userName,
		domainId: t.domainId,
		label: label ?? t.userName ?? t.userId,
		storedAt: Date.now()
	};
}
function codeartsAuthPath(home) {
	const base = home ?? process.env.DSH_HOME ?? join(homedir(), ".dsh");
	return join(base, ".codearts-auth.json");
}
async function loadCredential(path) {
	try {
		const raw = await readFile(path, "utf8");
		const parsed = JSON.parse(raw);
		if (typeof parsed.token !== "string" || parsed.token.length === 0) return void 0;
		return {
			...parsed,
			token: parsed.token
		};
	} catch {
		return;
	}
}
/** 原子写一个 JSON 文件（0600）。 */
async function writeJsonAtomic(path, value) {
	await mkdir(dirname(path), { recursive: true });
	const body = JSON.stringify(value, null, 2);
	const tmp = `${path}.${process.pid}-${Math.random().toString(36).slice(2, 10)}.tmp`;
	try {
		await writeFile(tmp, body, { mode: 384 });
		await chmod(tmp, 384).catch(() => {});
		await rename(tmp, path);
	} catch {
		await unlink(tmp).catch(() => {});
		await writeFile(path, body, { mode: 384 });
	}
}
async function saveCredential(path, cred) {
	await writeJsonAtomic(path, cred);
}
async function clearCredential(path) {
	try {
		await unlink(path);
	} catch {}
}
/**
* 领取限时福利（幂等）；无 AK/SK 时静默跳过。
*
* 必须带超时：领取失败不该拖住登录/续期。早先没传 signal，claimBenefit 的
* fetch 就没有任何超时 —— 福利接口一旦不响应，ensureFresh() 永远不返回，
* 跟着卡死的是整个聊天请求。
*/
async function claimIfPossible(cred) {
	if (!cred.accessKeyId || !cred.secretAccessKey) return;
	try {
		const { claimBenefit } = await Promise.resolve().then(() => upstream_exports);
		await claimBenefit({
			token: cred.token,
			accessKeyId: cred.accessKeyId,
			secretAccessKey: cred.secretAccessKey,
			securityToken: cred.token
		}, AbortSignal.timeout(CLAIM_TIMEOUT_MS));
	} catch {}
}
/** 续期判定：距过期不足 5 分钟就去刷。 */
const REFRESH_SKEW_MS = 3e5;
var CodeArtsCredentialStore = class {
	_current;
	_path;
	/** 正在进行的刷新。并发请求必须共用它，不能各刷一次。 */
	_inflight;
	/**
	* 凭证代际。重登/清除会推进它，让还在飞的刷新发现自己过期，
	* 从而不把刷新结果写回去覆盖掉刚拿到的新凭证。
	*/
	_gen = 0;
	/** 作废在飞的刷新；任何直接写凭证的路径都要先调它。 */
	invalidateInflight() {
		this._gen += 1;
		this._inflight = void 0;
	}
	constructor(path) {
		this._path = path;
	}
	setPath(path) {
		this.invalidateInflight();
		this._current = void 0;
		this._path = path;
	}
	/** 给 shim 用：返回签名所需全套。 */
	async resolve() {
		const cred = await this.ensureFresh();
		if (cred === void 0) return void 0;
		return {
			token: cred.token,
			accessKeyId: cred.accessKeyId,
			secretAccessKey: cred.secretAccessKey,
			securityToken: cred.token
		};
	}
	async current() {
		return this._current ??= await loadCredential(this._path);
	}
	/** 从 OAuth 登录结果落库。 */
	async setFromOAuth(t, label) {
		this.invalidateInflight();
		const cred = credentialFromOAuth(t, label);
		await saveCredential(this._path, cred);
		this._current = cred;
		await this.claimIfPossible(cred);
	}
	/** 领取限时福利（幂等）；无 AK/SK 时静默跳过。 */
	async claimIfPossible(cred) {
		await claimIfPossible(cred);
	}
	/** 手动粘贴 security_token（降级态，无 AK/SK）。 */
	async set(token, label) {
		this.invalidateInflight();
		const cred = {
			token: token.trim(),
			label,
			storedAt: Date.now()
		};
		await saveCredential(this._path, cred);
		this._current = cred;
	}
	async clear() {
		this.invalidateInflight();
		this._current = void 0;
		await clearCredential(this._path);
	}
	async hasCredential() {
		return await this.current() !== void 0;
	}
	/**
	* 自动续期：若距过期不足 5 分钟且具备 refresh 条件，则刷新并落库。
	* 返回当前（可能已刷新）凭证。
	*/
	async ensureFresh() {
		const gen = this._gen;
		const cred = this._current ?? await loadCredential(this._path);
		if (this._gen !== gen) return this._current;
		this._current = cred;
		if (!cred) return void 0;
		if (!cred.refreshToken || !cred.dpopPrivateKey || !cred.clientId) return cred;
		const exp = cred.expiration ? Date.parse(cred.expiration) : NaN;
		if (!(Number.isNaN(exp) ? false : exp - Date.now() < 3e5)) return cred;
		return this._inflight ??= this.refresh(cred, {
			refreshToken: cred.refreshToken,
			dpopPrivateKey: cred.dpopPrivateKey,
			clientId: cred.clientId
		}).finally(() => {
			this._inflight = void 0;
		});
	}
	/** 真正去刷一次；失败则把凭证标成 stale 落库，让卡片提示重新登录。 */
	async refresh(cred, mat) {
		const gen = this._gen;
		/**
		* 这次刷新的结果还能不能往回写。光看代际号不够：重登是异步落库的，可能在
		* 本次刷新启动**之后**才把 _current 换掉，那时代际号已经来不及拦。所以还要
		* 确认「当前凭证仍然是这次刷新的那一份」。
		*/
		const stillCurrent = () => this._gen === gen && this._current === cred;
		try {
			const next = credentialFromOAuth(await refreshToken(defaultLoginConfig(), {
				userId: cred.userId ?? "",
				userName: cred.userName ?? "",
				domainId: "",
				securityToken: cred.token,
				accessKeyId: cred.accessKeyId ?? "",
				secretAccessKey: cred.secretAccessKey ?? "",
				expiration: cred.expiration ?? "",
				refreshToken: mat.refreshToken,
				clientId: mat.clientId,
				dpopPrivateKey: mat.dpopPrivateKey
			}), cred.label);
			if (!stillCurrent()) return next;
			await saveCredential(this._path, next);
			this._current = next;
			await this.claimIfPossible(next);
			return next;
		} catch {
			cred.stale = true;
			if (!stillCurrent()) return cred;
			this._current = cred;
			try {
				await saveCredential(this._path, cred);
			} catch {}
			return cred;
		}
	}
};
/**
* 手工粘贴 token 的降级账号固定用这个 id：再粘一次是**覆盖**，而不是又加一个。
*/
const MANUAL_ACCOUNT_ID = "manual";
function codeartsAccountsPath(home) {
	const base = home ?? process.env.DSH_HOME ?? join(homedir(), ".dsh");
	return join(base, ".codearts-accounts.json");
}
/**
* 账号的自然键，按稳定性依次退让：
*
* 1. `userId` —— 最理想，同一个人永远同一个键。
* 2. `userName`。
* 3. **DPoP 公钥**。实测上游的 token 响应里 `user_id` / `user_name` **都是空串**
*    （2026-09-30 用真实账号核对），所以前两级拿不到。DPoP 密钥由每次登录生成、
*    续期时原样复用，因此「同一次登录」内稳定、不同账号必然不同 —— 比拿 token
*    做键好，因为 token 每次续期都会轮换。
* 4. 最后才退回 token 哈希（手工粘贴的降级凭证没有 DPoP 密钥）。
*
* 已知代价：上游不给稳定身份，所以**对同一个账号重新登录**会被当成新账号，
* 旧条目会自己失效（凭据被拒 → 停用）并可在卡片上删掉。
*/
function accountIdOf(cred) {
	if (typeof cred.userId === "string" && cred.userId !== "") return cred.userId;
	if (typeof cred.userName === "string" && cred.userName !== "") return cred.userName;
	const jwk = cred.dpopPrivateKey;
	if (jwk !== void 0 && typeof jwk.x === "string" && typeof jwk.y === "string") return `k${createHash("sha256").update(`${jwk.x}.${jwk.y}`).digest("hex").slice(0, 15)}`;
	return `t${createHash("sha256").update(cred.token).digest("hex").slice(0, 15)}`;
}
function summarizeAccount(id, cred) {
	return {
		id,
		...cred.label === void 0 ? {} : { label: cred.label },
		...cred.userName === void 0 ? {} : { userName: cred.userName },
		...cred.expiration === void 0 ? {} : { expiration: cred.expiration },
		...cred.storedAt === void 0 ? {} : { storedAt: cred.storedAt },
		stale: cred.stale === true,
		signable: typeof cred.accessKeyId === "string" && cred.accessKeyId !== "" && typeof cred.secretAccessKey === "string" && cred.secretAccessKey !== ""
	};
}
/**
* 单个账号的内存状态与续期。
*
* 每个账号一份、互不干扰。`refresh_token` 是一次性的，上游在刷新时会轮换它：
* 同一账号内并发刷新会烧掉它、并让失败的那次把 `stale` 盖在成功那次刚拿到的
* 凭证上，登录态就此写死（本机真实踩过一次）。所以这里保留单凭证时代验证过的
* 「单飞 + 代际」两条保护，只是作用域缩到单个账号。
*/
var AccountSlot = class {
	_cred;
	_inflight;
	_gen = 0;
	persist;
	constructor(cred, persist) {
		this._cred = cred;
		this.persist = persist;
	}
	get credential() {
		return this._cred;
	}
	/** 账号被替换或删除：作废在飞的刷新，别让它回头写回旧值。 */
	invalidate() {
		this._gen += 1;
		this._inflight = void 0;
	}
	async ensureFresh() {
		const cred = this._cred;
		if (cred.stale === true) return cred;
		if (!cred.refreshToken || !cred.dpopPrivateKey || !cred.clientId) return cred;
		const exp = cred.expiration ? Date.parse(cred.expiration) : NaN;
		if (!(Number.isNaN(exp) ? false : exp - Date.now() < REFRESH_SKEW_MS)) return cred;
		return this._inflight ??= this.refresh(cred, {
			refreshToken: cred.refreshToken,
			dpopPrivateKey: cred.dpopPrivateKey,
			clientId: cred.clientId
		}).finally(() => {
			this._inflight = void 0;
		});
	}
	async refresh(cred, mat) {
		const gen = this._gen;
		const stillCurrent = () => this._gen === gen && this._cred === cred;
		try {
			const next = credentialFromOAuth(await refreshToken(defaultLoginConfig(), {
				userId: cred.userId ?? "",
				userName: cred.userName ?? "",
				domainId: "",
				securityToken: cred.token,
				accessKeyId: cred.accessKeyId ?? "",
				secretAccessKey: cred.secretAccessKey ?? "",
				expiration: cred.expiration ?? "",
				refreshToken: mat.refreshToken,
				clientId: mat.clientId,
				dpopPrivateKey: mat.dpopPrivateKey
			}), cred.label);
			if (!stillCurrent()) return next;
			await this.persist(next);
			this._cred = next;
			await claimIfPossible(next);
			return next;
		} catch {
			cred.stale = true;
			if (!stillCurrent()) return cred;
			this._cred = cred;
			try {
				await this.persist(cred);
			} catch {}
			return cred;
		}
	}
};
async function readAccountDocument(path) {
	try {
		const parsed = JSON.parse(await readFile(path, "utf8"));
		if (typeof parsed !== "object" || parsed === null) return void 0;
		const accounts = parsed.accounts ?? {};
		const order = Array.isArray(parsed.order) ? parsed.order.filter((id) => typeof id === "string") : [];
		for (const id of Object.keys(accounts)) if (!order.includes(id)) order.push(id);
		return {
			version: 1,
			order,
			accounts
		};
	} catch {
		return;
	}
}
/** 多账号凭证存储：一个账号一份槽位，共用一个文档文件。 */
var CodeArtsAccountStore = class {
	_doc;
	_slots = /* @__PURE__ */ new Map();
	_loading;
	/** 落库串行化：多个账号的续期可能同时想写同一个文档。 */
	_writeChain = Promise.resolve();
	path;
	/** 旧版单凭证文件；新文档不存在时把它收编成第一个账号。 */
	legacyPath;
	constructor(path, legacyPath) {
		this.path = path;
		this.legacyPath = legacyPath ?? join(dirname(path), ".codearts-auth.json");
	}
	async loaded() {
		this._loading ??= this.load();
		return this._loading;
	}
	async load() {
		const doc = await readAccountDocument(this.path);
		if (doc !== void 0) {
			this.adopt(doc);
			return;
		}
		const legacy = await loadCredential(this.legacyPath);
		const fresh = {
			version: 1,
			order: [],
			accounts: {}
		};
		if (legacy !== void 0) {
			const id = accountIdOf(legacy);
			fresh.order.push(id);
			fresh.accounts[id] = legacy;
		}
		this.adopt(fresh);
		if (legacy !== void 0) await this.persistDoc();
	}
	adopt(doc) {
		this._doc = doc;
		this._slots.clear();
		for (const [id, cred] of Object.entries(doc.accounts)) this._slots.set(id, new AccountSlot(cred, this.persisterFor(id)));
	}
	persisterFor(id) {
		return async (cred) => {
			if (this._doc === void 0) return;
			this._doc.accounts[id] = cred;
			await this.persistDoc();
		};
	}
	persistDoc() {
		const snapshot = this._doc;
		const write = async () => {
			if (snapshot !== void 0) await writeJsonAtomic(this.path, snapshot);
		};
		this._writeChain = this._writeChain.then(write, write);
		return this._writeChain;
	}
	/** 按展示顺序返回账号摘要。 */
	async list() {
		await this.loaded();
		const doc = this._doc;
		return doc.order.filter((id) => doc.accounts[id] !== void 0).map((id) => summarizeAccount(id, doc.accounts[id]));
	}
	async ids() {
		await this.loaded();
		const doc = this._doc;
		return doc.order.filter((id) => doc.accounts[id] !== void 0);
	}
	async credential(id) {
		await this.loaded();
		return this._doc.accounts[id];
	}
	/** 首个账号——卡片顶部与 CLI 的「当前」。 */
	async current() {
		const ids = await this.ids();
		return ids.length === 0 ? void 0 : this._doc.accounts[ids[0]];
	}
	async hasCredential() {
		return (await this.ids()).length > 0;
	}
	/** 新增或更新一个账号，返回它的 id。 */
	async upsert(cred, id = accountIdOf(cred)) {
		await this.loaded();
		const doc = this._doc;
		this._slots.get(id)?.invalidate();
		doc.accounts[id] = cred;
		if (!doc.order.includes(id)) doc.order.push(id);
		this._slots.set(id, new AccountSlot(cred, this.persisterFor(id)));
		await this.persistDoc();
		await claimIfPossible(cred);
		return id;
	}
	/**
	* 从一次 OAuth 登录结果新增/更新账号。
	*
	* 「再登录一次」天然就是「添加账号」：同一账号是更新，别的账号就是新增。
	*
	* 传了 `identity`（来自 `fetchCallerIdentity` 的稳定 user_id）就用它当账号键 ——
	* 这正是「对同一个账号重新登录会被当成新账号」的解药；拿不到身份时退回旧行为
	* （DPoP 公钥当键），也就是每次登录各自成一条。
	*/
	async upsertFromOAuth(t, label, identity) {
		const cred = credentialFromOAuth(t, label);
		if (identity !== void 0) {
			cred.userId = identity.userId;
			if (identity.userName !== "") cred.userName = identity.userName;
			if (identity.domainId !== "") cred.domainId = identity.domainId;
		}
		return this.upsert(cred);
	}
	/**
	* 把一条已有账号迁移到它的稳定身份键上（同键则合并）。
	*
	* 用在两处：登录后回填身份（老条目已经存在时合并掉），以及 `dsh-codearts-connect identity --fix`
	* 清理历史遗留的重复条目。合并时保留 `storedAt` 较新的一份凭证，位置沿用目标键原有的顺序。
	*
	* @returns 迁移结果：`merged` 表示并入了已存在的那条，`moved` 表示只换了键，`noop` 表示键没变
	*/
	async adoptIdentity(id, identity) {
		await this.loaded();
		const doc = this._doc;
		const existing = doc.accounts[id];
		if (existing === void 0) return "noop";
		const targetKey = identity.userId;
		if (targetKey === "" || targetKey === id) {
			doc.accounts[id] = {
				...existing,
				userId: identity.userId === "" ? existing.userId : identity.userId,
				...identity.userName === "" ? {} : { userName: identity.userName },
				...identity.domainId === "" ? {} : { domainId: identity.domainId }
			};
			this._slots.get(id)?.invalidate();
			this._slots.set(id, new AccountSlot(doc.accounts[id], this.persisterFor(id)));
			await this.persistDoc();
			return "noop";
		}
		const target = doc.accounts[targetKey];
		const keep = target === void 0 ? existing : newerCredential(target, existing);
		doc.accounts[targetKey] = {
			...keep,
			userId: identity.userId,
			...identity.userName === "" ? {} : { userName: identity.userName },
			...identity.domainId === "" ? {} : { domainId: identity.domainId }
		};
		delete doc.accounts[id];
		doc.order = doc.order.filter((existingId) => existingId !== id);
		if (!doc.order.includes(targetKey)) doc.order.push(targetKey);
		this._slots.get(id)?.invalidate();
		this._slots.delete(id);
		this._slots.get(targetKey)?.invalidate();
		this._slots.set(targetKey, new AccountSlot(doc.accounts[targetKey], this.persisterFor(targetKey)));
		await this.persistDoc();
		return target === void 0 ? "moved" : "merged";
	}
	/** 手工粘贴 security_token（降级态，无 AK/SK）——固定覆盖同一个「手工」账号。 */
	async set(token, label) {
		await this.upsert({
			token: token.trim(),
			label,
			storedAt: Date.now()
		}, MANUAL_ACCOUNT_ID);
	}
	async remove(id) {
		await this.loaded();
		const doc = this._doc;
		this._slots.get(id)?.invalidate();
		this._slots.delete(id);
		delete doc.accounts[id];
		doc.order = doc.order.filter((existing) => existing !== id);
		await this.persistDoc();
	}
	/** 清空全部账号（整体登出）。 */
	async clear() {
		await this.loaded();
		for (const slot of this._slots.values()) slot.invalidate();
		this._slots.clear();
		this._doc = {
			version: 1,
			order: [],
			accounts: {}
		};
		await this.persistDoc();
		await clearCredential(this.legacyPath);
	}
	/** 给 shim 用：解析某账号的签名材料（内部含续期）。 */
	async resolve(id) {
		await this.loaded();
		const slot = this._slots.get(id);
		if (slot === void 0) return void 0;
		const cred = await slot.ensureFresh();
		return {
			token: cred.token,
			accessKeyId: cred.accessKeyId,
			secretAccessKey: cred.secretAccessKey,
			securityToken: cred.token
		};
	}
};
//#endregion
//#region src/catalog.ts
/**
* 参数表（不是模型名单）：只给**发现到的**模型补 `contextWindow` / `maxTokens` /
* `supportsImages`，绝不会因为这里有条目就把模型塞进目录。
*
* maxTokens 注记（2026-09-30 实测，scripts/param-probe.mjs 直连上游二分验证）：
* 福利 DeepSeek 模型的 max_tokens 服务端硬上限是 **65536**，更大的值
* （73728 / 98304 / 131072 / 384000 / 393216）一律流内报
* InferHub.001001005.400 "The request param is invalid, Please check it"。
* 此前的 384000/393216 是占位值：DSH 会把 catalog 的 maxTokens 作为
* max_tokens 原样发给上游，导致所有请求直接失败。
*/
const FALLBACK_CODEARTS_MODELS = [
	{
		id: "GLM-5.2",
		name: "GLM-5.2",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: false
	},
	{
		id: "GLM-5.1",
		name: "GLM-5.1",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: false
	},
	{
		id: "GLM-4.7",
		name: "GLM-4.7",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: true
	},
	{
		id: "OpenPangu-2.0-Pro",
		name: "OpenPangu 2.0 Pro",
		contextWindow: 32e3,
		maxTokens: 4e3,
		supportsImages: true
	},
	{
		id: "OpenPangu-2.0-Flash",
		name: "OpenPangu 2.0 Flash",
		contextWindow: 32e3,
		maxTokens: 4e3,
		supportsImages: true
	},
	{
		id: "Qwen3-VL-235B",
		name: "Qwen3-VL-235B",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: true
	},
	{
		id: "Qwen3.5-397B-A17B-VL",
		name: "Qwen3.5-397B-A17B-VL",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: true
	},
	{
		id: "Qwen3.6-27B-VL",
		name: "Qwen3.6-27B-VL",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: true
	},
	{
		id: "deepseek-v4-flash-0731",
		name: "DeepSeek-V4-Flash (福利)",
		contextWindow: 131072,
		maxTokens: 65536,
		supportsImages: true
	},
	{
		id: "deepseek-v4-pro-0813",
		name: "DeepSeek-V4-Pro (福利)",
		contextWindow: 131072,
		maxTokens: 65536,
		supportsImages: true
	},
	{
		id: "deepseek-v4.1-flash",
		name: "DeepSeek-V4.1-Flash",
		contextWindow: 131072,
		maxTokens: 65536,
		supportsImages: false
	},
	{
		id: "deepseek-v4.1-flash-1017",
		name: "DeepSeek-V4.1-Flash-1017",
		contextWindow: 1048576,
		maxTokens: 65536,
		supportsImages: false
	},
	{
		id: "glm-5.3-flash",
		name: "GLM-5.3-Flash (福利)",
		contextWindow: 128e3,
		maxTokens: 8e3,
		supportsImages: false
	}
];
/**
* 倍率的展示写法：福利恒为 `x0.00`，其余用上游的数值，拿不到就不显示。
*
* 福利模型不走积分，倍率显示成 0 比显示上游某个残留 credit 更接近事实。
*/
function creditRatioLabel(ratio, benefit) {
	if (benefit) return "x0.00";
	const value = (ratio ?? "").trim().replace(/x$/i, "").trim();
	return /^\d+(?:\.\d+)?$/.test(value) ? `x${Number(value).toFixed(2)}` : void 0;
}
/**
* 模型在宿主下拉里的**名字**带一个标记尾巴：` · x0.18`、` · x0.00 · 福利`。
*
* 写法照搬 dsh-codebuddy-cli 的 provider：倍率在前、上游徽章措辞在后，统一用
* ` · ` 连接（`Name · x0.71 · 限时免费`）。宿主自己的模型下拉只渲染文字，
* 插不进 Tag，所以那是用户唯一能看见标记的地方；插件卡片会反过来把尾巴剥掉、
* 改挂 Tag（见 client 的 modelName），两边都不会重复。
*/
function modelDisplayName(name, benefit, ratio) {
	const base = stripModelSuffixes(name);
	const parts = [creditRatioLabel(ratio, benefit), benefit ? "福利" : void 0].filter((part) => part !== void 0);
	return parts.length === 0 ? base : `${base} · ${parts.join(" · ")}`;
}
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
/** Mutable catalog shared by the shim's `/v1/models` and the adapter. */
var CodeArtsCatalog = class {
	/** 空目录起步：没发现过就是没有模型，不拿历史名单冒充。 */
	models = [];
	normalized = [];
	/** 上次归一化时图片黑名单的大小 —— 黑名单是运行时长的，变了就得重算。 */
	normalizedWithBlocked = 0;
	/** 上次归一化时的转述开关状态。 */
	normalizedBridge = false;
	current() {
		if (this.normalizedWithBlocked !== imageBlocked.size || this.normalizedBridge !== imageBridgeEnabled) {
			this.normalized = this.normalize(this.models);
			this.normalizedWithBlocked = imageBlocked.size;
			this.normalizedBridge = imageBridgeEnabled;
		}
		return this.normalized;
	}
	set(models) {
		this.models = [...models];
		this.normalized = this.normalize(this.models);
		this.normalizedWithBlocked = imageBlocked.size;
		this.normalizedBridge = imageBridgeEnabled;
	}
	/**
	* 上游清单爱把纯文本模型标成 `supports_images: true`（GLM-5.2、-1017 实测都这样），
	* 被它骗过一次的模型在这里一律摘掉图片能力；开了图片转述则改挂 `imageBridge`，
	* 让宿主允许贴图，由请求层负责转述。
	*/
	normalize(models) {
		return models.map((model) => {
			if (!isImageBlocked(model.id)) return model;
			return imageBridgeEnabled ? {
				...model,
				supportsImages: true,
				imageBridge: true
			} : {
				...model,
				supportsImages: false
			};
		});
	}
};
/**
* Narrow a catalog to the user's enabled selection (allowlist of model ids).
* Same semantics as the codebuddy plugin: absent or empty => serve all.
*/
function filterEnabledModels(models, enabled) {
	if (enabled === void 0 || enabled.length === 0) return models;
	const allow = new Set(enabled);
	const kept = models.filter((model) => allow.has(model.id));
	return kept.length === 0 ? models : kept;
}
/**
* 动态发现确认的福利模型（小写 id）—— 这是「是不是福利」的**唯一**依据。
*
* 只认 `gateway/config` 给过的名单，没有静态兜底：猜错一次的代价不对称 ——
* 漏带 `maas_type: benefit` 是福利模型报 404（它本来就不可用），多带一次却是把
* 一个正常能用的积分模型推进一条不存在的渠道，直接 benefit not found。
*
* 与 codearts2api 的差别：那边按账号隔离目录，本插件的聊天链路（shim → upstream）
* 拿不到账号上下文，所以这里取所有成功账号的并集。
*/
const discoveredBenefit = /* @__PURE__ */ new Set();
/** 用一次发现的结果替换动态福利集合（传空数组表示「本轮确认没有福利模型」）。 */
function setDiscoveredBenefitModels(ids) {
	discoveredBenefit.clear();
	for (const id of ids) {
		const key = id.trim().toLowerCase();
		if (key !== "") discoveredBenefit.add(key);
	}
}
/**
* 该模型是否走限时福利路由（按小写 ID 判定）。
*
* 只认发现结果：`gateway/config` 没给过的模型一律不算福利，没有静态兜底。
*/
function isBenefitModel(id) {
	return discoveredBenefit.has(id.trim().toLowerCase());
}
/**
* 今天被上游判定「没有福利权益」的模型（小写 id -> 本地日期键）。
*
* 判据只有一个：聊天回 `InferHub.4004.200 benefit not found`。上游没有任何接口能
* 提前告诉我们福利余量（`statistics/plugin` 的 `model_quota_num` 实测恒为 -1，
* 唯一能给数的 opengw balance 也不覆盖福利池），所以只能「失败一次才知道」。
*
* 按本地日期存：福利是每天发的，昨天的失败不代表今天。卡片据此把模型标成
* 「福利今日不可用」，但**不**替用户取消勾选 —— 那是改他的设置。
*/
const benefitBlocked = /* @__PURE__ */ new Map();
function localDayKey(at = Date.now()) {
	const d = new Date(at);
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${d.getFullYear()}-${month}-${day}`;
}
/** 记一次「这个模型今天没有福利权益」。 */
function markBenefitBlocked(id) {
	const key = id.trim().toLowerCase();
	if (key !== "") benefitBlocked.set(key, localDayKey());
}
/** 该模型今天是否已经因为福利权益缺失失败过。 */
function isBenefitBlocked(id) {
	const key = id.trim().toLowerCase();
	const day = benefitBlocked.get(key);
	if (day === void 0) return false;
	if (day === localDayKey()) return true;
	benefitBlocked.delete(key);
	return false;
}
/** 清空福利缺失记录 —— 手动刷新模型列表时调，给用户一个自救出口。 */
function clearBenefitBlocked() {
	benefitBlocked.clear();
}
/**
* 运行时学到的「这个模型不收图」（小写 id）。
*
* 上游 `/v1/model/builtin` 会给一批纯文本模型标 `supports_images: true`
* （GLM-5.2、deepseek-v4.1-flash-1017 等），但带图请求一律被聊天端点回
* `InferHub.001001020.406 The request model is not multimodal`；同条件下
* Qwen3-VL-235B / kimi-k2.6-vl 却能正常收图（2026-10-31 直连实测）。
*
* 清单不可信，唯一可靠的判据是「发一次带图请求看上游认不认」。人工实测过的进
* `KNOWN_TEXT_ONLY`，其余靠这里在第一次被拒时记下来。进程内有效 —— 与福利缺失
* 标记同一套做法。
*/
const imageBlocked = /* @__PURE__ */ new Set();
/**
* 已经人工实测**确认不收图**的模型（小写 id）。
*
* 为什么种子表标 false 不够：目录是把上游发现结果与种子表合并出来的，上游那条
* `supports_images: true` 会凭「参数更全」赢过种子的 false。所以这里单列一条硬名单，
* 与运行时黑名单一起把图片能力摘掉。
*
* 名单来源（2026-10-31 用插件同一条签名链路直连实测）：
*  - GLM-5.2、deepseek-v4.1-flash-1017 → `InferHub.001001020.406`
*  - glm-5.3-flash → 用户实测同一错误
* 对照组能正常收图：Qwen3-VL-235B、kimi-k2.6-vl（同条件 HTTP 200 且读出了图）。
*/
const KNOWN_TEXT_ONLY = /* @__PURE__ */ new Set([
	"glm-5.2",
	"deepseek-v4.1-flash",
	"deepseek-v4.1-flash-1017",
	"glm-5.3-flash"
]);
/** 该模型是否不收图（人工确认或运行时被拒过）。 */
function isImageBlocked(id) {
	const key = id.trim().toLowerCase();
	return key !== "" && (KNOWN_TEXT_ONLY.has(key) || imageBlocked.has(key));
}
/** 记一次「这个模型不收图」。 */
function markImageBlocked(id) {
	const key = id.trim().toLowerCase();
	if (key !== "") imageBlocked.add(key);
}
/** 运行时被拒过图片的模型（排序副本，供诊断输出；不含人工名单）。 */
function imageBlockedModels() {
	return [...imageBlocked].sort();
}
/** 清空图片能力黑名单 —— 与福利标记一起，由手动刷新模型列表重置。 */
function clearImageBlocked() {
	imageBlocked.clear();
}
/**
* 图片转述开关。打开后，被黑名单挡住的纯文本模型会重新声明「可收图」，
* 但标记成 `imageBridge`：请求层先按原图试，首帧被上游拒了才转述重发。
*/
let imageBridgeEnabled = false;
function setImageBridgeEnabled(enabled) {
	imageBridgeEnabled = enabled;
}
function isImageBridgeEnabled() {
	return imageBridgeEnabled;
}
/**
* 合并多路来源的模型清单（内置 / 限时福利 / agent-center）。
*
* 规则对齐 codearts2api 的 `MergeModels`：
*  - 按小写 id 去重（上游注册名大小写敏感，但同一模型的书写可能不一致）；
*  - `benefit` 取或：漏标一次就是一次 404；
*  - 参数更全的一条优先（有 contextWindow > 没有，supportsImages 为真优先）；
*  - 输出按小写 id 排序，保证 `/v1/models` 在刷新前后顺序稳定。
*/
function mergeModelLists(sets) {
	const merged = /* @__PURE__ */ new Map();
	for (const set of sets) for (const model of set) {
		const id = model.id.trim();
		if (id === "") continue;
		const key = id.toLowerCase();
		const normalized = {
			...model,
			id
		};
		const current = merged.get(key);
		merged.set(key, current === void 0 ? normalized : richerModel(current, normalized));
	}
	return [...merged.values()].sort((a, b) => {
		const la = a.id.toLowerCase();
		const lb = b.id.toLowerCase();
		return la === lb ? a.id < b.id ? -1 : 1 : la < lb ? -1 : 1;
	});
}
/** 同一模型两条记录取更全的一条；`benefit` 永远取或。 */
function richerModel(current, next) {
	const benefit = current.benefit === true || next.benefit === true;
	const keep = richerThan(next, current) ? next : current;
	const drop = keep === next ? current : next;
	const ratio = keep.ratio ?? drop.ratio;
	const thinking = keep.thinking ?? drop.thinking;
	return {
		id: keep.id,
		name: keep.name || drop.name || keep.id,
		contextWindow: keep.contextWindow > 0 ? keep.contextWindow : drop.contextWindow,
		maxTokens: keep.maxTokens > 0 ? keep.maxTokens : drop.maxTokens,
		supportsImages: keep.supportsImages || drop.supportsImages,
		...ratio === void 0 ? {} : { ratio },
		...thinking === void 0 ? {} : { thinking },
		...benefit ? { benefit: true } : {}
	};
}
/** a 是否比 b 更值得保留：优先带参数，其次保留大小写更「像注册名」的一条。 */
function richerThan(a, b) {
	if (a.contextWindow > 0 !== b.contextWindow > 0) return a.contextWindow > 0;
	if (a.maxTokens > 0 !== b.maxTokens > 0) return a.maxTokens > 0;
	return a.id !== a.id.toLowerCase() && b.id === b.id.toLowerCase();
}
/**
* 用参数表给**发现结果**补 0 值字段。参数表里有、上游这次没返回的模型 —— 不塞进目录。
*
* 为什么不能把参数表一起丢进 `mergeModelLists`：那个函数按「参数更全/大小写更像注册名」
* 选记录，表里的占位值（例如 OpenPangu 的 ctx 32000 / max 4000）会凭大小写规则
* 压过上游返回的真实值（ctx 524288 / max 131072）。所以顺序必须是
* 「先合并发现结果 → 再用参数表补 0 值字段」。
*/
function backfillParams(discovered, params = FALLBACK_CODEARTS_MODELS) {
	const byId = /* @__PURE__ */ new Map();
	for (const model of discovered) byId.set(model.id.toLowerCase(), { ...model });
	for (const fallback of params) {
		const current = byId.get(fallback.id.toLowerCase());
		if (current === void 0) continue;
		byId.set(fallback.id.toLowerCase(), {
			id: current.id,
			name: current.name || fallback.name,
			contextWindow: current.contextWindow > 0 ? current.contextWindow : fallback.contextWindow,
			maxTokens: current.maxTokens > 0 ? current.maxTokens : fallback.maxTokens,
			supportsImages: current.supportsImages || fallback.supportsImages,
			...current.ratio === void 0 ? {} : { ratio: current.ratio },
			...current.thinking === void 0 ? {} : { thinking: current.thinking },
			...current.benefit === true ? { benefit: true } : {}
		});
	}
	return [...byId.values()].sort((a, b) => {
		const la = a.id.toLowerCase();
		const lb = b.id.toLowerCase();
		return la === lb ? a.id < b.id ? -1 : 1 : la < lb ? -1 : 1;
	});
}
//#endregion
//#region src/signer.ts
/**
* 华为云 SDK-HMAC-SHA256 请求签名（AK/SK + 可选 STS security token）。
* 翻译自 codearts2api 的 internal/upstream/signer.go，对齐华为云 AKSKSigner。
*
* 在 CodeArts 桌面端实测：聊天请求必须用 AK/SK 签名，光传 x-auth-token 会被
* APIG 拒（APIG.0301 decrypt token fail）。
*
* @module dsh-codearts-connect/signer
*/
const ALGO = "SDK-HMAC-SHA256";
function sha256Hex(buf) {
	return createHash("sha256").update(buf).digest("hex");
}
function hmacHex(key, msg) {
	return createHmac("sha256", key).update(msg).digest("hex");
}
/** 华为云 X-Sdk-Date 格式：20060102T150405Z（UTC，无分隔符、无毫秒）。 */
function sdkDate(d) {
	const p = (n, w = 2) => String(n).padStart(w, "0");
	return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}
function canonicalURI(path) {
	let out = path.split("/").map((s) => encodeURIComponent(s)).join("/");
	if (!out.endsWith("/")) out += "/";
	return out;
}
function canonicalQuery(raw) {
	if (!raw) return "";
	const params = new URLSearchParams(raw);
	const keys = [...new Set(params.keys())].sort();
	const parts = [];
	for (const k of keys) {
		const vals = params.getAll(k).sort();
		for (const v of vals) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
	}
	return parts.join("&");
}
/**
* 给一个 fetch Request 加上 X-Sdk-Date / X-Security-Token / X-Sdk-Content-Sha256
* / Authorization 头。body 为请求体（用于 payload hash）。
*
* 注意：Host 头 fetch 不允许手动 set，但签名必须包含 host，所以我们在签名计算
* 里从 URL 取 host 补一个虚拟 host 行，Authorization 写回即可（fetch 实际发出的
* Host 与 URL.host 一致）。
*/
function signRequest(req, body, cred) {
	const xDate = sdkDate(/* @__PURE__ */ new Date());
	req.headers.set("X-Sdk-Date", xDate);
	if (cred.securityToken) req.headers.set("X-Security-Token", cred.securityToken);
	const payloadHash = sha256Hex(body);
	req.headers.set("X-Sdk-Content-Sha256", payloadHash);
	const url = new URL(req.url);
	const host = url.host;
	const all = [];
	req.headers.forEach((v, k) => all.push([k.toLowerCase(), v.trim()]));
	all.push(["host", host]);
	all.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
	let canonicalHeaders = "";
	const signed = [];
	for (const [k, v] of all) {
		canonicalHeaders += `${k}:${v}\n`;
		signed.push(k);
	}
	const signedHeaders = signed.join(";");
	const canonicalRequest = [
		req.method,
		canonicalURI(url.pathname),
		canonicalQuery(url.search.slice(1)),
		canonicalHeaders,
		signedHeaders,
		payloadHash
	].join("\n");
	const stringToSign = [
		ALGO,
		xDate,
		sha256Hex(canonicalRequest)
	].join("\n");
	const signature = hmacHex(cred.secretAccessKey, stringToSign);
	req.headers.set("Authorization", `${ALGO} Access=${cred.accessKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`);
}
//#endregion
//#region src/upstream.ts
/**
* CodeArts 真实聊天协议（翻译自 codearts2api 逆向，consumer 版 cn-north-4）。
*
* 聊天走 OpenAI 兼容端点：
*   POST /api/v2/chat/completions  （snap-access.cn-north-4.myhuaweicloud.com）
* 鉴权为 x-auth-token = STS security_token，并叠加华为云 AK/SK SDK-HMAC-SHA256
* 签名（与官方 AgentKernel 一致）。请求体是标准 OpenAI 形状（role/content），
* 响应 SSE 也是 OpenAI 增量（choices[].delta.content），但含有华为特有事件
* （累计全文快照 + 结束态 error_code），本模块做兼容转换。
*
* @module dsh-codearts-connect/upstream
*/
var upstream_exports = /* @__PURE__ */ __exportAll({
	BENEFIT_MISSING_CODE: () => BENEFIT_MISSING_CODE,
	CONCURRENCY_CAP_CODE: () => CONCURRENCY_CAP_CODE,
	DEFAULT_IMAGE_BRIDGE_MODEL: () => DEFAULT_IMAGE_BRIDGE_MODEL,
	IMAGE_UNSUPPORTED_MESSAGE: () => IMAGE_UNSUPPORTED_MESSAGE,
	MAX_TOKENS_CEILING: () => MAX_TOKENS_CEILING,
	PARAM_INVALID_CODE: () => PARAM_INVALID_CODE,
	SNAP_HOST: () => SNAP_HOST,
	TPM_LIMIT_CODE: () => TPM_LIMIT_CODE,
	bridgeImages: () => bridgeImages,
	canonicalModel: () => canonicalModel,
	chatStream: () => chatStream,
	claimBenefit: () => claimBenefit,
	claimDailyWelfare: () => claimDailyWelfare,
	clearQueueStatus: () => clearQueueStatus,
	degradeTokenCeiling: () => degradeTokenCeiling,
	estimateTokens: () => estimateTokens,
	fetchCallerIdentity: () => fetchCallerIdentity,
	fetchModels: () => fetchModels,
	fetchQueueStatus: () => fetchQueueStatus,
	fetchWelfareCampaigns: () => fetchWelfareCampaigns,
	isBenefitMissing: () => isBenefitMissing,
	isConcurrencyCap: () => isConcurrencyCap,
	isNotMultimodal: () => isNotMultimodal,
	isParamInvalidFrame: () => isParamInvalidFrame,
	isQueueableRate: () => isQueueableRate,
	isResignRefusal: () => isResignRefusal,
	isTpmLimit: () => isTpmLimit,
	isWelfareClaimedStatus: () => isWelfareClaimedStatus,
	maxTokensCeilingFor: () => maxTokensCeilingFor,
	pickDailyWelfareCampaign: () => pickDailyWelfareCampaign,
	prepareChatBody: () => prepareChatBody,
	rateLimitFrame: () => rateLimitFrame,
	signedGet: () => signedGet,
	upstreamErrorMessage: () => upstreamErrorMessage
});
const SNAP_HOST = "https://snap-access.cn-north-4.myhuaweicloud.com";
const EP_CHAT = "/api/v2/chat/completions";
const BENEFIT_HOST = "https://opengw.developer.huaweicloud.com";
const EP_BENEFIT_CLAIM = "/api/v1/benefit/claim";
const EP_MODEL_BUILTIN = "/v1/model/builtin";
const EP_BENEFIT_CONFIG = "/api/v1/gateway/config";
const EP_AGENT_LIST = "/v1/agent-center/agents/useragents";
const EP_AGENT_DETAIL = "/v1/agent-center/agents/detail";
/**
* 模型的思考强度清单（26.10.0 新增）。**必须带 `Agent-Type: PromptCenter`**：
* 不带头时上游回 `TM.00001001 请求头Agent-Type为空`（实测）。
*/
const EP_THINKING_VARIANTS = "/v1/model/thinking-variants";
/** 排队位置（26.10.0 新增）：按 chat_id 查这条请求在上游队里的排位。 */
const EP_QUEUE_STATUS = "/api/v1/queue/status";
/**
* 当前登录身份。**必须带 `/snap-manager` 前缀**：2026-09-30 实测
* `/v1/current/user` 是 APIG.0101（未发布），`/snap-manager/v1/current/user`
* 才返回 `{user_id, user_name, domain_id}`。codearts2api 的 const.go 里少了这段前缀
* （它另有 STS 的 `/v5/caller-identity`，但那条对 STS 临时凭证返回 401）。
*/
const EP_CURRENT_USER = "/snap-manager/v1/current/user";
const STATIC_MODEL_MAP = {
	"snap-chat": "GLM-5.2",
	"glm-5.2": "GLM-5.2",
	"glm-5.1": "GLM-5.1",
	"glm-4.7": "GLM-4.7",
	"openpangu-2.0-pro": "OpenPangu-2.0-Pro",
	"openpangu-2.0-flash": "OpenPangu-2.0-Flash",
	"qwen3-vl-235b": "Qwen3-VL-235B",
	"qwen3.5-397b-a17b-vl": "Qwen3.5-397B-A17B-VL",
	"qwen3.6-27b-vl": "Qwen3.6-27B-VL",
	"deepseek-v4-flash": "deepseek-v4-flash-0731",
	"deepseek-v4-pro": "deepseek-v4-pro-0813",
	"glm-5.3-flash": "glm-5.3-flash"
};
function canonicalModel(id) {
	return STATIC_MODEL_MAP[id.toLowerCase()] ?? id;
}
function hex32() {
	return randomBytes(16).toString("hex");
}
function randomTraceId() {
	return hex32();
}
/** 上游对 max_tokens 的服务端硬上限（2026-09-30 直连二分实测）。 */
const MAX_TOKENS_CEILING = 65536;
/** token 估算的余量：混排误差 + 上游自己注入的会话头，宁可少给也别整轮失败。 */
const PROMPT_ESTIMATE_MARGIN = 2048;
/** 短于此的生成长度就没有实际意义了，此时直接报具体错误而不是硬挤。 */
const MIN_USEFUL_OUTPUT_TOKENS = 1024;
/**
* 实测过的、**按模型**的 max_tokens 上限（小写 id → 上限）。
*
* 这个上限是模型相关的，不能用一个全局值：
*  - 免费（限时福利）DeepSeek 系列：> 65536 会被流内 InferHub.001001005.400
*    "The request param is invalid" 拒掉，而福利网关标称的是 393216 / 384000；
*  - GLM-5.2：2026-09-30 逐值直连验证过 8000/65536/131072 均正常，但
*    **2026-10-10 复测 131072 已经被拒**（同一个 InferHub.001001005.400），
*    65536 仍然正常。也就是说这条上限由服务端控制、会漂，目录里留着的旧实测值
*    不会报错，只会让该模型的每一轮在流的第一帧就失败 —— 所以复测要按日期记。
*
* 没测过的模型一律退回 `MAX_TOKENS_CEILING`（保守但可用），而不是照抄标称值 ——
* DSH 会把 catalog 的 maxTokens 原样当 max_tokens 发出去，照抄标称值等于让请求失败。
* 新增实测结果时往这里加一行即可（scripts/param-probe.mjs 与
* scripts/probe-models.ts 是得到这些数字的工具）。
*/
const MEASURED_MAX_TOKENS = {
	"deepseek-v4-flash-0731": 65536,
	"deepseek-v4-pro-0813": 65536,
	"deepseek-v4.1-flash": 65536,
	"glm-5.3-flash": 65536,
	"glm-5.2": 65536
};
/** 该模型可用的 max_tokens 上限（实测值与会话内学到的更低值取小）。 */
function maxTokensCeilingFor(id) {
	const measured = measuredCeilingFor(id);
	const learned = learnedMaxTokens.get(ceilingKey(id));
	return learned === void 0 ? measured : Math.min(measured, learned);
}
/**
* 上游的「参数非法」错误码。它是**流内**帧（HTTP 仍是 200），所以既不走
* classify()，也不会告诉我们是哪个参数错、更不区分「max_tokens 太大」和
* 「prompt 装不下」—— 一切得我们自己判。
*/
const PARAM_INVALID_CODE = "InferHub.001001005.400";
/** 一帧（chatStream 已把上游 error_code 转成 OpenAI error 帧）是不是那条「参数非法」。 */
function isParamInvalidFrame(text) {
	return text.includes("InferHub.001001005.400") || text.includes("The request param is invalid");
}
/**
* 本次进程内学到的上限（小写 id → 上限）。
*
* 上游会把「实测过」的值悄悄调低（GLM-5.2 的 131072 于 2026-10-10 被收），
* 手工表必然滞后。所以撞到「参数非法」时就地折半降档重试，并把结果记在这里，
* 免得该模型后面每一轮都先白撞一次。
*/
const learnedMaxTokens = /* @__PURE__ */ new Map();
/** 降档下限：再低就没有可用的生成长度了，此时宁可把具体错误报给用户。 */
const MAX_TOKENS_FLOOR = 8192;
function ceilingKey(id) {
	return id.trim().toLowerCase();
}
function measuredCeilingFor(id) {
	return MEASURED_MAX_TOKENS[ceilingKey(id)] ?? 65536;
}
/**
* 把该模型的上限折半降一档（收到「参数非法」后重发之前调用）。
* @returns 新的上限；已经降到底则返回 0，表示别再试了。
*/
function degradeTokenCeiling(id) {
	const next = Math.floor(maxTokensCeilingFor(id) / 2);
	if (next < MAX_TOKENS_FLOOR) return 0;
	learnedMaxTokens.set(ceilingKey(id), next);
	return next;
}
/**
* 粗估一段文本占多少 token：CJK 每字约 1，其余每 4 字符约 1。
*
* 只要保守就够用 —— 它的用途是「在我们这边就把装不下的情况判掉」，
* 而不是精确计费（上游不会告诉我们超没超，只会回一句参数非法）。
*/
function estimateTokens(text) {
	let cjk = 0;
	for (let i = 0; i < text.length; i += 1) {
		const code = text.charCodeAt(i);
		if (code >= 12352 && code <= 40959 || code >= 44032 && code <= 64511 || code >= 65280 && code <= 65376) cjk += 1;
	}
	return Math.ceil(cjk + (text.length - cjk) / 4);
}
/** 上游要求 chat_id 为 32 位小写十六进制。 */
const CHAT_ID_RE = /^[0-9a-f]{32}$/;
/** 稳定地把消息内容序列化成锚点文本（字符串原样，多模态数组走 JSON）。 */
function canonicalContent(content) {
	if (typeof content === "string") return content;
	if (content === void 0 || content === null) return "";
	try {
		return JSON.stringify(content);
	} catch {
		return String(content);
	}
}
/**
* 为一次对话派生稳定的 chat_id。
*
* 上游按 chat_id 计会话，而并发会话数有上限且回收很慢。若每个请求都新开一个
* chat_id，多轮对话几轮之后就会撞上「并发会话数已达上限」——历史在增长，但
* **首条 user 消息始终不变**，所以拿它当会话锚点：同一次对话的每一轮共用同一个
* chat_id，只占一个会话。
*
* 客户端若显式给了 conversation_id（32 位 hex）则优先用它。
*/
function conversationChatId(parsed) {
	const explicit = typeof parsed.conversation_id === "string" ? parsed.conversation_id.trim().toLowerCase() : "";
	if (CHAT_ID_RE.test(explicit)) return explicit;
	const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
	for (const raw of messages) {
		const message = raw;
		if (message?.role !== "user") continue;
		let anchor = `${message.role}\u0000${canonicalContent(message.content)}`;
		if (Array.isArray(parsed.tools) && parsed.tools.length > 0) anchor += "\0tools";
		return createHash("sha256").update(anchor).digest("hex").slice(0, 32);
	}
	return hex32();
}
/**
* 由 chat_id 派生稳定的会话标识，作为 `Session-Id` 头发给上游。
* 与参考实现 codearts2api 的 sessionIDFor 一致（sha256 前 16 字节）。
*/
function sessionIdFor(chatId) {
	return createHash("sha256").update(`codearts-session:${chatId}`).digest("hex").slice(0, 32);
}
/**
* 把 OpenAI 风格 chat body 适配给 CodeArts /api/v2/chat/completions。
* 该端点虽是 OpenAI 兼容，但网关按自己的 schema 严格校验参数。所以这里
* 不做原样透传，而是：
*  1. model 走 canonicalModel（大小写敏感）
*  2. max_completion_tokens → max_tokens（华为只认后者），并钳到该模型的上限；
*     再按 contextWindow 扣掉 prompt 估算，保证 prompt + max_tokens 装得下
*     （两者任一超限，上游都只会流内回 InferHub.001001005.400
*     "The request param is invalid, Please check it"，不告诉我们是哪一个）
*  3. 丢弃非白名单字段（stream_options / store / logprobs 等虽实测可容忍，
*     但按 codearts2api 观察到的真实流量收窄，避免网关后续收紧）；
*     例外是 `reasoning_effort`（DSH 的思考档位）：官方内核同样以这个顶层字段
*     透传 variant，见 kernel 的 `inferhub getArgs`。
*  4. tools[].function 去掉 strict（OpenAI 专有）
*  5. 注入 CodeArts 特有字段：chat_id（按对话派生，见 conversationChatId）、
*     prompt_cache_key、tool_stream
*
* @param contextWindow 该模型的上下文窗口（来自 catalog）。传 0 表示不知道，
*   此时只做上限钳制、不做「装不下」判断。
*/
function prepareChatBody(rawJson, contextWindow = 0) {
	let parsed = {};
	try {
		parsed = JSON.parse(rawJson);
	} catch {
		return {
			url: `${SNAP_HOST}${EP_CHAT}`,
			body: rawJson,
			model: "",
			chatId: ""
		};
	}
	const model = typeof parsed.model === "string" ? canonicalModel(parsed.model) : "";
	const chatId = conversationChatId(parsed);
	const body = {};
	for (const key of [
		"messages",
		"temperature",
		"top_p",
		"max_tokens",
		"stop",
		"presence_penalty",
		"frequency_penalty",
		"tools",
		"tool_choice",
		"user",
		"stream_options",
		"reasoning_effort"
	]) if (parsed[key] !== void 0) body[key] = parsed[key];
	if (Array.isArray(body.messages)) body.messages = body.messages.map((message) => message?.role === "developer" ? {
		...message,
		role: "system"
	} : message);
	if (body.stream_options === void 0 || typeof body.stream_options !== "object") body.stream_options = { include_usage: true };
	else body.stream_options.include_usage = true;
	if (body.max_tokens === void 0 && typeof parsed.max_completion_tokens === "number") body.max_tokens = parsed.max_completion_tokens;
	const ceiling = maxTokensCeilingFor(model);
	if (typeof body.max_tokens === "number") {
		let maxTokens = Math.min(body.max_tokens, ceiling);
		if (contextWindow > 0) {
			const promptTokens = estimateTokens(`${JSON.stringify(body.messages ?? "")}${JSON.stringify(body.tools ?? "")}`);
			const room = contextWindow - promptTokens - PROMPT_ESTIMATE_MARGIN;
			if (room < MIN_USEFUL_OUTPUT_TOKENS) {
				body.max_tokens = maxTokens;
				return {
					url: `${SNAP_HOST}${EP_CHAT}`,
					body: JSON.stringify(body),
					model,
					chatId,
					error: `上下文放不下：${model} 的窗口是 ${contextWindow} tokens，本次请求（含 ${Array.isArray(body.messages) ? body.messages.length : 0} 条消息与工具定义）估算约 ${promptTokens} tokens，剩余不足 ${MIN_USEFUL_OUTPUT_TOKENS} tokens 的生成余量。请新建会话或改用上下文更大的模型。`
				};
			}
			maxTokens = Math.min(maxTokens, room);
		}
		body.max_tokens = maxTokens;
	}
	if (Array.isArray(body.tools)) body.tools = body.tools.map((tool) => {
		if (tool && typeof tool === "object" && tool.function && typeof tool.function === "object") {
			const fn = { ...tool.function };
			delete fn.strict;
			return {
				...tool,
				function: fn
			};
		}
		return tool;
	});
	body.model = model;
	body.stream = true;
	body.chat_id = chatId;
	body.prompt_cache_key = chatId;
	body.tool_stream = true;
	return {
		url: `${SNAP_HOST}${EP_CHAT}`,
		body: JSON.stringify(body),
		model,
		chatId
	};
}
/**
* 免费档的「并发会话数已达上限」。实测 HTTP 400 + 这个错误码，上限是 3 个会话，
* 而且被掐断/挂起的流要约 2 分钟才被网关回收。它不是请求错误，重发就有机会，
* 所以 shim 要在本地排队重等，而不是把它变成 pi-ai 的重试风暴。
*/
const CONCURRENCY_CAP_CODE = "TM.00001041";
function isConcurrencyCap(result) {
	return !result.ok && result.message.includes("TM.00001041");
}
/**
* 模型级 TPM（tokens per minute）配额超限。2026-10-21 实测：它和并发上限不同，
* 是**流内首帧**（HTTP 200）回的，所以照样绕过了 classify；换号也没用（配额按
* 模型共享），能做的只有本地排队等窗口滑过去。
*
* 上游的码并不固定：同一小时内见过 `InferHub.ModelArts.81111.429`（"The model TPM
* limit has been significantly exceeded."）和 `InferHub.ModelArts.81114.429`
* （"Too many requests, the rate limit is 50000000 tokens per minute."）。所以按
* 形状认（ModelArts.*.429）而不是按某一个常量认。
*/
const TPM_LIMIT_CODE = "InferHub.ModelArts.81111.429";
const MODEL_RATE_CODE = /InferHub\.ModelArts\.\d+\.429/;
const MODEL_RATE_TEXT = /tpm limit|rate limit|too many requests/i;
function isTpmLimit(result) {
	if (result.ok) return false;
	return MODEL_RATE_CODE.test(result.message) || MODEL_RATE_TEXT.test(result.message);
}
/** 撞到这两类限流都值得原地等，而不是直接甩给 pi-ai 重试。 */
function isQueueableRate(result) {
	return isConcurrencyCap(result) || isTpmLimit(result);
}
/**
* 从一帧已转成 OpenAI 形状的 SSE 里认出「可排队限流」。
*
* 只在**还没有任何内容产出**的首帧上使用：此时重发是安全的；一旦下游已经收到
* 字节，HTTP 头也发出去了，就只能把错误帧原样交出去。
*/
function rateLimitFrame(text) {
	if (!text.includes("error")) return void 0;
	for (const line of text.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("data:")) continue;
		const payload = trimmed.slice(5).trim();
		if (payload === "" || payload === "[DONE]") continue;
		let ev;
		try {
			ev = JSON.parse(payload);
		} catch {
			continue;
		}
		const code = String(ev.error?.code ?? ev.error_code ?? "");
		const message = String(ev.error?.message ?? ev.error_msg ?? "");
		const probe = {
			ok: false,
			kind: "soft_rate",
			status: 429,
			message: `${code}: ${message}`
		};
		if (code === "TM.00001041" || isTpmLimit(probe)) return {
			code: code === "" ? TPM_LIMIT_CODE : code,
			message
		};
	}
}
/**
* 把上游错误翻译成用户能看懂的一句话。
*
* 这些错误都发生在「账号、插件都正常」的时候 —— 原样把英文码甩给用户，只会
* 让人以为是自己配错了。默认分支仍保留原始信息，便于排查。
*/
function upstreamErrorMessage(message, status = 0) {
	if (isResignRefusal(message)) return "本地代理 billion-context 拦下了这条签名请求（它拿不到 CodeArts 凭据做重签，在本地直接拒了），不是你的账号问题：请在 ~/.config/billion-context/billion-context.json 加上 \"resign\": { \"sdk-hmac-sha256\": { \"passthrough\": true } } 后重启 DSH，或为它配置重签凭据。";
	if (MODEL_RATE_CODE.test(message) || MODEL_RATE_TEXT.test(message)) return "华为侧该模型当前请求过多（共享 TPM 超限），不是你的账号或插件问题。稍后重试，或临时改用 GLM-5.2 / GLM-5.3。";
	if (message.includes("TM.00001041")) return "CodeArts 免费档同时只允许 3 个会话，当前槽位一直占满（被打断的会话约 1 分钟才释放）。请稍后重试。";
	if (isBenefitMissing("", message)) return "这个模型属于限时福利，当前福利通道不可用（不是账号问题）。可以刷新模型列表，改用非福利模型。";
	if (message.toLowerCase().includes("model is not registered")) return "上游没有注册这个模型，它可能已经下线；请刷新模型列表后重选。";
	if (isNotMultimodal("", message)) return IMAGE_UNSUPPORTED_MESSAGE;
	if (message.startsWith("图片转述失败")) return message;
	return `codearts 上游错误 (http ${status}): ${message.slice(0, 400)}`;
}
/**
* 「这个账号当前没有该模型的限时福利权益」。2026-10-21 实测：上游回 HTTP 200，
* 错误在**流内帧**里（不在状态码上），所以它既不走 retry 也不走换号，用户看到的
* 就是正文里裸裸一句 `benefit not found`。
*
* 这条不是请求写错了，重发也不会好：福利模型只有福利路由，去掉 `maas_type: benefit`
* 就变成 InferHub.002002009.404 model is not registered。唯一出路是等活动回来。
*/
const BENEFIT_MISSING_CODE = "InferHub.4004.200";
function isBenefitMissing(code, message) {
	return code === "InferHub.4004.200" || message.toLowerCase().includes("benefit not found");
}
/**
* 上游拒绝图片的判据（两条错误码都实测见过）。
*
*  - `InferHub.001001020.406`：`The request model is not multimodal` —— 模型不吃图。
*  - `InferHub.001001046.406`：`The multimodal content of the multimodal request is
*    incorrect` —— 图片字段形状不对（例如 `image_url` 直接给字符串）。
*
* 只用来判断「这次带图的请求被拒了」，因此调用方必须先确认请求体里确实有图片，
* 否则一条纯文本请求撞上同类错误会被误记成模型不支持图片。
*/
function isNotMultimodal(code, message) {
	return code.includes("001001020") || code.includes("001001046") || /not multimodal|multimodal content/i.test(message);
}
/**
* 带图请求撞上纯文本模型时给用户看的话。
*
* 上游只会回一句英文 `The request model is not multimodal`，用户会以为是插件坏了；
* 实际上 CodeArts 的聊天 API 只对 VL 模型收图 —— 网页端能读图走的是另一套
* `cloudagent` 附件服务（图片先上传成 attachment_id，由服务端解析），和这条
* AK/SK 签名的 API 不是同一条链路。所以这里把出路直接写清楚。
*/
const IMAGE_UNSUPPORTED_MESSAGE = "这个模型在 API 里不收图片（上游返回 not multimodal）。要发图请改用 Qwen3-VL-235B 或 kimi-k2.6-vl；网页端能读图是因为它走的是另一套附件服务。";
/**
* 本地代理「拒签」标记：billion-context 这类宿主层代理拦截出站请求做上下文压缩，
* 碰到 SDK-HMAC-SHA256 签名请求要用 CodeArts 凭据重签；找不到凭据时在**本地**回
* 403（根本没出网），body 里带这两个标记。这不是凭据失效 —— 归 session_dead 会把
* 账号永久禁用（见 issue #1）。
*/
function isResignRefusal(message) {
	return message.includes("signed_request_requires_resign") || message.includes("bili_resign_unavailable");
}
function classify(status, message) {
	const m = message.toLowerCase();
	if (isResignRefusal(message)) return "client";
	if (status === 401 || status === 403) return "session_dead";
	if (status === 402) return "hard_credit";
	if (status === 429) return "soft_rate";
	if (status === 404) return "not_found";
	if (status >= 500) return "server";
	if (m.includes("not registered") || m.includes("benefit not found")) return "not_found";
	if (m.includes("tpm") || m.includes("并发")) return "soft_rate";
	return "client";
}
/**
* 出网唯一入口：**只把 URL 字符串和普通 init 交给 fetch，绝不把 Request 对象交出去**。
*
* 邻居插件会换掉 `globalThis.fetch`（例如 IP 池出口路由直接把 undici 模块自带的
* fetch 装成全局）。这时 `globalThis.Request` 还是另一份实例，而 undici 的 fetch
* 用 `instanceof` 认自己的 Request：不是自己那份就当 URL 字符串处理，报
* `Failed to parse URL from [object Request]`，而且是 HTTP 0（根本没出网）。
* 所以 Request 只当签名的载体（signer 要读写它的头部），发出去时拆回纯数据。
*
* 头部按 forEach 展开会全部变成小写名 —— 签名侧本来也按小写规范化，HTTP 头大小写
* 不敏感，上游不受影响。
*
* @param req 已签好名的请求
* @param body 原始请求体；GET/DELETE 传 undefined（带空 body 的 GET 会被 fetch 直接拒）
* @param signal 中止信号
*/
async function dispatch(req, body, signal) {
	const headers = {};
	req.headers.forEach((value, key) => {
		headers[key] = value;
	});
	return fetch(req.url, {
		method: req.method,
		headers,
		...body === void 0 ? {} : { body },
		...signal === void 0 ? {} : { signal }
	});
}
const enc = new TextEncoder();
function openAIData(obj) {
	return enc.encode(`data: ${JSON.stringify(obj)}\n\n`);
}
/** OpenAI 流的终止帧是裸 `data: [DONE]`，不能走 JSON.stringify（否则会带引号）。 */
function openAIDone() {
	return enc.encode("data: [DONE]\n\n");
}
/**
* 把上游累计快照 SSE 转换成 OpenAI 增量流。
*
* 上游行为（reverse-engineering.md §5）：
*  - {"type":"answer", ...} 起始
*  - {"text": "<累计全文>"} 全文快照（用替换语义）
*  - {"delta":{"content":"..."}} 真增量
*  - {"text":"[DONE]","error_code":"0"} 结束；error_code != 0 为错误
*/
async function chatStream(credential, prepared, signal) {
	const traceId = randomTraceId();
	const bodyBuf = Buffer.from(prepared.body);
	const hadImage = prepared.body.includes("\"image_url\"");
	const benefit = isBenefitModel(prepared.model);
	const req = new Request(prepared.url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "text/event-stream",
			"x-auth-token": credential.token,
			"X-Security-Token": credential.securityToken,
			"x-snap-traceid": traceId,
			"X-Language": "zh-cn",
			"app-id": "CodeAgent3.0",
			"is_confidential": "false",
			...benefit ? { "maas_type": "benefit" } : {}
		},
		body: bodyBuf
	});
	if (credential.accessKeyId && credential.secretAccessKey) signRequest(req, bodyBuf, {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	if (prepared.chatId) {
		req.headers.set("Chat-Id", prepared.chatId);
		req.headers.set("Session-Id", sessionIdFor(prepared.chatId));
	}
	let resp;
	try {
		resp = await dispatch(req, bodyBuf, signal);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (signal?.aborted === true) return {
			ok: false,
			kind: "client",
			status: 0,
			message: "aborted by client"
		};
		return {
			ok: false,
			kind: "server",
			status: 0,
			message
		};
	}
	if (!resp.ok) {
		const text = await resp.text().catch(() => "");
		if (isBenefitMissing("", text)) markBenefitBlocked(prepared.model);
		if (hadImage && isNotMultimodal("", text)) markImageBlocked(prepared.model);
		return {
			ok: false,
			kind: classify(resp.status, text),
			status: resp.status,
			message: text.slice(0, 400)
		};
	}
	const model = prepared.model;
	const upstream = resp.body;
	if (!upstream) return {
		ok: false,
		kind: "server",
		status: 0,
		message: "dsh-codearts-connect: 上游无响应体"
	};
	const reader = upstream.getReader();
	const decoder = new TextDecoder();
	let lastText = "";
	let sentAny = false;
	let doneSent = false;
	let sseBuf = "";
	return {
		ok: true,
		stream: new ReadableStream({
			async pull(controller) {
				try {
					for (;;) {
						const { done, value } = await reader.read();
						if (done) {
							if (sentAny && !doneSent) controller.enqueue(openAIDone());
							controller.close();
							return;
						}
						sseBuf += decoder.decode(value, { stream: true });
						const lines = sseBuf.split("\n");
						sseBuf = lines.pop() ?? "";
						let emitted = false;
						for (const raw of lines) {
							const trimmed = raw.trim();
							if (!trimmed.startsWith("data:")) continue;
							const payload = trimmed.slice(5).trim();
							if (payload === "[DONE]") {
								sentAny = true;
								if (!doneSent) {
									doneSent = true;
									controller.enqueue(openAIDone());
									emitted = true;
								}
								continue;
							}
							if (!payload) continue;
							let ev;
							try {
								ev = JSON.parse(payload);
							} catch {
								continue;
							}
							if (ev.error_code && ev.error_code !== "0" && ev.error_code !== 0) {
								if (isBenefitMissing(String(ev.error_code), String(ev.error_msg ?? ""))) markBenefitBlocked(model);
								if (hadImage && isNotMultimodal(String(ev.error_code), String(ev.error_msg ?? ""))) markImageBlocked(model);
								const upstreamMsg = String(ev.error_msg ?? "upstream error");
								const friendlyMsg = hadImage && isNotMultimodal(String(ev.error_code), upstreamMsg) ? IMAGE_UNSUPPORTED_MESSAGE : upstreamMsg;
								controller.enqueue(openAIData({
									choices: [{
										delta: { content: "" },
										finish_reason: "stop"
									}],
									error: {
										code: ev.error_code,
										message: friendlyMsg
									}
								}));
								controller.enqueue(openAIDone());
								controller.close();
								return;
							}
							if (Array.isArray(ev.choices)) {
								sentAny = true;
								controller.enqueue(enc.encode(`data: ${JSON.stringify(ev)}\n\n`));
								emitted = true;
								continue;
							}
							if (ev.delta?.content) {
								sentAny = true;
								controller.enqueue(openAIData({
									model,
									choices: [{
										delta: { content: ev.delta.content },
										finish_reason: null
									}]
								}));
								emitted = true;
							}
							if (typeof ev.text === "string" && ev.text !== "[DONE]") {
								const cur = ev.text;
								if (cur.length > lastText.length && cur.startsWith(lastText)) {
									const delta = cur.slice(lastText.length);
									sentAny = true;
									controller.enqueue(openAIData({
										model,
										choices: [{
											delta: { content: delta },
											finish_reason: null
										}]
									}));
									emitted = true;
								}
								lastText = cur;
							}
						}
						if (emitted) return;
					}
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					controller.enqueue(openAIData({ error: { message } }));
					controller.close();
				}
			},
			cancel() {
				reader.cancel().catch(() => {});
			}
		})
	};
}
/** 默认的图片转述模型；实测能读图，且比商业视觉模型便宜。 */
const DEFAULT_IMAGE_BRIDGE_MODEL = "Qwen3-VL-235B";
const IMAGE_CAPTION_PROMPT = "你是图片转述器。请客观描述这张图片：保留其中可见的文字、数字、界面元素、图表与布局关系；不要推测看不见的内容。用中文回答，200 字以内。";
/** 图片转述缓存：同一张图在后续轮次不重复花钱。只在内存里，进程重启即清。 */
const captionCache = /* @__PURE__ */ new Map();
const CAPTION_CACHE_LIMIT = 128;
function imageUrlsOf(parsed) {
	const urls = [];
	const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
	for (const raw of messages) {
		if (raw === null || typeof raw !== "object") continue;
		const content = raw.content;
		if (!Array.isArray(content)) continue;
		for (const part of content) {
			if (part === null || typeof part !== "object") continue;
			const typed = part;
			if (typed.type !== "image_url") continue;
			const source = typed.image_url;
			if (typeof source === "string" && source !== "") urls.push(source);
			else if (source !== null && typeof source === "object") {
				const url = source.url;
				if (typeof url === "string" && url !== "") urls.push(url);
			}
		}
	}
	return urls;
}
/** 从非流式响应（偶尔也可能是 SSE）里取出正文。 */
function captionTextOf(raw) {
	try {
		const content = JSON.parse(raw).choices?.[0]?.message?.content;
		if (typeof content === "string") return content;
	} catch {}
	let text = "";
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("data:")) continue;
		const payload = trimmed.slice(5).trim();
		if (payload === "" || payload === "[DONE]") continue;
		try {
			const ev = JSON.parse(payload);
			const content = ev.choices?.[0]?.delta?.content ?? ev.choices?.[0]?.message?.content;
			if (typeof content === "string") text += content;
		} catch {}
	}
	return text;
}
async function captionImage(credential, model, url, signal) {
	const key = createHash("sha256").update(model).update("\0").update(url).digest("hex");
	const cached = captionCache.get(key);
	if (cached !== void 0) return cached;
	const body = JSON.stringify({
		model,
		stream: false,
		max_tokens: 512,
		messages: [{
			role: "user",
			content: [{
				type: "text",
				text: IMAGE_CAPTION_PROMPT
			}, {
				type: "image_url",
				image_url: { url }
			}]
		}]
	});
	const bodyBuf = Buffer.from(body);
	const req = new Request(`${SNAP_HOST}${EP_CHAT}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"x-auth-token": credential.token,
			"X-Security-Token": credential.securityToken,
			"x-snap-traceid": randomTraceId(),
			"X-Language": "zh-cn",
			"app-id": "CodeAgent3.0",
			"is_confidential": "false",
			...isBenefitModel(model) ? { "maas_type": "benefit" } : {}
		},
		body: bodyBuf
	});
	if (credential.accessKeyId && credential.secretAccessKey) signRequest(req, bodyBuf, {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	const resp = await dispatch(req, bodyBuf, signal);
	const raw = await resp.text().catch(() => "");
	if (!resp.ok) throw new Error(`图片转述请求失败：HTTP ${resp.status} ${raw.slice(0, 200)}`);
	const caption = captionTextOf(raw).trim();
	if (caption === "") throw new Error("图片转述返回了空内容");
	if (captionCache.size >= CAPTION_CACHE_LIMIT) {
		const oldest = captionCache.keys().next().value;
		if (oldest !== void 0) captionCache.delete(oldest);
	}
	captionCache.set(key, caption);
	return caption;
}
/**
* 把请求体里的图片替换成视觉模型的中文描述，供纯文本模型使用。
*
* 用**非流式**请求：上游只有流式请求占每账号 3 个会话槽，非流式不占；
* 否则转述本身就会把主请求的槽位挤掉。同一张图按 URL 哈希缓存。
*/
async function bridgeImages(credential, rawJson, bridgeModel, signal) {
	let parsed;
	try {
		parsed = JSON.parse(rawJson);
	} catch {
		return {
			ok: false,
			message: "图片转述失败：请求体不是合法 JSON"
		};
	}
	const urls = imageUrlsOf(parsed);
	if (urls.length === 0) return {
		ok: true,
		body: rawJson,
		images: 0
	};
	const captions = /* @__PURE__ */ new Map();
	for (const url of urls) {
		if (captions.has(url)) continue;
		try {
			captions.set(url, await captionImage(credential, bridgeModel, url, signal));
		} catch (error) {
			return {
				ok: false,
				message: `图片转述失败：${error instanceof Error ? error.message : String(error)}。可改用原生视觉模型，或关闭图片转述。`
			};
		}
	}
	const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
	for (const raw of messages) {
		if (raw === null || typeof raw !== "object") continue;
		const message = raw;
		if (!Array.isArray(message.content)) continue;
		message.content = message.content.map((part) => {
			if (part === null || typeof part !== "object") return part;
			const typed = part;
			if (typed.type !== "image_url") return part;
			const source = typed.image_url;
			const url = typeof source === "string" ? source : source !== null && typeof source === "object" && typeof source.url === "string" ? source.url : "";
			const caption = captions.get(url);
			if (caption === void 0) return part;
			return {
				type: "text",
				text: `[图片内容] ${caption}`
			};
		});
	}
	return {
		ok: true,
		body: JSON.stringify(parsed),
		images: urls.length
	};
}
/**
* 查当前凭证对应的账号身份。
*
* 为什么需要它：登录响应里 `user_id` / `user_name` 都是空串（实测），所以插件原先
* 只能拿 DPoP 公钥当账号标识 —— 代价是**对同一个账号重新登录会被当成新账号**。
* 这个端点给出上游的稳定 `user_id`，重新登录就能命中同一条账号记录。
*
* 失败不应阻断登录：调用方按「拿不到身份就退回旧行为」处理。
*/
async function fetchCallerIdentity(credential, signal) {
	const resp = await signedGet(`${SNAP_HOST}${EP_CURRENT_USER}`, credential, void 0, signal);
	if (!resp.ok) throw new Error(`identity HTTP ${resp.status} ${resp.message}`);
	const body = asRecord(parseJson(resp.text));
	const userId = firstString(body.user_id);
	if (userId === "") throw new Error("identity response carries no user_id");
	return {
		userId,
		userName: firstString(body.user_name),
		domainId: firstString(body.domain_id)
	};
}
/** 发现不到 contextWindow 时的保守默认值：只影响 DSH 的上下文计量条与截断余量。 */
const UNKNOWN_CONTEXT_WINDOW = 32768;
/** 发现不到 maxTokens 时的默认值（低于服务端上限，保证请求能过）。 */
const UNKNOWN_MAX_TOKENS = 8e3;
/** 带 AK/SK 签名的 GET；body 为空（签名按空载荷算）。 */
async function signedGet(url, credential, agentType, signal) {
	const req = new Request(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"X-Language": "zh-cn",
			...agentType === void 0 ? {} : { "Agent-Type": agentType },
			"X-Security-Token": credential.securityToken
		}
	});
	if (credential.accessKeyId && credential.secretAccessKey) signRequest(req, Buffer.from(""), {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	let resp;
	try {
		resp = await dispatch(req, void 0, signal);
	} catch (error) {
		return {
			ok: false,
			status: 0,
			message: error instanceof Error ? error.message : String(error)
		};
	}
	const text = await resp.text().catch(() => "");
	if (!resp.ok) return {
		ok: false,
		status: resp.status,
		message: text.slice(0, 300)
	};
	return {
		ok: true,
		text
	};
}
function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch {
		return;
	}
}
function positive(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
function firstString(...values) {
	for (const value of values) if (typeof value === "string" && value.trim() !== "") return value.trim();
	return "";
}
function asRecord(value) {
	return typeof value === "object" && value !== null ? value : {};
}
function asArray(value) {
	return Array.isArray(value) ? value : [];
}
/**
* 从 `credit[]` 里取常规时段的展示倍率（原样 `0.18x`）。
*
* 上游给每个时段一条（`default` / `off_peak`，实测 2026-10-21）。这里只取
* `default`：尖峰价才是用户平时付的，低峰 0.09x 属于额外优惠，拿来当标题会低估。
* 没有 credit 的模型（如 Qwen3-VL）返回 undefined —— 界面上就不显示倍率。
*/
function creditRatioOf(record) {
	const credits = asArray(record.credit).map(asRecord);
	if (credits.length === 0) return void 0;
	const pick = credits.find((entry) => entry.time_slot_id === "default") ?? credits.find((entry) => entry.time_slot_id === null || entry.time_slot_id === void 0) ?? credits[0];
	if (pick === void 0) return void 0;
	const match = /^\s*(\d+(?:\.\d+)?)\s*x\s*$/i.exec(firstString(pick.ratio_display));
	return match === null ? void 0 : `${match[1]}x`;
}
/**
* 内置模型：`GET /v1/model/builtin`（`Agent-Type: PromptCenter`）。
* 实测响应 `{ count, builtinModels: [{ model_id, model_name, model_desc,
* enable, display_enabled, supports_images, ... }] }` —— 注意它**不带**
* context_window / max_tokens，那两项要靠合并种子或福利来源补。
*/
async function fetchBuiltinModels(credential, signal) {
	const resp = await signedGet(`${SNAP_HOST}${EP_MODEL_BUILTIN}`, credential, "PromptCenter", signal);
	if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.message}`);
	const body = asRecord(parseJson(resp.text));
	const out = [];
	for (const raw of asArray(body.builtinModels)) {
		const model = asRecord(raw);
		if (model.enable === false) continue;
		const id = firstString(model.model_id, model.model_name);
		if (id === "") continue;
		const ratio = creditRatioOf(model);
		out.push({
			id,
			name: firstString(model.model_name, id),
			contextWindow: positive(model.context_window),
			maxTokens: positive(model.max_tokens),
			supportsImages: model.supports_images === true,
			...ratio === void 0 ? {} : { ratio }
		});
	}
	return out;
}
/**
* 限时福利模型：`GET {opengw}/api/v1/gateway/config`。
* 实测响应 `{ error_code: '0000', result: { base_url, models: [{ model_id,
* model_name, context_window, max_tokens, sort }] } }`，整份标记福利。
*/
async function fetchBenefitModels(credential, signal) {
	const resp = await signedGet(`${BENEFIT_HOST}${EP_BENEFIT_CONFIG}`, credential, void 0, signal);
	if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.message}`);
	const body = asRecord(parseJson(resp.text));
	const code = firstString(body.error_code);
	if (code !== "" && code !== "0000") throw new Error(`gateway/config error_code=${code} ${firstString(body.error_msg)}`);
	const out = [];
	for (const raw of asArray(asRecord(body.result).models)) {
		const model = asRecord(raw);
		const id = firstString(model.model_id, model.model_name);
		if (id === "") continue;
		const ratio = creditRatioOf(model);
		out.push({
			id,
			name: firstString(model.model_name, id),
			contextWindow: positive(model.context_window),
			maxTokens: positive(model.max_tokens),
			supportsImages: model.supports_images === true,
			...ratio === void 0 ? {} : { ratio },
			benefit: true
		});
	}
	return out;
}
/**
* agent-center 的模型清单：先 `useragents` 找一个 CodeAgent，再取 detail 的
* `gpts.models`。过滤条件与官方客户端一致（`agent_name === 'CodeAgent'` 且
* IDE 可见），退化为 primary，再退化为第一个。
*/
async function fetchAgentModels(credential, signal) {
	const listResp = await signedGet(`${SNAP_HOST}${EP_AGENT_LIST}?offset=0&limit=100&is_primary_agent=true`, credential, "AgentCenter", signal);
	if (!listResp.ok) throw new Error(`agent list HTTP ${listResp.status} ${listResp.message}`);
	const agents = asArray(asRecord(parseJson(listResp.text)).agents).map(asRecord);
	let agentId = "";
	for (const agent of agents) {
		const alias = asRecord(agent.alias);
		if (firstString(agent.agent_name) === "CodeAgent" && firstString(alias.alias_zh_cn) === "智能体" && agent.show_in_ide === true) {
			agentId = firstString(agent.agent_id);
			if (agentId !== "") break;
		}
	}
	if (agentId === "") {
		for (const agent of agents) if (agent.is_primary_agent === true) {
			agentId = firstString(agent.agent_id);
			if (agentId !== "") break;
		}
	}
	if (agentId === "" && agents.length > 0) agentId = firstString(agents[0]?.agent_id);
	if (agentId === "") throw new Error("no agent found to read gpts.models from");
	const detailResp = await signedGet(`${SNAP_HOST}${EP_AGENT_DETAIL}?agent_id=${encodeURIComponent(agentId)}`, credential, "AgentCenter", signal);
	if (!detailResp.ok) throw new Error(`agent detail HTTP ${detailResp.status} ${detailResp.message}`);
	const gpts = asRecord(asRecord(parseJson(detailResp.text)).gpts);
	const out = [];
	for (const raw of asArray(gpts.models)) {
		const model = asRecord(raw);
		const params = asRecord(model.model_parameters);
		const id = firstString(params.model_id, model.model_id, model.model_alias, model.model_name);
		if (id === "") continue;
		const ratio = creditRatioOf(model) ?? creditRatioOf(params);
		out.push({
			id,
			name: firstString(model.model_name, model.model_alias, id),
			contextWindow: positive(params.context_window),
			maxTokens: positive(params.max_tokens),
			supportsImages: model.supports_images === true,
			...ratio === void 0 ? {} : { ratio }
		});
	}
	return out;
}
/**
* 思考强度清单：`POST /v1/model/thinking-variants`，body `{ model_names }`。
*
* 实测响应 `{ variants: { "GLM-5.2": { strengths: ["high","max"],
* default_strength: "high" }, ... } }`，键是请求里的名字（大小写原样），
* 不支持的模型给空 `strengths`。官方客户端限 50 个名字，这里照搬。
*
* 这是**可选增强**：上游没给（旧账号/接口漂移）时模型照常可用，只是宿主不显示
* 推理档位选择器。失败由调用方记进 errors，不抛断发现。
*/
async function fetchThinkingVariants(credential, modelIds, signal) {
	const out = /* @__PURE__ */ new Map();
	const modelNames = modelIds.slice(0, 50);
	if (modelNames.length === 0) return out;
	const bodyBuf = Buffer.from(JSON.stringify({ model_names: modelNames }));
	const req = new Request(`${SNAP_HOST}${EP_THINKING_VARIANTS}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-auth-token": credential.token,
			"X-Security-Token": credential.securityToken,
			"x-snap-traceid": randomTraceId(),
			"X-Language": "zh-cn",
			"Agent-Type": "PromptCenter"
		},
		body: bodyBuf
	});
	if (credential.accessKeyId && credential.secretAccessKey) signRequest(req, bodyBuf, {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	const resp = await dispatch(req, bodyBuf, signal);
	if (!resp.ok) {
		const text = await resp.text().catch(() => "");
		throw new Error(`thinking-variants HTTP ${resp.status} ${text.slice(0, 200)}`);
	}
	const body = asRecord(parseJson(await resp.text()));
	for (const [name, raw] of Object.entries(asRecord(body.variants))) {
		const variant = asRecord(raw);
		const strengths = asArray(variant.strengths).map((value) => firstString(value)).filter((value) => value !== "");
		if (strengths.length === 0) continue;
		const fallback = firstString(variant.default_strength);
		out.set(name.trim().toLowerCase(), {
			strengths,
			...fallback === "" ? {} : { default: fallback }
		});
	}
	return out;
}
/**
* 查一条请求的排队位置：`GET /api/v1/queue/status?task_id=<chat_id>&model=<model>`。
*
* ⚠ 这个 GET 是**占号**，不是只读查询：每次调用都会把 task 挂进队列、返回队尾位置，
* 用 `clearQueueStatus` 才清得掉（2026-10-21 实测）。队列空闲的模型（如 GLM）直接
* 回 `status:"working"`、位置 0；拥堵的模型（如 deepseek-v4.1-flash）对新号一律
* 回 `waiting` + 当前队尾。真正的 chat 请求不看这张票，所以要不要等由调用方决定
* （见 `src/queue.ts`）。
*/
async function fetchQueueStatus(credential, chatId, model, signal) {
	const url = new URL(`${SNAP_HOST}${EP_QUEUE_STATUS}`);
	url.searchParams.set("task_id", chatId);
	url.searchParams.set("model", model);
	const req = new Request(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"x-auth-token": credential.token,
			"X-Security-Token": credential.securityToken,
			"x-snap-traceid": randomTraceId(),
			"X-Language": "zh-cn"
		}
	});
	if (credential.accessKeyId && credential.secretAccessKey) signRequest(req, Buffer.alloc(0), {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	const resp = await dispatch(req, void 0, signal);
	if (!resp.ok) {
		const text = await resp.text().catch(() => "");
		throw new Error(`queue status HTTP ${resp.status} ${text.slice(0, 200)}`);
	}
	const body = asRecord(parseJson(await resp.text()));
	return {
		status: firstString(body.status),
		queueLength: positive(body.queue_length),
		queuePosition: positive(body.queue_position),
		message: firstString(body.message)
	};
}
/**
* 清掉 `fetchQueueStatus` 挂上去的占号：`DELETE /api/v1/queue/status?task_id=&model=`。
*
* 官方客户端在回答结束、用户取消、排队出错时都会调；不清的话每次查询都会在上游
* 队列里留一个幽灵任务，队列只会越来越长。
*/
async function clearQueueStatus(credential, chatId, model, signal) {
	const url = new URL(`${SNAP_HOST}${EP_QUEUE_STATUS}`);
	url.searchParams.set("task_id", chatId);
	url.searchParams.set("model", model);
	const req = new Request(url, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			"x-auth-token": credential.token,
			"X-Security-Token": credential.securityToken,
			"x-snap-traceid": randomTraceId(),
			"X-Language": "zh-cn"
		}
	});
	if (credential.accessKeyId && credential.secretAccessKey) signRequest(req, Buffer.alloc(0), {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	const resp = await dispatch(req, void 0, signal);
	if (!resp.ok) {
		const text = await resp.text().catch(() => "");
		throw new Error(`queue clear HTTP ${resp.status} ${text.slice(0, 200)}`);
	}
}
/**
* 动态发现当前账号可用的模型清单（三路合并）。
*
* 与 codearts2api 的 `Client.FetchModels` 等价：内置、限时福利、agent-center 三路
* 各自独立，任一路失败只记进 `errors` 不阻断 —— 福利网关抖动时仍能拿到内置模型。
*
* 上标的两个「实测 vs 标称」处理（很重要，别照搬标称值）：
*  - **maxTokens 钳到该模型的实测上限**（`MEASURED_MAX_TOKENS`）。上游
*    `gateway/config` 给福利模型标的是 393216 / 384000，而聊天端点实测超过 65536
*    就流内报 InferHub.001001005.400；DSH 会把 catalog 的 maxTokens 原样当
*    max_tokens 发出去，照抄标称值等于让每个请求都失败。
*  - contextWindow 用发现值（只影响 DSH 的上下文计量与截断余量，不影响路由）。
*
* @throws 三路全失败，或合并结果为空。
*/
async function fetchModels(credential, signal) {
	const settled = await Promise.all([
		fetchBuiltinModels(credential, signal).then((models) => ({
			source: "builtin",
			models
		}), (error) => ({
			source: "builtin",
			error
		})),
		fetchBenefitModels(credential, signal).then((models) => ({
			source: "benefit",
			models
		}), (error) => ({
			source: "benefit",
			error
		})),
		fetchAgentModels(credential, signal).then((models) => ({
			source: "agent",
			models
		}), (error) => ({
			source: "agent",
			error
		}))
	]);
	const sources = [];
	const errors = [];
	const discovered = [];
	for (const item of settled) if ("error" in item) errors.push({
		source: item.source,
		message: item.error.message
	});
	else {
		sources.push(item.source);
		discovered.push(item.models);
	}
	if (sources.length === 0) throw new Error(`model discovery failed on every source: ${errors.map((e) => `${e.source}: ${e.message}`).join("; ")}`);
	const merged = backfillParams(mergeModelLists(discovered));
	if (merged.length === 0) throw new Error("model discovery returned an empty catalog");
	let variants = /* @__PURE__ */ new Map();
	try {
		variants = await fetchThinkingVariants(credential, merged.map((model) => model.id), signal);
	} catch (error) {
		errors.push({
			source: "thinking",
			message: error instanceof Error ? error.message : String(error)
		});
	}
	return {
		models: merged.map((model) => {
			const thinking = variants.get(model.id.toLowerCase());
			return {
				...model,
				...thinking === void 0 ? {} : { thinking },
				contextWindow: model.contextWindow > 0 ? model.contextWindow : UNKNOWN_CONTEXT_WINDOW,
				maxTokens: Math.min(model.maxTokens > 0 ? model.maxTokens : UNKNOWN_MAX_TOKENS, maxTokensCeilingFor(model.id))
			};
		}),
		sources,
		errors
	};
}
/**
* 开通「限时福利」（免费模型）渠道，幂等：已开通就原样返回。官方客户端打开模型菜单
* 即调用（GET），用户点「领取」时也调（POST）——两种方法实测都返回 200/0000。
* 不开通时福利模型调用必报 InferHub.4004.200 benefit not found。
* 需要 AK/SK 签名（凭证要带 accessKeyId/secretAccessKey）。
*
* **它不发积分。** 返回体只是一条渠道开通记录（channel / create_time / update_time，
* 幂等所以时间戳是旧的），账号积分由套餐决定（见 credits.ts），领取动作在官网签到页。
* 别把它当「领取积分」用 —— 早先卡片这么用，结果就是「点了显示已领取、积分没变」。
*/
async function claimBenefit(credential, abort) {
	if (!credential.accessKeyId || !credential.secretAccessKey) return;
	const url = `${BENEFIT_HOST}${EP_BENEFIT_CLAIM}`;
	const bodyBuf = Buffer.from("{}");
	const req = new Request(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Language": "zh-cn",
			"X-Security-Token": credential.securityToken
		},
		body: bodyBuf
	});
	signRequest(req, bodyBuf, {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	const resp = await dispatch(req, bodyBuf, abort);
	const raw = await resp.text().catch(() => "");
	if (!resp.ok) throw new Error(`claim benefit failed: ${resp.status} ${raw.slice(0, 200)}`);
	let json;
	try {
		json = JSON.parse(raw);
	} catch {
		throw new Error(`claim benefit: unexpected non-JSON response: ${raw.slice(0, 200)}`);
	}
	if (json.error_code !== "0000") throw new Error(`claim benefit rejected: ${json.error_code ?? "(no error_code)"} ${json.error_msg ?? ""}`.trim());
}
/**
* 福利中心（活动积分）接口：26.9.901 起应用内「每日签到领 1000 积分」走这套。
*
* host 与积分统计是同一个 snap-access 网关，路径前缀 `/v1/ops`，鉴权头对齐官方客户端
* 的 `Pz()`（`x-auth-token` + `Agent-Type: PromptCenter`），再补上我们直连必须的
* AK/SK 签名。三个实测出来的坑：
*
*  1. bundle 里 URL 有两套变体，带前缀的 `/PromptCenterService/v1/ops/*` 在这个网关上
*     回 **404 APIG.0101（未发布）** —— 只有裸 `/v1/ops/*` 能用；
*  2. 只带 `x-auth-token` 会被拒（`APIG.0301 decrypt token fail`）；
*  3. **业务失败也回 HTTP 200**，成败只看 body 的 `code`（0 才是成功）。
*     今天已领时是 `code:40001 尚未到达权益刷新时间，暂时无法领取`。
*
* 领的是「活动」而不是额度：`/ops/delivery` 给活动清单（含 campaignId / status /
* claimable），`/ops/claim` 按 campaignId 领。`idempotentKey` 上游不返回，官方客户端
* 自己生成随机串（与 `x-snap-traceid` 同一个生成器），按天去重落在服务端。
*/
const EP_OPS_DELIVERY = "/v1/ops/delivery";
const EP_OPS_CLAIM = "/v1/ops/claim";
/** 每日签到活动的 type（实测为 campaignId 1，benefitAmount 1000 CREDIT）。 */
const WELFARE_DAILY_TYPE = "USER_LOGIN";
/** 上游按钮文案的状态机：这几个都表示「今天已经领过了」。 */
const WELFARE_ALREADY_STATES = /* @__PURE__ */ new Set([
	"CLAIMED",
	"CONFIRMED",
	"CONSUMED"
]);
/** 活动状态是不是「今天已经领过了」（区别于「要先登录」「没资格」这些同样不可领的情况）。 */
function isWelfareClaimedStatus(status) {
	return WELFARE_ALREADY_STATES.has(status);
}
/**
* 「今日已领」的业务码。
*
* 这个分支不是冗余的：领取成功后的几十秒里 delivery 有可能还回一份**陈旧**的
* `claimable:true / ELIGIBLE`（实测 2026-10-16，领完立刻读会看到），于是会真的
* POST 第二次 —— 服务端按天去重回这个码，所以按「已领」处理，不能当失败。
*/
const WELFARE_CODE_NOT_YET = 40001;
/** 福利接口的请求：签名 + 官方那套头，返回解析后的 body。 */
async function welfareRequest(url, method, credential, body, signal) {
	const req = new Request(url, {
		method,
		headers: {
			"Content-Type": "application/json",
			"X-Language": "zh-cn",
			"x-snap-traceid": hex32(),
			"x-auth-token": credential.token,
			"Agent-Type": "PromptCenter",
			"X-Security-Token": credential.securityToken
		},
		...body === void 0 ? {} : { body }
	});
	const bodyBuf = Buffer.from(body ?? "");
	if (credential.accessKeyId !== void 0 && credential.secretAccessKey !== void 0) signRequest(req, bodyBuf, {
		accessKeyId: credential.accessKeyId,
		secretAccessKey: credential.secretAccessKey,
		securityToken: credential.securityToken
	});
	let resp;
	try {
		resp = await dispatch(req, body === void 0 ? void 0 : bodyBuf, signal);
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : String(error)
		};
	}
	const text = await resp.text().catch(() => "");
	if (!resp.ok) return {
		ok: false,
		message: `HTTP ${resp.status} ${text.slice(0, 200)}`
	};
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		return {
			ok: false,
			message: `unexpected non-JSON response: ${text.slice(0, 200)}`
		};
	}
	const envelope = asRecord(parsed);
	return {
		ok: true,
		code: typeof envelope.code === "number" ? envelope.code : -1,
		message: firstString(envelope.message),
		data: envelope.data
	};
}
/** 活动清单（`GET /v1/ops/delivery?channel=IDE`）。 */
async function fetchWelfareCampaigns(credential, signal) {
	const resp = await welfareRequest(`${SNAP_HOST}${EP_OPS_DELIVERY}?channel=IDE`, "GET", credential, void 0, signal);
	if (!resp.ok) throw new Error(`welfare delivery: ${resp.message}`);
	return asArray(asRecord(resp.data).items).flatMap((item) => {
		const raw = asRecord(item);
		const campaignId = typeof raw.campaignId === "number" ? raw.campaignId : NaN;
		if (Number.isFinite(campaignId) === false) return [];
		return [{
			campaignId,
			title: firstString(raw.title),
			type: firstString(raw.type),
			amount: typeof raw.benefitAmount === "number" ? raw.benefitAmount : 0,
			unit: firstString(raw.benefitUnit),
			claimable: raw.claimable === true,
			status: firstString(raw.status)
		}];
	});
}
/**
* 从活动清单里挑「每日签到」那条。
*
* 同一个 type 理论上可能有多条（上游换活动的时候），优先挑当前可领的那条。
*/
function pickDailyWelfareCampaign(campaigns) {
	const daily = campaigns.filter((c) => c.type === WELFARE_DAILY_TYPE && c.unit === "CREDIT");
	return daily.find((c) => c.claimable) ?? daily[0];
}
/**
* 领一次每日签到积分。
*
* 不抛异常：这是卡片上一个按钮的后续，失败要变成能显示的文案而不是断掉的请求。
*/
async function claimDailyWelfare(credential, signal) {
	if (credential.accessKeyId === void 0 || credential.secretAccessKey === void 0) return {
		state: "failed",
		amount: 0,
		message: "no AK/SK to sign"
	};
	let campaigns;
	try {
		campaigns = await fetchWelfareCampaigns(credential, signal);
	} catch (error) {
		return {
			state: "failed",
			amount: 0,
			message: error instanceof Error ? error.message : String(error)
		};
	}
	const target = pickDailyWelfareCampaign(campaigns);
	if (target === void 0) return {
		state: "unavailable",
		amount: 0,
		message: "no daily check-in campaign"
	};
	if (!target.claimable) return isWelfareClaimedStatus(target.status) ? {
		state: "already",
		amount: 0,
		message: ""
	} : {
		state: "unavailable",
		amount: 0,
		message: target.status
	};
	const resp = await welfareRequest(`${SNAP_HOST}${EP_OPS_CLAIM}`, "POST", credential, JSON.stringify({
		campaignId: target.campaignId,
		idempotentKey: hex32(),
		channel: "IDE"
	}), signal);
	if (!resp.ok) return {
		state: "failed",
		amount: 0,
		message: resp.message
	};
	if (resp.code === 0) return {
		state: "claimed",
		amount: target.amount,
		message: resp.message
	};
	return {
		state: resp.code === WELFARE_CODE_NOT_YET ? "already" : "failed",
		amount: 0,
		message: resp.message
	};
}
//#endregion
//#region src/discovery.ts
/**
* 动态模型发现：把「已登录账号」变成「当前可用模型清单」。
*
* 为什么要单独一层：模型目录是**按账号**授予的（限时福利尤其如此：A 账号有、
* B 账号没有），而插件对外只暴露一份目录。所以这里逐账号发现、取并集，再把
* 结果提交给全局目录与福利集合。
*
* 失败一律不抛出：拉不到就继续用现有目录（冷启动时是种子清单），把失败原因
* 带回去给 CLI / 日志展示。真正「不可用」的信号是 0 个账号。
*
* @module dsh-codearts-connect/discovery
*/
/**
* 逐账号发现并合并（不改全局状态）。
*
* @param store 账号文档；逐个 `resolve()` 以拿到已续期的签名材料
* @param signal 取消信号（宿主关停时用）
*/
async function discoverModels(store, signal) {
	const ids = await store.ids();
	const accounts = [];
	for (const id of ids) {
		if (signal?.aborted === true) break;
		const summary = (await store.list()).find((account) => account.id === id);
		const label = summary?.label ?? summary?.userName;
		const resolved = await store.resolve(id);
		if (resolved === void 0) {
			accounts.push({
				accountId: id,
				...label === void 0 ? {} : { label },
				ok: false,
				models: [],
				sources: [],
				errors: [{
					source: "agent",
					message: "credential unavailable (sign in again)"
				}]
			});
			continue;
		}
		try {
			const result = await fetchModels(resolved, signal);
			accounts.push({
				accountId: id,
				...label === void 0 ? {} : { label },
				ok: true,
				models: result.models,
				sources: result.sources,
				errors: result.errors
			});
		} catch (error) {
			accounts.push({
				accountId: id,
				...label === void 0 ? {} : { label },
				ok: false,
				models: [],
				sources: [],
				errors: [{
					source: "agent",
					message: error instanceof Error ? error.message : String(error)
				}]
			});
		}
	}
	const ok = accounts.filter((account) => account.ok);
	return {
		models: mergeModelLists(ok.map((account) => account.models)),
		accounts,
		anySucceeded: ok.length > 0
	};
}
/**
* 发现并**提交**到全局目录：目录内容 + 福利集合。
*
* @returns 提交后的目录；没有任何账号成功时返回 `undefined`（调用方保留原目录）
*/
async function refreshCatalog(store, catalog, signal) {
	const outcome = await discoverModels(store, signal);
	if (!outcome.anySucceeded || outcome.models.length === 0) return outcome;
	setDiscoveredBenefitModels(outcome.models.filter((model) => model.benefit === true).map((model) => model.id));
	catalog.set(outcome.models.map((model) => {
		const benefit = isBenefitModel(model.id);
		return {
			...model,
			name: modelDisplayName(model.name, benefit, model.ratio)
		};
	}));
	return outcome;
}
//#endregion
//#region src/usage.ts
/**
* 用量账本：把聊天流里的 usage 帧累计成「今天用了多少」。
*
* 为什么还要自己记：账号总额度有积分接口了（见 credits.ts，2026-10 从官方 Agent
* 客户端挖出并实测通过），但**本机经插件发出的请求**仍需自己累计 —— 上游不按
* 「这台机器」维度给统计。能拿到的真实数据有三样：
*   1. 每个请求的 token `usage`（上游在流末尾回一帧 `{choices:[],usage:{...}}`）；
*   2. 插件自己知道的账号会话槽位占用（见 account-pool：每账号 3 个并发会话）；
*   3. 账号积分/额度（见 credits.ts）。
*
* 所以这里累计的是**本机经插件发出的请求**，与卡片上的积分区块互补 —— 一个是本机
* 级、一个是账号级。官方额度明细在 `codearts.huaweicloud.com/portal/settings/personal-usage`。
*
* 落盘在 `$DSH_HOME/.codearts-usage.json`，按天存，保留最近 `RETENTION_DAYS` 天。
*
* @module dsh-codearts-connect/usage
*/
/** 用量账本路径：与账号文档同一层（`$DSH_HOME` 或 `~/.dsh`）。 */
function codeartsUsagePath(home) {
	const base = home ?? process.env.DSH_HOME ?? join(homedir(), ".dsh");
	return join(base, ".codearts-usage.json");
}
function emptyTotals() {
	return {
		requests: 0,
		promptTokens: 0,
		completionTokens: 0,
		totalTokens: 0
	};
}
function addTotals(into, add) {
	into.requests += add.requests ?? 0;
	into.promptTokens += add.promptTokens ?? 0;
	into.completionTokens += add.completionTokens ?? 0;
	into.totalTokens += add.totalTokens ?? 0;
}
function mergeTotals(into, from) {
	addTotals(into, from);
}
/** 本地日期键 YYYY-MM-DD（不用 toISOString：那是 UTC，会把跨零点的用量算到前一天）。 */
function localDateKey(at = Date.now()) {
	const d = new Date(at);
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function positiveInt(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
/** 从上游 usage 帧里取三个计数字段（缺哪个算 0，total 缺失时用 prompt+completion 兜底）。 */
function normalizeUsage(raw) {
	if (raw === void 0) return {
		promptTokens: 0,
		completionTokens: 0,
		totalTokens: 0
	};
	const promptTokens = positiveInt(raw.prompt_tokens);
	const completionTokens = positiveInt(raw.completion_tokens);
	const total = positiveInt(raw.total_tokens);
	return {
		promptTokens,
		completionTokens,
		totalTokens: total > 0 ? total : promptTokens + completionTokens
	};
}
/**
* 用量账本。
*
* 记账分两步，因为一次请求可能只有其一：
*  - `noteRequest()` 在请求发出时调用（拿不到 usage 的流也要计入请求数）；
*  - `noteUsage()` 在收到 usage 帧时调用（补 token 数）。
*/
var CodeArtsUsageTracker = class {
	days = /* @__PURE__ */ new Map();
	lastAt;
	loaded = false;
	loading;
	saveTimer;
	saving = Promise.resolve();
	path;
	now;
	saveDebounceMs;
	constructor(options = {}) {
		this.path = options.path;
		this.now = options.now ?? (() => Date.now());
		this.saveDebounceMs = options.saveDebounceMs ?? 2e3;
	}
	/** 读账本（懒加载，只读一次）。 */
	async load() {
		this.loading ??= this.readFile();
		return this.loading;
	}
	async readFile() {
		if (this.loaded || this.path === void 0 || !existsSync(this.path)) {
			this.loaded = true;
			return;
		}
		try {
			const raw = await readFile(this.path, "utf8");
			const parsed = JSON.parse(raw);
			if (parsed.version !== 1 || typeof parsed.days !== "object" || parsed.days === null) return;
			for (const [date, day] of Object.entries(parsed.days)) {
				if (typeof day !== "object" || day === null) continue;
				const models = day.models ?? {};
				const accounts = day.accounts ?? {};
				this.days.set(date, {
					models,
					accounts
				});
			}
			this.prune(this.now());
		} catch {
			this.days.clear();
		} finally {
			this.loaded = true;
		}
	}
	day(dateKey) {
		let day = this.days.get(dateKey);
		if (day === void 0) {
			day = {
				models: {},
				accounts: {}
			};
			this.days.set(dateKey, day);
		}
		return day;
	}
	bucket(store, key) {
		let totals = store[key];
		if (totals === void 0) {
			totals = emptyTotals();
			store[key] = totals;
		}
		return totals;
	}
	/** 记一次请求（不等到 usage 帧）。 */
	noteRequest(accountId, model, at = this.now()) {
		const day = this.day(localDateKey(at));
		addTotals(this.bucket(day.models, model), { requests: 1 });
		addTotals(this.bucket(day.accounts, accountId), { requests: 1 });
		this.lastAt = at;
		this.prune(at);
		this.scheduleSave();
	}
	/** 记一次 usage 帧。 */
	noteUsage(accountId, model, raw, at = this.now()) {
		const usage = normalizeUsage(raw);
		if (usage.totalTokens === 0 && usage.promptTokens === 0 && usage.completionTokens === 0) return;
		const day = this.day(localDateKey(at));
		addTotals(this.bucket(day.models, model), usage);
		addTotals(this.bucket(day.accounts, accountId), usage);
		this.lastAt = at;
		this.prune(at);
		this.scheduleSave();
	}
	/** 丢弃保留期之外的天（按日期键比较即可，YYYY-MM-DD 是字典序）。 */
	prune(at) {
		if (this.days.size === 0) return;
		const cutoff = localDateKey(at - 5184e6);
		for (const date of [...this.days.keys()]) if (date < cutoff) this.days.delete(date);
	}
	/** 当前快照（卡片与 CLI 都读它）。 */
	snapshot(at = this.now()) {
		const todayKey = localDateKey(at);
		const today = this.days.get(todayKey);
		const cutoff = localDateKey(at - 2592e6);
		const allTime = emptyTotals();
		const last30 = emptyTotals();
		for (const [date, day] of this.days) for (const totals of Object.values(day.models)) {
			mergeTotals(allTime, totals);
			if (date >= cutoff) mergeTotals(last30, totals);
		}
		const models = today?.models ?? {};
		return {
			today: {
				...emptyTotals(),
				...today === void 0 ? {} : sumOf(models)
			},
			allTime,
			last30,
			byModelToday: Object.entries(models).map(([id, totals]) => ({
				id,
				totals: { ...totals }
			})).sort((a, b) => b.totals.totalTokens - a.totals.totalTokens || (a.id < b.id ? -1 : 1)),
			byAccountToday: Object.fromEntries(Object.entries(today?.accounts ?? {}).map(([id, totals]) => [id, { ...totals }])),
			days: this.days.size,
			...this.lastAt === void 0 ? {} : { lastAt: this.lastAt }
		};
	}
	scheduleSave() {
		if (this.path === void 0) return;
		if (this.saveTimer !== void 0) return;
		this.saveTimer = setTimeout(() => {
			this.saveTimer = void 0;
			this.save();
		}, this.saveDebounceMs);
		this.saveTimer.unref?.();
	}
	/** 立即落盘（关停时调用，别丢最后几秒的账）。 */
	async flush() {
		if (this.saveTimer !== void 0) {
			clearTimeout(this.saveTimer);
			this.saveTimer = void 0;
		}
		await this.save();
	}
	save() {
		if (this.path === void 0) return Promise.resolve();
		const doc = {
			version: 1,
			days: Object.fromEntries(this.days)
		};
		this.saving = this.saving.then(() => writeJsonAtomic(this.path, doc), () => writeJsonAtomic(this.path, doc));
		return this.saving;
	}
};
/** 一批桶的合计。 */
function sumOf(store) {
	const out = emptyTotals();
	for (const totals of Object.values(store)) mergeTotals(out, totals);
	return out;
}
//#endregion
export { CodeArtsCatalog as A, isImageBridgeEnabled as B, isWelfareClaimedStatus as C, rateLimitFrame as D, prepareChatBody as E, filterEnabledModels as F, MANUAL_ACCOUNT_ID as G, setImageBridgeEnabled as H, imageBlockedModels as I, startLogin as J, codeartsAccountsPath as K, isBenefitBlocked as L, clearBenefitBlocked as M, clearImageBlocked as N, signedGet as O, creditRatioLabel as P, isBenefitModel as R, isTpmLimit as S, pickDailyWelfareCampaign as T, CodeArtsAccountStore as U, markImageBlocked as V, CodeArtsCredentialStore as W, fetchWelfareCampaigns as _, DEFAULT_IMAGE_BRIDGE_MODEL as a, isParamInvalidFrame as b, bridgeImages as c, claimDailyWelfare as d, clearQueueStatus as f, fetchQueueStatus as g, fetchModels as h, refreshCatalog as i, FALLBACK_CODEARTS_MODELS as j, upstreamErrorMessage as k, canonicalModel as l, fetchCallerIdentity as m, codeartsUsagePath as n, IMAGE_UNSUPPORTED_MESSAGE as o, degradeTokenCeiling as p, codeartsAuthPath as q, discoverModels as r, SNAP_HOST as s, CodeArtsUsageTracker as t, chatStream as u, isConcurrencyCap as v, maxTokensCeilingFor as w, isQueueableRate as x, isNotMultimodal as y, isImageBlocked as z };
