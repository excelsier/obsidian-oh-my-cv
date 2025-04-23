/**
 * Mock implementation of the plugin instance module for testing
 */
import { jest } from '@jest/globals';
import { App, Plugin } from './obsidian';
import { DEFAULT_SETTINGS } from '../../src/core/constants';

// Import the OhMyCVSettings type to properly type our mock data
import { OhMyCVSettings } from '../../src/core/types';

// Create a mock plugin with the necessary methods for testing
class MockPlugin extends Plugin {
  // Mock data storage with proper typing
  private data: OhMyCVSettings = {
    ...DEFAULT_SETTINGS,
    templates: []
  };

  // Mock load and save data methods with proper return types
  loadData = jest.fn<() => Promise<OhMyCVSettings>>().mockImplementation(() => Promise.resolve(this.data));
  saveData = jest.fn<(data: OhMyCVSettings) => Promise<void>>().mockImplementation((data) => {
    this.data = data;
    return Promise.resolve();
  });

  // Settings service mock methods that the tests need - with proper return types
  settings = {
    isAutoCasingEnabled: jest.fn<() => boolean>().mockReturnValue(true),
    isTeXSupportEnabled: jest.fn<() => boolean>().mockReturnValue(true),
    isPageBreaksEnabled: jest.fn<() => boolean>().mockReturnValue(true),
    isIconSupportEnabled: jest.fn<() => boolean>().mockReturnValue(true),
    isCustomCssEnabled: jest.fn<() => boolean>().mockReturnValue(false),
    getDefaultMargins: jest.fn<() => {top: number, right: number, bottom: number, left: number}>().mockReturnValue({ top: 20, right: 20, bottom: 20, left: 20 }),
    getDefaultPageSize: jest.fn<() => string>().mockReturnValue('A4'),
    setDefaultPageSize: jest.fn<(size: string) => Promise<void>>().mockResolvedValue(undefined),
    setDefaultMargins: jest.fn<(margins: any) => Promise<void>>().mockResolvedValue(undefined),
    getDefaultThemeColor: jest.fn<() => string>().mockReturnValue('#4051b5'),
    getDefaultFontFamily: jest.fn<() => string>().mockReturnValue('Inter, sans-serif'),
    getDefaultCustomCss: jest.fn<() => string>().mockReturnValue(''),
    getSettings: jest.fn<() => OhMyCVSettings>().mockReturnValue(this.data),
    updateSettings: jest.fn<(settings: Partial<OhMyCVSettings>) => Promise<void>>().mockImplementation((settings) => {
      this.data = { ...this.data, ...settings } as OhMyCVSettings;
      return Promise.resolve();
    }),
    getTemplates: jest.fn<() => any[]>().mockReturnValue([]),
    setSetting: jest.fn<(key: keyof OhMyCVSettings, value: any) => Promise<void>>().mockImplementation((key, value) => {
      (this.data as any)[key] = value;
      return Promise.resolve();
    }),
    getLastExportOptions: jest.fn<() => any>().mockReturnValue({
      outputPath: '/test/path.pdf',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      orientation: 'portrait',
      fontSize: 11,
      lineHeight: 1.5,
      embedFonts: true,
      imageQuality: 0.95
    }),
    setLastExportOptions: jest.fn<(options: any) => Promise<void>>().mockResolvedValue(undefined)
  };
}

// Create the mock plugin instance
const mockPluginInstance = new MockPlugin(new App(), { id: 'obsidian-oh-my-cv' });

// Export the mock functions that will be used to replace the real ones
export function getPluginInstance() {
  return mockPluginInstance;
}

export function setPluginInstance() {
  // No-op for tests
}
