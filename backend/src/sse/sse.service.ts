import { Injectable } from "@nestjs/common";
import { EventEmitter } from "events";
import { Observable } from "rxjs";

@Injectable()
export class SseService {
  private emitter = new EventEmitter();

  emit(event: string, scriptId: string, data: any) {
    this.emitter.emit(`${scriptId}:${event}`, data);
  }

  subscribe(scriptId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const onToken = (data: any) => {
        subscriber.next({ type: "token", data: JSON.stringify(data) } as any);
      };
      const onProgress = (data: any) => {
        subscriber.next({
          type: "progress",
          data: JSON.stringify(data),
        } as any);
      };
      const onComplete = (data: any) => {
        subscriber.next({
          type: "complete",
          data: JSON.stringify(data),
        } as any);
        subscriber.complete();
      };
      const onError = (data: any) => {
        subscriber.next({ type: "error", data: JSON.stringify(data) } as any);
        subscriber.complete();
      };

      this.emitter.on(`${scriptId}:token`, onToken);
      this.emitter.on(`${scriptId}:progress`, onProgress);
      this.emitter.on(`${scriptId}:complete`, onComplete);
      this.emitter.on(`${scriptId}:error`, onError);

      return () => {
        this.emitter.off(`${scriptId}:token`, onToken);
        this.emitter.off(`${scriptId}:progress`, onProgress);
        this.emitter.off(`${scriptId}:complete`, onComplete);
        this.emitter.off(`${scriptId}:error`, onError);
      };
    });
  }
}
