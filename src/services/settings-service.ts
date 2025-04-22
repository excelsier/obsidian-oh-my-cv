/**
 * Settings service for the Oh My CV plugin
 * Handles loading, saving, and accessing plugin settings
 */

import { OhMyCVSettings, CVTemplate, CVTemplateStyle, CVTheme, PDFExportOptions } from '../core/types';
import { DEFAULT_TEMPLATES, getTemplateById } from '../core/templates';
import { DEFAULT_SETTINGS } from '../core/constants';
import { getPluginInstance } from '../core/plugin-instance';

/**
 * Service for managing plugin settings
 */
export class SettingsService {
  private plugin: any;
  private settings: OhMyCVSettings;

  /**
   * Create a new settings service
   * @param plugin The Oh My CV plugin instance
   */
  constructor(plugin: any) {
    this.plugin = plugin;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.plugin.loadData()) };
  }

  /**
   * Save settings to storage
   */
  async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  /**
   * Get the current settings
   */
  getSettings(): OhMyCVSettings {
    return this.settings;
  }

  /**
   * Update settings
   * @param settings Partial settings to update
   */
  async updateSettings(settings: Partial<OhMyCVSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.saveSettings();
  }

  /**
   * Get default page size
   */
  getDefaultPageSize(): 'A4' | 'LETTER' {
    return this.settings.defaultPageSize;
  }

  /**
   * Set default page size
   * @param pageSize The page size (A4 or LETTER)
   */
  async setDefaultPageSize(pageSize: 'A4' | 'LETTER'): Promise<void> {
    this.settings.defaultPageSize = pageSize;
    await this.saveSettings();
  }

  /**
   * Get default margins
   */
  getDefaultMargins(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    return this.settings.defaultMargins;
  }

  /**
   * Set default margins
   * @param margins The margins object
   */
  async setDefaultMargins(margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }): Promise<void> {
    this.settings.defaultMargins = margins;
    await this.saveSettings();
  }

  /**
   * Get default theme color
   */
  getDefaultThemeColor(): string {
    return this.settings.defaultThemeColor;
  }

  /**
   * Set default theme color
   * @param color The theme color in hex format
   */
  async setDefaultThemeColor(color: string): Promise<void> {
    this.settings.defaultThemeColor = color;
    await this.saveSettings();
  }

  /**
   * Get default font family
   */
  getDefaultFontFamily(): string {
    return this.settings.defaultFontFamily;
  }

  /**
   * Set the default font family
   * @param fontFamily The font family to use
   */
  async setDefaultFontFamily(fontFamily: string): Promise<void> {
    this.settings.defaultFontFamily = fontFamily;
    await this.saveSettings();
  }

  /**
   * Get templates from settings
   * @returns Array of templates
   */
  getTemplates(): CVTemplate[] {
    return [...DEFAULT_TEMPLATES, ...(this.settings.templates || [])];
  }

  /**
   * Get user-created templates only
   * @returns Array of user templates
   */
  getUserTemplates(): CVTemplate[] {
    return this.settings.templates || [];
  }

  /**
   * Get a template by ID (checks both built-in and user templates)
   * @param id Template ID
   * @returns Template or undefined if not found
   */
  getTemplateById(id: string): CVTemplate | undefined {
    // First check the built-in templates
    const builtInTemplate = getTemplateById(id);
    if (builtInTemplate) {
      return builtInTemplate;
    }
    
    // Then check user templates
    return this.settings.templates.find(template => template.id === id);
  }

  /**
   * Add a template
   * @param template Template to add
   */
  async addTemplate(template: CVTemplate): Promise<void> {
    if (!this.settings.templates) {
      this.settings.templates = [];
    }

    // Check if a template with this ID already exists
    const existingTemplateIndex = this.settings.templates.findIndex(t => t.id === template.id);
    
    if (existingTemplateIndex >= 0) {
      // Update existing template
      this.settings.templates[existingTemplateIndex] = template;
    } else {
      // Add new template
      this.settings.templates.push(template);
    }
    
    await this.saveSettings();
  }
  
  /**
   * Delete a template by ID
   * @param id Template ID
   * @returns True if the template was deleted, false otherwise
   */
  async deleteTemplate(id: string): Promise<boolean> {
    // Only user templates can be deleted
    if (!this.settings.templates) {
      return false;
    }
    
    const initialLength = this.settings.templates.length;
    this.settings.templates = this.settings.templates.filter(template => template.id !== id);
    
    const success = this.settings.templates.length < initialLength;
    if (success) {
      await this.saveSettings();
    }
    
    return success;
  }
  
  /**
   * Create a template from current CV content
   * @param name Template name
   * @param description Template description
   * @param content Template content
   * @param style Template style (optional)
   * @returns The created template
   */
  async createTemplateFromCurrent(name: string, description: string, content: string, style?: CVTemplateStyle): Promise<CVTemplate> {
    const id = `user-template-${Date.now()}`;
    
    // If no style provided, create a default one
    const defaultStyle: CVTemplateStyle = style || {
      theme: {
        primaryColor: this.settings.defaultThemeColor,
        textColor: '#333333',
        backgroundColor: '#ffffff',
      },
      margins: this.settings.defaultMargins,
      spacing: 1.15,
    };
    
    const template: CVTemplate = {
      id,
      name,
      description,
      content,
      style: defaultStyle,
      category: 'Custom',
      tags: ['user-created'],
    };
    
    await this.addTemplate(template);
    return template;
  }

  /**
   * Update an existing template
   * @param id The template ID
   * @param template The updated template data
   */
  async updateTemplate(id: string, template: Partial<CVTemplate>): Promise<void> {
    const index = this.settings.templates.findIndex(t => t.id === id);
    if (index >= 0) {
      this.settings.templates[index] = {
        ...this.settings.templates[index],
        ...template
      };
      await this.saveSettings();
    }
  }



  /**
   * Add a font to recently used fonts
   * @param fontName The font name to add
   */
  async addRecentlyUsedFont(fontName: string): Promise<void> {
    // Remove if already exists
    this.settings.recentlyUsedFonts = this.settings.recentlyUsedFonts.filter(f => f !== fontName);
    
    // Add to the front of the array
    this.settings.recentlyUsedFonts.unshift(fontName);
    
    // Keep only the most recent 10 fonts
    if (this.settings.recentlyUsedFonts.length > 10) {
      this.settings.recentlyUsedFonts = this.settings.recentlyUsedFonts.slice(0, 10);
    }
    
    await this.saveSettings();
  }

  /**
   * Get recently used fonts
   */
  getRecentlyUsedFonts(): string[] {
    return this.settings.recentlyUsedFonts;
  }

  /**
   * Check if auto-casing is enabled
   */
  isAutoCasingEnabled(): boolean {
    return this.settings.autoCasing;
  }

  /**
   * Check if TeX support is enabled
   */
  isTeXSupportEnabled(): boolean {
    return this.settings.texSupport;
  }

  /**
   * Check if page breaks visualization is enabled
   */
  isPageBreaksEnabled(): boolean {
    return this.settings.showPageBreaks;
  }

  /**
   * Check if icon support is enabled
   */
  isIconSupportEnabled(): boolean {
    return this.settings.iconSupport;
  }

  /**
   * Check if custom CSS is enabled
   */
  isCustomCssEnabled(): boolean {
    return this.settings.enableCustomCss;
  }

  /**
   * Get default custom CSS
   */
  getDefaultCustomCss(): string {
    return this.settings.defaultCustomCss;
  }

  /**
   * Get the last used export options
   * @returns The last export options or undefined if none exist
   */
  getLastExportOptions(): PDFExportOptions | undefined {
    return (this.plugin?.data?.lastExportOptions as PDFExportOptions) || undefined;
  }

  /**
   * Save the last used export options
   * @param options Export options to save
   */
  async setLastExportOptions(options: PDFExportOptions): Promise<void> {
    // Store directly in plugin data, not in settings
    if (!this.plugin.data) {
      this.plugin.data = {};
    }
    this.plugin.data.lastExportOptions = options;
    await this.plugin.saveData(this.plugin.data);
  }
}
