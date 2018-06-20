import { EventEmitter, Injectable } from "@angular/core";

@Injectable()
export class AppService {
  public eventTriggered: EventEmitter<string> = new EventEmitter();

  constructor() {
  }

  sendInstruction(req: string) {
    this.eventTriggered.emit(req);
  }
}
