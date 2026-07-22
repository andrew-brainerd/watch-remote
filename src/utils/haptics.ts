import { impactFeedback, notificationFeedback } from '@tauri-apps/plugin-haptics';
import { isMobile } from '@/utils/platform';

// The plugin is only registered on mobile, so invoking it on desktop would throw.
const guard = (run: () => Promise<unknown>) => {
  if (!isMobile) return;
  void run().catch(() => {});
};

export const tapFeedback = () => guard(() => impactFeedback('light'));

export const successFeedback = () => guard(() => notificationFeedback('success'));

export const errorFeedback = () => guard(() => notificationFeedback('error'));
