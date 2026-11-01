import { n as __exportAll } from "./rolldown-runtime-B4iAMlE-.mjs";
//#region node_modules/.pnpm/@earendil-works+pi-ai@1.3.0_05ce1760060b7c83464e6bbdb41c0e3a/node_modules/@earendil-works/pi-ai/dist/utils/text.js
/** Extract and join text from message content. */
function contentText(content, separator = "\n") {
	if (typeof content === "string") return content;
	return content.filter((block) => block.type === "text").map((block) => block.text).join(separator);
}
/** Render a system message as a complete prompt: its content followed by its sections. */
function getSystemMessageText(message) {
	const parts = [contentText(message.content)];
	for (const text of Object.values(message.sections ?? {})) if (text !== null) parts.push(text);
	return parts.filter((part) => part.length > 0).join("\n\n");
}
/**
* Render a later system message for APIs that accept system messages mid-conversation.
* Section changes are framed by name so the model can relate them to the leading prompt.
* This framing is request-time only and may change between versions.
*/
function renderSystemMessageUpdate(message) {
	const parts = [];
	const text = contentText(message.content);
	if (text.length > 0) parts.push(text);
	for (const [name, value] of Object.entries(message.sections ?? {})) parts.push(value === null ? `Removed system prompt section "${name}".` : `Updated system prompt section "${name}":\n\n${value}`);
	return parts.join("\n\n");
}
//#endregion
//#region node_modules/.pnpm/@earendil-works+pi-ai@1.3.0_05ce1760060b7c83464e6bbdb41c0e3a/node_modules/@earendil-works/pi-ai/dist/utils/estimate.js
var estimate_exports = /* @__PURE__ */ __exportAll({
	calculateContextTokens: () => calculateContextTokens,
	estimateContextTokens: () => estimateContextTokens,
	estimateMessageTokens: () => estimateMessageTokens,
	estimateTextAndImageContentTokens: () => estimateTextAndImageContentTokens,
	estimateTextTokens: () => estimateTextTokens
});
const CHARS_PER_TOKEN = 3.5;
const ESTIMATED_IMAGE_CHARS = 4800;
function calculateContextTokens(usage) {
	return usage.totalTokens || usage.input + usage.output + usage.cacheRead + usage.cacheWrite;
}
function safeJsonStringify(value) {
	try {
		return JSON.stringify(value) ?? "undefined";
	} catch {
		return "[unserializable]";
	}
}
function estimateTextAndImageContentChars(content) {
	if (typeof content === "string") return content.length;
	let chars = 0;
	for (const block of content) chars += block.type === "text" ? block.text.length : ESTIMATED_IMAGE_CHARS;
	return chars;
}
function estimateTextTokens(text) {
	return Math.ceil(text.length / CHARS_PER_TOKEN);
}
function estimateTextAndImageContentTokens(content) {
	return Math.ceil(estimateTextAndImageContentChars(content) / CHARS_PER_TOKEN);
}
function estimateMessageTokens(message) {
	let chars = 0;
	if (message.role === "system") return estimateTextTokens(getSystemMessageText(message)) + estimateToolsTokens(message.toolsAdded) + estimateToolsTokens(message.toolsRemoved);
	if (message.role === "user") return estimateTextAndImageContentTokens(message.content);
	if (message.role === "toolResult") return estimateTextAndImageContentTokens(message.content);
	for (const block of message.content) if (block.type === "text") chars += block.text.length;
	else if (block.type === "thinking") chars += block.thinking.length;
	else chars += block.name.length + safeJsonStringify(block.arguments).length;
	return Math.ceil(chars / CHARS_PER_TOKEN);
}
function getLastAssistantUsageInfo(messages) {
	let latestPrefixTimestamp = Number.NEGATIVE_INFINITY;
	let usageInfo;
	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];
		if (message.role === "assistant") {
			const assistant = message;
			if (assistant.timestamp >= latestPrefixTimestamp && assistant.stopReason !== "aborted" && assistant.stopReason !== "error" && calculateContextTokens(assistant.usage) > 0) usageInfo = {
				usage: assistant.usage,
				index: i
			};
		}
		latestPrefixTimestamp = Math.max(latestPrefixTimestamp, message.timestamp);
	}
	return usageInfo;
}
function estimateContextTokens(context) {
	const messages = "messages" in context ? context.messages : context;
	const usageInfo = getLastAssistantUsageInfo(messages);
	if (usageInfo) {
		const usageTokens = calculateContextTokens(usageInfo.usage);
		let trailingTokens = 0;
		for (let i = usageInfo.index + 1; i < messages.length; i++) trailingTokens += estimateMessageTokens(messages[i]);
		return {
			tokens: usageTokens + trailingTokens,
			usageTokens,
			trailingTokens,
			lastUsageIndex: usageInfo.index
		};
	}
	let tokens = 0;
	for (const message of messages) tokens += estimateMessageTokens(message);
	return {
		tokens,
		usageTokens: 0,
		trailingTokens: tokens,
		lastUsageIndex: null
	};
}
function estimateToolsTokens(tools) {
	if (!tools || tools.length === 0) return 0;
	return estimateTextTokens(safeJsonStringify(tools));
}
//#endregion
export { renderSystemMessageUpdate as a, getSystemMessageText as i, estimate_exports as n, contentText as r, estimateContextTokens as t };
