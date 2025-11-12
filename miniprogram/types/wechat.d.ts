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
  stopPullDownRefresh(): void;
  previewImage(options: { urls: string[]; current?: string }): void;
  getSystemInfoSync(): { pixelRatio?: number } & AnyRecord;
  getWindowInfo?(): { pixelRatio?: number } & AnyRecord;
  createSelectorQuery(): WechatMiniprogram.SelectorQuery;
  canvasToTempFilePath(
    options: { canvas: WechatMiniprogram.Canvas; success?: (res: { tempFilePath: string }) => void; fail?: (...args: any[]) => void },
    component?: AnyRecord,
  ): void;
  cloud?: AnyRecord;
  [key: string]: any;
};

declare function App(options: AnyRecord): void;
declare function getApp<T = AnyRecord>(): T;

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

  interface TouchEvent extends BaseEvent {}

  interface SelectorQuery {
    in(component: AnyRecord | null): SelectorQuery;
    select(selector: string): SelectorQuery;
    fields(
      options: { node?: boolean; size?: boolean; rect?: boolean },
      callback?: (result: AnyRecord | null) => void,
    ): SelectorQuery;
    exec(callback: (result: AnyRecord[]) => void): void;
  }

  interface CanvasGradient {
    addColorStop(stop: number, color: string): void;
  }

  namespace CanvasRenderingContext {
    interface CanvasRenderingContext2D {
      fillStyle: string | CanvasGradient;
      font: string;
      scale(x: number, y: number): void;
      fill(): void;
      beginPath(): void;
      closePath(): void;
      moveTo(x: number, y: number): void;
      lineTo(x: number, y: number): void;
      quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
      createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
      fillText(text: string, x: number, y: number, maxWidth?: number): void;
    }
  }

  interface Canvas {
    width: number;
    height: number;
    getContext(type: '2d'): CanvasRenderingContext.CanvasRenderingContext2D;
  }
}
