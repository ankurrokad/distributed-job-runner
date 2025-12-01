export const PREFIX = "djr:queue";

export function workflowQueueName(workflowType: string) {
  return `${PREFIX}:workflow:${workflowType}`;
}

