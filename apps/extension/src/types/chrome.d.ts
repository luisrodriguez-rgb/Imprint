declare namespace chrome {
  export namespace runtime {
    export const lastError: { message?: string } | undefined;
    export function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
    };
  }

  export namespace storage {
    export interface StorageArea {
      get(
        keys: string | string[] | Record<string, any> | null,
        callback: (items: { [key: string]: any }) => void
      ): void;
      set(items: { [key: string]: any }, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;
    }
    export const local: StorageArea;
    export const sync: StorageArea;
  }

  export namespace action {
    export function setBadgeText(details: { text: string; tabId?: number }): void;
    export function setBadgeBackgroundColor(details: {
      color: string | [number, number, number, number];
      tabId?: number;
    }): void;
  }
}
