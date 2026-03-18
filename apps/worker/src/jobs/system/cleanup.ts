import { task, schedules } from '@trigger.dev/sdk/v3';

export const cleanupTask = task({
  id: 'system.cleanup',
  run: async () => {
    // TODO: Clean up expired sessions, stale runs, old logs
    return { cleaned: true };
  },
});

// Run daily at 3 AM UTC
export const cleanupSchedule = schedules.task({
  id: 'system.cleanup-schedule',
  cron: '0 3 * * *',
  run: async () => {
    await cleanupTask.trigger({});
  },
});
