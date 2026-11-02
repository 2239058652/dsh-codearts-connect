import { Context } from "@deepseek-ai/cordis";
//#region src/client/locales.d.ts
interface CodeArtsSettingsKey {
  tabLabel: string;
  tabsLabel: string;
  tabAccounts: string;
  tabModels: string;
  tabUsage: string;
  cardTitle: string;
  statusSignedIn: string;
  statusSignedOut: string;
  statusExpired: string;
  descSignedIn: string;
  descSignedOut: string;
  storedMeta: string;
  storedMetaNoLabel: string;
  refresh: string;
  clearToken: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  labelLabel: string;
  labelPlaceholder: string;
  saveToken: string;
  expiredHint: string;
  accountsTitle: string;
  accountRemove: string;
  addAccount: string;
  pasteTokenAdd: string;
  accountsRotateHint: string;
  accountUse: string;
  accountInUse: string;
  accountPinnedHint: string;
  accountAuto: string;
  accountPreferenceFailed: string;
  accountNeedsSignIn: string;
  accountNoKey: string;
  accountStored: string;
  accountExpires: string;
  accountExpired: string;
  modelsTitle: string;
  optionalModelsHint: string;
  optionalModelsAllHint: string;
  selectedCount: string;
  selectAll: string;
  benefit: string;
  benefitBlocked: string;
  benefitBlockedHint: string;
  modelImages: string;
  modelImagesBridge: string;
  refreshModels: string;
  refreshing: string;
  refreshed: string;
  refreshStale: string;
  refreshFailed: string;
  saveModels: string;
  saving: string;
  saved: string;
  signIn: string;
  signingIn: string;
  openManually: string;
  addAccountDialogTitle: string;
  addAccountDialogHint: string;
  addAccountDialogCopy: string;
  addAccountDialogCopied: string;
  addAccountDialogCopyFailed: string;
  addAccountDialogWaiting: string;
  addAccountDialogClose: string;
  manualToken: string;
  loginFailed: string;
  modelsLoading: string;
  usageTitle: string;
  usageToday: string;
  usageTodayTotal: string;
  usageLast30: string;
  usageByAccount: string;
  usageRequests: string;
  usageRequestCount: string;
  usageTokens: string;
  usageAllTime: string;
  usageByModel: string;
  usageSlots: string;
  usageStateOk: string;
  usageStateCapped: string;
  usageStateCooling: string;
  usageStateDisabled: string;
  usageNoQuota: string;
  usageEmpty: string;
  creditsUnit: string;
  creditsUsed: string;
  creditsUsedOfTotal: string;
  creditsTotal: string;
  creditsExpiringShort: string;
  creditsUpdated: string;
  creditsReset: string;
  creditsDetailLink: string;
  creditsTokensToday: string;
  creditsTokensBalance: string;
  creditsUnavailable: string;
  creditsNeedSignIn: string;
  creditsDock: string;
  creditsDockTitle: string;
  creditsDockPanelTitle: string;
  creditsDockCurrentAccount: string;
  creditsDockCurrentAuto: string;
  creditsDockSwitchHint: string;
  creditsDockAuto: string;
  creditsDockSwitchFailed: string;
  creditsDockLastAccount: string;
  creditsDockFallback: string;
  imageBridgeToggle: string;
  imageBridgeNotWritable: string;
  imageBridgeFailed: string;
  creditsDockRefresh: string;
  creditsDockRefreshing: string;
  creditsDockColAccount: string;
  creditsDockColBalance: string;
  creditsDockEmpty: string;
  creditsDockExpiring: string;
  creditsDockUpdated: string;
  dockProvider: string;
  dockModel: string;
  dockNoModel: string;
  tabDisplay: string;
  displayTitle: string;
  displayHint: string;
  displayCreditsToggle: string;
  displayQueueToggle: string;
  displayNotWritable: string;
  displayFailed: string;
  queueDock: string;
  queueDockTitle: string;
  claimButton: string;
  claimButtonDone: string;
  claimPending: string;
  claimAll: string;
  claimHint: string;
  claimDone: string;
  claimAlready: string;
  claimUnavailable: string;
  claimFailed: string;
  [key: string]: string;
}
//#endregion
//#region src/client/index.d.ts
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.codearts': CodeArtsSettingsKey;
  }
  /**
   * rc.2 宿主把插件配置页挂在 plugins.bundle.config（按 bundle 包名取 key）。
   * 这个槽位只在宿主运行时声明 —— 连 0.2.0-rc.2 的 settings-plugins 类型里都没有
   * （它导出的槽位是 settings.plugins.tab / settings.general.item 那一组），
   * 所以只能我们自己补，让类型跟运行时的真槽位对上。
   */
  interface SlotMap {
    'plugins.bundle.config': {
      kind: 'keyed';
      scope: 'root';
      owner: {
        children?: never;
      };
    };
  }
}
declare const name = "dsh-codearts-connect-client";
declare const inject: string[];
declare function apply(ctx: Context): void;
//#endregion
export { apply, inject, name };