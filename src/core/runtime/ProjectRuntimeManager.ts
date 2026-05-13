/**
 * Project Runtime Manager
 *
 * OWNERSHIP: Runtime lifecycle orchestration
 * PERSISTENCE: Non-persistent (ephemeral runtime resources)
 * MUTABILITY: Manages lifecycle, doesn't own domain state
 *
 * Phase 2: Disposable ProjectSession architecture.
 *
 * Centralized orchestration point for project-scoped runtime lifecycle.
 * Now delegates to ProjectSession for explicit ownership boundaries.
 *
 * Responsibilities:
 * - Create/dispose ProjectSession on project switch
 * - Provide access to active session
 * - Report runtime health status
 *
 * Does NOT:
 * - Own timeline data (timelineStore owns that)
 * - Mutate timeline state (only consumes it for playback/render)
 * - Persist anything (all resources are ephemeral)
 *
 * Architecture principle:
 * Runtime resources (playback clock, scheduler, decoders, GPU contexts)
 * are session-scoped and disposed atomically on project close.
 * Domain state (timeline) outlives runtime and is managed separately.
 *
 * Migration from Phase 1:
 * - Phase 1: Manual reset functions (resetPlaybackClock, resetTimelineStore, etc.)
 * - Phase 2: Disposable ProjectSession container (session.dispose())
 */

import { createProjectSession, disposeActiveSession, getActiveSession, getActiveSessionOrNull } from "./ProjectSession";

/**
 * Initialize project runtime.
 * Creates and activates new ProjectSession for the project.
 *
 * Phase 2: Delegates to ProjectSession.
 */
export async function initializeProjectRuntime(projectId: string): Promise<void> {
  
  await createProjectSession(projectId);
}

/**
 * Dispose project runtime.
 * Disposes active ProjectSession and all owned subsystems.
 *
 * Phase 2: Delegates to ProjectSession.
 * Session handles deterministic teardown order internally.
 */
export async function disposeProjectRuntime(): Promise<void> {
  const session = getActiveSessionOrNull();
  if (session) {
    
    await disposeActiveSession();
  } else {
    
  }
}

/**
 * Switch project runtime.
 * Disposes current session and creates new one.
 *
 * Phase 2: Atomic session switch.
 */
export async function switchProjectRuntime(newProjectId: string): Promise<void> {
  
  await disposeProjectRuntime();
  await initializeProjectRuntime(newProjectId);
}

/**
 * Get active project session.
 * Throws if no session is active.
 */
export function getProjectSession() {
  return getActiveSession();
}

/**
 * Get runtime health status (for debugging).
 * Reports on session state, leaked resources, and subsystem health.
 */
export function getRuntimeHealthStatus() {
  const session = getActiveSessionOrNull();
  if (!session) {
    return {
      hasActiveSession: false,
      sessionId: null,
      projectId: null,
      state: null,
      playbackState: null,
      pendingJobs: 0,
      videoElements: 0,
      asyncTasks: 0,
      rafLoops: 0,
    };
  }

  const health = session.getHealthStatus();
  return {
    hasActiveSession: true,
    ...health,
  };
}
