"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultQueue = void 0;
exports.createQueue = createQueue;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.defaultQueue = new bullmq_1.Queue('default', { connection: connection_1.connection });
// Export queue factory for creating named queues
function createQueue(name) {
    return new bullmq_1.Queue(name, { connection: connection_1.connection });
}
//# sourceMappingURL=queues.js.map