/**
 * Plugin instance reference to avoid circular dependencies
 */

import OhMyCVPlugin from '../main';

// Global reference to the plugin instance
let pluginInstance: OhMyCVPlugin | null = null;

/**
 * Set the plugin instance for global access
 * @param plugin The plugin instance
 */
export function setPluginInstance(plugin: OhMyCVPlugin): void {
  pluginInstance = plugin;
}

/**
 * Get the plugin instance
 * @returns The plugin instance
 */
export function getPluginInstance(): OhMyCVPlugin {
  if (!pluginInstance) {
    throw new Error('Plugin instance not set');
  }
  return pluginInstance;
}
