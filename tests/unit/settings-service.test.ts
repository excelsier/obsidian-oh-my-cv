/**
 * Unit tests for the Settings Service
 */
import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { SettingsService } from '../../src/services/settings-service';
import { CVTemplate } from '../../src/core/types';
import { App, Plugin } from '../mocks/obsidian';
import { DEFAULT_SETTINGS } from '../../src/core/constants';
import { OhMyCVSettings } from '../../src/core/types';

describe('SettingsService', () => {
  let app: App;
  let plugin: Plugin;
  let settingsService: SettingsService;

  beforeEach(() => {
    // Setup mocks
    app = new App();
    plugin = new Plugin(app, { id: 'obsidian-oh-my-cv' });
    // Create a properly typed mock for loadData
    plugin.loadData = jest.fn<() => Promise<OhMyCVSettings | null>>().mockResolvedValue(null);
    settingsService = new SettingsService(plugin);
  });

  test('should initialize with default settings', async () => {
    // Setup - loadData returns null, so defaults will be used
    
    // Execute
    await settingsService.loadSettings();
    
    // Verify
    expect(settingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test('should save settings correctly', async () => {
    // Setup
    const testSettings: OhMyCVSettings = {
      ...DEFAULT_SETTINGS,
      defaultPageSize: 'LETTER',
      defaultThemeColor: '#FF0000',
    };
    
    // Execute
    settingsService.updateSettings(testSettings);
    await settingsService.saveSettings();
    
    // Verify
    expect(plugin.saveData).toHaveBeenCalledWith(testSettings);
  });

  test('should load custom settings from storage', async () => {
    // Setup
    const customSettings: OhMyCVSettings = {
      ...DEFAULT_SETTINGS,
      defaultPageSize: 'LETTER',
      defaultMargins: { top: 20, right: 20, bottom: 20, left: 20 },
    };
    // Reset the mock to return custom settings
    plugin.loadData = jest.fn<() => Promise<OhMyCVSettings>>().mockResolvedValue(customSettings);
    
    // Execute
    await settingsService.loadSettings();
    
    // Verify
    expect(settingsService.getSettings()).toEqual(customSettings);
  });

  test('should merge partial settings updates', () => {
    // Setup
    const initialSettings = { ...DEFAULT_SETTINGS };
    settingsService.updateSettings(initialSettings);
    
    // Execute
    settingsService.updateSettings({
      defaultThemeColor: '#00FF00',
    });
    
    // Verify
    const updatedSettings = settingsService.getSettings();
    expect(updatedSettings.defaultThemeColor).toBe('#00FF00');
    expect(updatedSettings.defaultPageSize).toBe(DEFAULT_SETTINGS.defaultPageSize);
  });

  test('should get and update individual settings', () => {
    // Setup
    settingsService.updateSettings(DEFAULT_SETTINGS);
    const currentSettings = settingsService.getSettings();
    
    // Execute & Verify
    expect(currentSettings.defaultPageSize).toBe(DEFAULT_SETTINGS.defaultPageSize);
    
    // Update a setting
    settingsService.updateSettings({
      ...currentSettings,
      defaultPageSize: 'LETTER'
    });
    
    // Verify the update
    expect(settingsService.getSettings().defaultPageSize).toBe('LETTER');
  });

  test('should manage templates correctly', async () => {
    // Get the current number of templates (includes default templates)
    const initialTemplateCount = settingsService.getTemplates().length;
    
    // Add a new template
    settingsService.addTemplate({
      id: 'template2',
      name: 'Template 2',
      content: '# Template 2 Content',
      description: 'Test template description'
    } as CVTemplate);
    
    // Verify templates were updated (count should increase by 1)
    expect(settingsService.getTemplates()).toHaveLength(initialTemplateCount + 1);
    
    // Verify the new template exists
    const template = settingsService.getTemplateById('template2');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Template 2');
    expect(template?.content).toBe('# Template 2 Content');
    
    // Delete the template we added
    await settingsService.deleteTemplate('template2');
    
    // Verify we're back to the initial count
    expect(settingsService.getTemplates()).toHaveLength(initialTemplateCount);
  });
});
