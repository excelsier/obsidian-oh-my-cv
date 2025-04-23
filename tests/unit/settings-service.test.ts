/**
 * Unit tests for the Settings Service
 */
import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { SettingsService } from '../../src/services/settings-service';
import { CVTemplate, CVTemplateStyle, PDFExportOptions } from '../../src/core/types';
import { App, Plugin } from '../mocks/obsidian';
import { DEFAULT_SETTINGS } from '../../src/core/constants';
import { OhMyCVSettings } from '../../src/core/types';
import { DEFAULT_TEMPLATES } from '../../src/core/templates';

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
    plugin.saveData = jest.fn<(data: any) => Promise<void>>().mockResolvedValue();
    // Add data property to mock plugin for tests
    (plugin as any).data = {};
    settingsService = new SettingsService(plugin);
  });

  // Base Settings Tests
  describe('Basic Settings Operations', () => {
    test('should initialize with default settings', async () => {
      await settingsService.loadSettings();
      expect(settingsService.getSettings()).toEqual(DEFAULT_SETTINGS);
    });

    test('should save settings correctly', async () => {
      const testSettings: OhMyCVSettings = {
        ...DEFAULT_SETTINGS,
        defaultPageSize: 'LETTER',
        defaultThemeColor: '#FF0000',
      };
      
      settingsService.updateSettings(testSettings);
      await settingsService.saveSettings();
      
      expect(plugin.saveData).toHaveBeenCalledWith(testSettings);
    });

    test('should load custom settings from storage', async () => {
      const customSettings: OhMyCVSettings = {
        ...DEFAULT_SETTINGS,
        defaultPageSize: 'LETTER',
        defaultMargins: { top: 20, right: 20, bottom: 20, left: 20 },
      };
      // Reset the mock to return custom settings
      plugin.loadData = jest.fn<() => Promise<OhMyCVSettings>>().mockResolvedValue(customSettings);
      
      await settingsService.loadSettings();
      
      expect(settingsService.getSettings()).toEqual(customSettings);
    });

    test('should merge partial settings updates', async () => {
      await settingsService.loadSettings();
      
      await settingsService.updateSettings({
        defaultThemeColor: '#00FF00',
      });
      
      const updatedSettings = settingsService.getSettings();
      expect(updatedSettings.defaultThemeColor).toBe('#00FF00');
      expect(updatedSettings.defaultPageSize).toBe(DEFAULT_SETTINGS.defaultPageSize);
      expect(plugin.saveData).toHaveBeenCalled();
    });
  });
  
  // Specific Settings Tests
  describe('Specific Settings Getters and Setters', () => {
    beforeEach(async () => {
      await settingsService.loadSettings();
    });
    
    test('should handle page size settings', async () => {
      expect(settingsService.getDefaultPageSize()).toBe(DEFAULT_SETTINGS.defaultPageSize);
      
      await settingsService.setDefaultPageSize('LETTER');
      
      expect(settingsService.getDefaultPageSize()).toBe('LETTER');
      expect(plugin.saveData).toHaveBeenCalled();
    });
    
    test('should handle margins settings', async () => {
      const defaultMargins = settingsService.getDefaultMargins();
      expect(defaultMargins).toEqual(DEFAULT_SETTINGS.defaultMargins);
      
      const newMargins = { top: 25, right: 25, bottom: 25, left: 25 };
      await settingsService.setDefaultMargins(newMargins);
      
      expect(settingsService.getDefaultMargins()).toEqual(newMargins);
      expect(plugin.saveData).toHaveBeenCalled();
    });
    
    test('should handle theme color settings', async () => {
      expect(settingsService.getDefaultThemeColor()).toBe(DEFAULT_SETTINGS.defaultThemeColor);
      
      await settingsService.setDefaultThemeColor('#FF5500');
      
      expect(settingsService.getDefaultThemeColor()).toBe('#FF5500');
      expect(plugin.saveData).toHaveBeenCalled();
    });
    
    test('should handle font family settings', async () => {
      expect(settingsService.getDefaultFontFamily()).toBe(DEFAULT_SETTINGS.defaultFontFamily);
      
      await settingsService.setDefaultFontFamily('Arial');
      
      expect(settingsService.getDefaultFontFamily()).toBe('Arial');
      expect(plugin.saveData).toHaveBeenCalled();
    });
    
    test('should handle recently used fonts', async () => {
      // Initially has default fonts from DEFAULT_SETTINGS
      const initialFonts = settingsService.getRecentlyUsedFonts();
      expect(initialFonts).toEqual(DEFAULT_SETTINGS.recentlyUsedFonts);
      
      // Add a new font not in the defaults
      await settingsService.addRecentlyUsedFont('Arial');
      expect(settingsService.getRecentlyUsedFonts()[0]).toBe('Arial');
      
      // When adding a font that already exists, it should move to front
      const existingFont = DEFAULT_SETTINGS.recentlyUsedFonts[2]; // e.g. 'Open Sans'
      await settingsService.addRecentlyUsedFont(existingFont);
      expect(settingsService.getRecentlyUsedFonts()[0]).toBe(existingFont);
      expect(settingsService.getRecentlyUsedFonts()[1]).toBe('Arial');
      
      // Reset the fonts for other tests
      settingsService.updateSettings({ recentlyUsedFonts: [...DEFAULT_SETTINGS.recentlyUsedFonts] });
      
      // Test limit of 10 fonts
      for (let i = 1; i <= 10; i++) {
        await settingsService.addRecentlyUsedFont(`Font ${i}`);
      }
      expect(settingsService.getRecentlyUsedFonts().length).toBe(10);
      expect(settingsService.getRecentlyUsedFonts()[0]).toBe('Font 10');
    });
    
    test('should handle feature flags', () => {
      // Test auto-casing
      settingsService.updateSettings({ autoCasing: true });
      expect(settingsService.isAutoCasingEnabled()).toBe(true);
      
      settingsService.updateSettings({ autoCasing: false });
      expect(settingsService.isAutoCasingEnabled()).toBe(false);
      
      // Test TeX support
      settingsService.updateSettings({ texSupport: true });
      expect(settingsService.isTeXSupportEnabled()).toBe(true);
      
      // Test page breaks
      settingsService.updateSettings({ showPageBreaks: true });
      expect(settingsService.isPageBreaksEnabled()).toBe(true);
      
      // Test icon support
      settingsService.updateSettings({ iconSupport: true });
      expect(settingsService.isIconSupportEnabled()).toBe(true);
      
      // Test custom CSS
      settingsService.updateSettings({ enableCustomCss: true });
      expect(settingsService.isCustomCssEnabled()).toBe(true);
    });
    
    test('should handle custom CSS content', async () => {
      const customCss = '.custom-style { color: red; }';
      await settingsService.updateSettings({ defaultCustomCss: customCss });
      expect(settingsService.getDefaultCustomCss()).toBe(customCss);
    });
  });
  
  // Template Management Tests
  describe('Template Management', () => {
    beforeEach(async () => {
      await settingsService.loadSettings();
    });
    
    test('should verify relationship between all templates and user templates', () => {
      // First reset to a known state
      settingsService.updateSettings({ templates: [] });
      
      // Get base counts after reset
      const baseAllTemplatesCount = settingsService.getTemplates().length; // DEFAULT_TEMPLATES only
      const baseUserTemplatesCount = settingsService.getUserTemplates().length; // Should be 0
      
      // All templates should be just the default templates when user templates is empty
      expect(baseAllTemplatesCount).toBeGreaterThan(0); // Should have default templates
      expect(baseUserTemplatesCount).toBe(0); // Should have no user templates
      
      // Add a single template using addTemplate method (this properly adds to the array)
      settingsService.addTemplate({
        id: 'test-relationship',
        name: 'Test Relationship',
        content: 'Test content',
        description: 'Test description',
        category: 'Test',
        tags: ['test'],
        style: {
          theme: {
            primaryColor: '#000000',
            textColor: '#333333',
            backgroundColor: '#ffffff'
          },
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: 1.2
        }
      });
      
      // Verify that the count of user templates is exactly 1
      expect(settingsService.getUserTemplates().length).toBe(1);
      
      // Verify that all templates count includes default + our 1 added template
      expect(settingsService.getTemplates().length).toBe(baseAllTemplatesCount + 1);
      
      // Reset templates after test
      settingsService.updateSettings({ templates: [] });
    });
    
    test('should add templates correctly', async () => {
      // Reset templates to empty first
      settingsService.updateSettings({ templates: [] });
      
      // Get initial counts after reset
      const initialAllCount = settingsService.getTemplates().length;
      const initialUserCount = settingsService.getUserTemplates().length;
      expect(initialUserCount).toBe(0); // Should be 0 after reset
      
      // Create new template to add
      const newTemplate: CVTemplate = {
        id: 'user-template-1',
        name: 'User Template 1',
        content: '# User Template Content',
        description: 'A custom user template',
        category: 'Custom',
        tags: ['test'],
        style: {
          theme: {
            primaryColor: '#000000',
            textColor: '#333333',
            backgroundColor: '#ffffff'
          },
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: 1.2
        }
      };
      
      // Add the template
      await settingsService.addTemplate(newTemplate);
      
      // Verify counts after adding
      expect(settingsService.getTemplates().length).toBe(initialAllCount + 1);
      expect(settingsService.getUserTemplates().length).toBe(1);
      
      // Check retrieval by ID
      const retrievedTemplate = settingsService.getTemplateById('user-template-1');
      expect(retrievedTemplate).toBeDefined();
      expect(retrievedTemplate?.name).toBe('User Template 1');
      expect(retrievedTemplate?.content).toBe('# User Template Content');
      
      // Reset templates after test
      settingsService.updateSettings({ templates: [] });
    });
    
    test('should update existing templates', async () => {
      // Reset templates to empty first for clean test
      settingsService.updateSettings({ templates: [] });
      
      // Add a template first
      const template: CVTemplate = {
        id: 'update-test',
        name: 'Original Name',
        content: 'Original content',
        description: 'Original description',
        category: 'Test',
        tags: ['test'],
        style: {
          theme: {
            primaryColor: '#000000',
            textColor: '#333333',
            backgroundColor: '#ffffff'
          },
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: 1.2
        }
      };
      
      await settingsService.addTemplate(template);
      
      // Now update it
      await settingsService.updateTemplate('update-test', {
        name: 'Updated Name',
        content: 'Updated content'
      });
      
      // Verify updates were applied
      const updated = settingsService.getTemplateById('update-test');
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.content).toBe('Updated content');
      // Other fields should be preserved
      expect(updated?.description).toBe('Original description');
      expect(updated?.category).toBe('Test');
      
      // Reset templates after test
      settingsService.updateSettings({ templates: [] });
    });
    
    test('should create template from current content', async () => {
      // Reset templates for clean test
      settingsService.updateSettings({ templates: [] });
      
      const name = 'Current Template';
      const description = 'Created from current content';
      const content = '# Current CV Content';
      
      const template = await settingsService.createTemplateFromCurrent(name, description, content);
      
      expect(template.id).toMatch(/^user-template-/);
      expect(template.name).toBe(name);
      expect(template.description).toBe(description);
      expect(template.content).toBe(content);
      expect(template.style).toBeDefined();
      expect(template.style.theme.primaryColor).toBe(DEFAULT_SETTINGS.defaultThemeColor);
      
      // Verify it was added to user templates
      const foundTemplate = settingsService.getTemplateById(template.id);
      expect(foundTemplate).toBeDefined();
      
      // Reset templates after test
      settingsService.updateSettings({ templates: [] });
    });
    
    test('should create template with custom style', async () => {
      // Reset templates for clean test
      settingsService.updateSettings({ templates: [] });
      
      const customStyle: CVTemplateStyle = {
        theme: {
          primaryColor: '#FF0000',
          textColor: '#000000',
          backgroundColor: '#FFFFFF'
        },
        margins: { top: 30, right: 30, bottom: 30, left: 30 },
        spacing: 1.5
      };
      
      const template = await settingsService.createTemplateFromCurrent(
        'Styled Template', 
        'With custom style', 
        '# Styled Content', 
        customStyle
      );
      
      expect(template.style).toEqual(customStyle);
      
      // Reset templates after test
      settingsService.updateSettings({ templates: [] });
    });
    
    test('should delete templates correctly', async () => {
      // Reset templates to empty first for clean test
      settingsService.updateSettings({ templates: [] });
      
      // Add two templates
      await settingsService.addTemplate({
        id: 'delete-test-1',
        name: 'Delete Test 1',
        content: 'Delete content 1',
        description: 'To be deleted',
        category: 'Test',
        tags: ['test'],
        style: {
          theme: {
            primaryColor: '#000000',
            textColor: '#333333',
            backgroundColor: '#ffffff'
          },
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: 1.2
        }
      });
      
      await settingsService.addTemplate({
        id: 'delete-test-2',
        name: 'Delete Test 2',
        content: 'Delete content 2',
        description: 'To be kept',
        category: 'Test',
        tags: ['test'],
        style: {
          theme: {
            primaryColor: '#000000',
            textColor: '#333333',
            backgroundColor: '#ffffff'
          },
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: 1.2
        }
      });
      
      const countBeforeDelete = settingsService.getUserTemplates().length;
      expect(countBeforeDelete).toBe(2); // Verify we have 2 templates before deletion
      
      // Delete one template
      const success = await settingsService.deleteTemplate('delete-test-1');
      expect(success).toBe(true);
      
      // Verify only one was deleted
      expect(settingsService.getUserTemplates().length).toBe(countBeforeDelete - 1);
      expect(settingsService.getTemplateById('delete-test-1')).toBeUndefined();
      expect(settingsService.getTemplateById('delete-test-2')).toBeDefined();
      
      // Try to delete a non-existent template
      const failedDelete = await settingsService.deleteTemplate('non-existent');
      expect(failedDelete).toBe(false);
      
      // Reset templates after test
      settingsService.updateSettings({ templates: [] });
    });
  });
  
  // Export Options Tests
  describe('Export Options', () => {
    test('should handle last export options', async () => {
      // Initially should be undefined
      expect(settingsService.getLastExportOptions()).toBeUndefined();
      
      const exportOptions: PDFExportOptions = {
        filename: 'test.pdf',
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
        includeHeader: false,
        includeFooter: false,
        includePageNumbers: true
      };
      
      await settingsService.setLastExportOptions(exportOptions);
      
      // Should initialize plugin.data if needed
      expect((plugin as any).data).toBeDefined();
      expect((plugin as any).data.lastExportOptions).toEqual(exportOptions);
      
      // Should be retrievable
      const retrievedOptions = settingsService.getLastExportOptions();
      expect(retrievedOptions).toEqual(exportOptions);
    });
  });
});
