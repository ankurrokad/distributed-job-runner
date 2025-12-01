import { BaseConsumer } from "./consumer.base";

export class ConsumerRegistrar {
  private list: BaseConsumer[] = [];

  register(c: BaseConsumer) {
    this.list.push(c);
  }

  async startAll() {
    return Promise.all(this.list.map((c) => c.start()));
  }

  async closeAll() {
    return Promise.all(this.list.map((c) => c.close().catch(() => null)));
  }
}

