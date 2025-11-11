type AnyRecord = Record<string, any>;

declare const wx: {
  request(options: AnyRecord): any;
  setStorageSync(key: string, data: unknown): void;
  getStorageSync<T = unknown>(key: string): T;
  removeStorageSync(key: string): void;
  showToast(options: AnyRecord): void;
  navigateTo(options: AnyRecord): any;
  switchTab(options: AnyRecord): any;
  login(options: AnyRecord): any;
  cloud?: AnyRecord;
  [key: string]: any;
};

declare function App(options: AnyRecord): void;

type DataDefinition = Record<string, any>;

interface PageInstance<D extends DataDefinition = DataDefinition> extends AnyRecord {
  data: D;
  setData(data: Partial<D>): void;
}

interface PageOptions<D extends DataDefinition = DataDefinition> extends AnyRecord {
  data: D;
  onLoad?: (...args: any[]) => void;
  onShow?: (...args: any[]) => void;
  onHide?: (...args: any[]) => void;
  onUnload?: (...args: any[]) => void;
}

declare function Page<D extends DataDefinition>(options: PageOptions<D> & ThisType<PageInstance<D>>): void;

declare namespace WechatMiniprogram {
  interface BaseEvent {
    detail: AnyRecord;
    currentTarget?: { dataset?: AnyRecord };
    target?: { dataset?: AnyRecord };
  }

  interface Input extends BaseEvent {
    detail: { value: string };
  }

  interface PickerChange extends BaseEvent {
    detail: { value: number | string | string[] };
  }
}
