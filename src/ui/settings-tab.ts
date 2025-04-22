/**
 * Settings tab for the Oh My CV plugin
 * Allows users to configure plugin settings
 */

import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CVTemplate } from '../core/types';

// Use a type declaration instead of an import to avoid circular dependencies
declare class OhMyCVPlugin extends Plugin {
  settings: any;
  id: string;
  app: App;
}

/**
 * Settings tab for configuring the Oh My CV plugin
 */
export class OhMyCVSettingsTab extends PluginSettingTab {
  private plugin: OhMyCVPlugin;

  /**
   * Create a new settings tab
   * @param app The Obsidian app
   * @param plugin The Oh My CV plugin instance
   */
  constructor(app: App, plugin: OhMyCVPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Display the settings UI
   */
  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.settings.getSettings();

    // Clear the container
    containerEl.empty();

    // Add heading
    containerEl.createEl('h2', { text: 'Oh My CV Settings' });

    // Page settings section
    containerEl.createEl('h3', { text: 'Page Settings' });

    // Page Size
    new Setting(containerEl)
      .setName('Default Page Size')
      .setDesc('Choose between A4 or US Letter')
      .addDropdown(dropdown => dropdown
        .addOption('A4', 'A4')
        .addOption('LETTER', 'US Letter')
        .setValue(settings.defaultPageSize)
        .onChange(async (value: 'A4' | 'LETTER') => {
          await this.plugin.settings.setDefaultPageSize(value);
        }));

    // Margins section
    containerEl.createEl('h4', { text: 'Default Margins (mm)' });

    // Top margin
    new Setting(containerEl)
      .setName('Top Margin')
      .addSlider(slider => slider
        .setLimits(5, 50, 5)
        .setValue(settings.defaultMargins.top)
        .setDynamicTooltip()
        .onChange(async (value) => {
          const margins = this.plugin.settings.getDefaultMargins();
          margins.top = value;
          await this.plugin.settings.setDefaultMargins(margins);
        }));

    // Bottom margin
    new Setting(containerEl)
      .setName('Bottom Margin')
      .addSlider(slider => slider
        .setLimits(5, 50, 5)
        .setValue(settings.defaultMargins.bottom)
        .setDynamicTooltip()
        .onChange(async (value) => {
          const margins = this.plugin.settings.getDefaultMargins();
          margins.bottom = value;
          await this.plugin.settings.setDefaultMargins(margins);
        }));

    // Left margin
    new Setting(containerEl)
      .setName('Left Margin')
      .addSlider(slider => slider
        .setLimits(5, 50, 5)
        .setValue(settings.defaultMargins.left)
        .setDynamicTooltip()
        .onChange(async (value) => {
          const margins = this.plugin.settings.getDefaultMargins();
          margins.left = value;
          await this.plugin.settings.setDefaultMargins(margins);
        }));

    // Right margin
    new Setting(containerEl)
      .setName('Right Margin')
      .addSlider(slider => slider
        .setLimits(5, 50, 5)
        .setValue(settings.defaultMargins.right)
        .setDynamicTooltip()
        .onChange(async (value) => {
          const margins = this.plugin.settings.getDefaultMargins();
          margins.right = value;
          await this.plugin.settings.setDefaultMargins(margins);
        }));

    // Appearance section
    containerEl.createEl('h3', { text: 'Appearance' });

    // Theme color
    new Setting(containerEl)
      .setName('Default Theme Color')
      .setDesc('Choose the primary color for your CV')
      .addColorPicker(color => color
        .setValue(settings.defaultThemeColor)
        .onChange(async (value) => {
          await this.plugin.settings.setDefaultThemeColor(value);
        }));

    // Font family
    new Setting(containerEl)
      .setName('Default Font Family')
      .setDesc('Specify a valid font family name')
      .addText(text => text
        .setPlaceholder('Inter, sans-serif')
        .setValue(settings.defaultFontFamily)
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ defaultFontFamily: value });
        }));

    // Font size
    new Setting(containerEl)
      .setName('Default Font Size (pt)')
      .addSlider(slider => slider
        .setLimits(8, 16, 1)
        .setValue(settings.defaultFontSize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ defaultFontSize: value });
        }));

    // Line height
    new Setting(containerEl)
      .setName('Default Line Height')
      .addSlider(slider => slider
        .setLimits(1, 2, 0.1)
        .setValue(settings.defaultLineHeight)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ defaultLineHeight: value });
        }));

    // Features section
    containerEl.createEl('h3', { text: 'Features' });

    // Auto casing
    new Setting(containerEl)
      .setName('Auto Casing Correction')
      .setDesc('Automatically correct casing of common terms (e.g., GitHub, LinkedIn)')
      .addToggle(toggle => toggle
        .setValue(settings.autoCasing)
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ autoCasing: value });
        }));

    // TeX support
    new Setting(containerEl)
      .setName('TeX Support')
      .setDesc('Enable LaTeX-style mathematical expressions')
      .addToggle(toggle => toggle
        .setValue(settings.texSupport)
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ texSupport: value });
        }));

    // Page breaks
    new Setting(containerEl)
      .setName('Show Page Breaks')
      .setDesc('Visualize page breaks in the editor')
      .addToggle(toggle => toggle
        .setValue(settings.showPageBreaks)
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ showPageBreaks: value });
        }));

    // Icon support
    new Setting(containerEl)
      .setName('Icon Support')
      .setDesc('Enable icon support through Iconify')
      .addToggle(toggle => toggle
        .setValue(settings.iconSupport)
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ iconSupport: value });
        }));

    // Google Fonts section
    containerEl.createEl('h3', { text: 'Google Fonts' });

    // Google Fonts API key
    new Setting(containerEl)
      .setName('Google Fonts API Key')
      .setDesc('Optional: Enter your Google Fonts API key for font previews')
      .addText(text => text
        .setPlaceholder('Your API key')
        .setValue(settings.googleFontsApiKey || '')
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ googleFontsApiKey: value });
        }));

    // Recently used fonts
    const fontContainer = containerEl.createDiv({ cls: 'oh-my-cv-recent-fonts' });
    fontContainer.createEl('h4', { text: 'Recently Used Fonts' });

    const fontList = fontContainer.createEl('ul');
    settings.recentlyUsedFonts.forEach((font: string) => {
      fontList.createEl('li', { text: font });
    });

    // Advanced section
    containerEl.createEl('h3', { text: 'Advanced' });

    // Custom CSS
    new Setting(containerEl)
      .setName('Custom CSS')
      .setDesc('Enable custom CSS styling for your CV')
      .addToggle(toggle => toggle
        .setValue(settings.enableCustomCss)
        .onChange(async (value) => {
          await this.plugin.settings.updateSettings({ enableCustomCss: value });
          this.display(); // Refresh to show/hide textarea
        }));

    // Only show CSS textarea if custom CSS is enabled
    if (settings.enableCustomCss) {
      new Setting(containerEl)
        .setName('Default CSS Code')
        .setDesc('Add custom CSS to style your CV')
        .addTextArea(text => text
          .setPlaceholder('/* Your custom CSS here */')
          .setValue(settings.defaultCustomCss)
          .onChange(async (value) => {
            await this.plugin.settings.updateSettings({ defaultCustomCss: value });
          }));
    }

    // Template management section
    containerEl.createEl('h3', { text: 'Template Management' });

    // List existing templates
    const templatesContainer = containerEl.createDiv({ cls: 'oh-my-cv-templates' });
    settings.templates.forEach((template: CVTemplate) => {
      this.createTemplateItem(containerEl, template);
    });

    // Add new template button
    new Setting(containerEl)
      .setName('Add New Template')
      .setDesc('Create a new CV template')
      .addButton(button => button
        .setButtonText('Add Template')
        .onClick(() => {
          this.showAddTemplateModal();
        }));
  }

  /**
   * Create a UI element for a template
   * @param container The container element
   * @param template The template data
   */
  private createTemplateItem(containerEl: HTMLElement, template: CVTemplate): void {
    const templateEl = containerEl.createDiv({
      cls: 'oh-my-cv-template-item'
    });
    
    // Template name and description
    const infoEl = templateEl.createDiv({ cls: 'oh-my-cv-template-info' });
    infoEl.createEl('h4', { text: template.name });
    infoEl.createEl('p', { text: template.description });
    
    // Template actions
    const actionsEl = templateEl.createDiv({ cls: 'oh-my-cv-template-actions' });
    
    // Edit button
    const editButton = actionsEl.createEl('button', {
      cls: 'oh-my-cv-template-edit',
      text: 'Edit'
    });
    editButton.addEventListener('click', () => {
      this.showEditTemplateModal(template);
    });
    
    // Delete button (not available for default templates)
    if (template.id !== 'default' && template.id !== 'academic' && template.id !== 'minimal') {
      const deleteButton = actionsEl.createEl('button', {
        cls: 'oh-my-cv-template-delete',
        text: 'Delete'
      });
      deleteButton.addEventListener('click', () => {
        this.deleteTemplate(template.id);
      });
    }
  }

  /**
   * Show modal for adding a new template
   */
  private showAddTemplateModal(): void {
    // In a real implementation, this would open a modal with a form for creating a template
    // For now, we'll use prompt dialogs
    
    const name = prompt('Enter template name:');
    if (!name) return;
    
    const description = prompt('Enter template description:');
    if (!description) return;
    
    const content = prompt('Enter template content (Markdown):');
    if (!content) return;
    
    // Generate an ID
    const id = `template-${Date.now()}`;
    
    // Add the template
    this.plugin.settings.addTemplate({
      id,
      name,
      description,
      content,
      style: {
        theme: {
          primaryColor: '#4051b5',
          textColor: '#333333',
          backgroundColor: '#ffffff',
          headingFont: 'Inter, sans-serif',
          bodyFont: 'Inter, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.5'
        },
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        spacing: 1.2
      }
    });
    
    // Refresh the settings display
    this.display();
  }

  /**
   * Show modal for editing a template
   * @param template The template to edit
   */
  private showEditTemplateModal(template: CVTemplate): void {
    // In a real implementation, this would open a modal with the template editor
    // For now, we'll use prompt dialogs
    
    const name = prompt('Enter template name:', template.name);
    if (!name) return;
    
    const description = prompt('Enter template description:', template.description);
    if (!description) return;
    
    const content = prompt('Enter template content (Markdown):', template.content);
    if (!content) return;
    
    // Update the template
    this.plugin.settings.updateTemplate(template.id, {
      name,
      description,
      content
    });
    
    // Refresh the settings display
    this.display();
  }

  /**
   * Delete a template
   * @param id The template ID to delete
   */
  private deleteTemplate(id: string): void {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    // Delete the template
    this.plugin.settings.deleteTemplate(id);
    
    // Refresh the settings display
    this.display();
  }
}
