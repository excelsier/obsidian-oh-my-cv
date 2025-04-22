/**
 * Unit tests for the Settings Service
 */
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
    settingsService = new SettingsService(plugin);
  });

  test('should initialize with default settings', async () => {
    // Setup
    (plugin.loadData as jest.Mock).mockResolvedValue(null);
    
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
    (plugin.loadData as jest.Mock).mockResolvedValue(customSettings);
    
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

  test('should manage templates correctly', () => {
    // Setup
    settingsService.updateSettings({
      ...DEFAULT_SETTINGS,
      templates: [
        { id: 'template1', name: 'Template 1', content: '# Template 1 Content' },
      ],
    });
    
    // Execute & Verify
    expect(settingsService.getTemplates()).toHaveLength(1);
    
    // Add a new template
    settingsService.addTemplate({
      id: 'template2',
      name: 'Template 2',
      content: '# Template 2 Content',
      description: 'Test template description'
    } as CVTemplate);
    
    // Verify templates were updated
    expect(settingsService.getTemplates()).toHaveLength(2);
    expect(settingsService.getTemplateById('template2')).toEqual({
      id: 'template2',
      name: 'Template 2',
      content: '# Template 2 Content',
    });
    
    // Remove a template
    const settings = settingsService.getSettings();
    settingsService.updateSettings({
      ...settings,
      templates: settings.templates.filter(t => t.id !== 'template1')
    });
    
    // Verify template was removed
    expect(settingsService.getTemplates()).toHaveLength(1);
    expect(settingsService.getTemplateById('template1')).toBeUndefined();
  });
});
