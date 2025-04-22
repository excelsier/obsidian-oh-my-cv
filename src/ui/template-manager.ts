/**
 * Template Manager for the Oh My CV Obsidian plugin
 * Provides UI for browsing, previewing, and applying CV templates
 */

import { Modal, Setting, ButtonComponent, setIcon } from 'obsidian';
import { CVTemplate } from '../core/types';
import { DEFAULT_TEMPLATES, getTemplateById, getTemplatesByCategory } from '../core/templates';
import { getPluginInstance } from '../core/plugin-instance';

/**
 * Template Manager Modal
 * Displays a modal with template options and previews
 */
export class TemplateManager extends Modal {
  private templates: CVTemplate[] = [];
  private selectedTemplate: CVTemplate | null = null;
  private onSelectCallback: (template: CVTemplate) => void;
  private searchTerm: string = '';
  private activeCategory: string | null = null;
  private previewEl: HTMLElement;

  /**
   * Create a new template manager
   * @param onSelect Callback when a template is selected
   */
  constructor(onSelect: (template: CVTemplate) => void) {
    super(getPluginInstance().app);
    this.onSelectCallback = onSelect;
    this.templates = [...DEFAULT_TEMPLATES];
    
    // Add any custom templates from settings
    const customTemplates = getPluginInstance().settings.getSettings().templates || [];
    this.templates = [...this.templates, ...customTemplates];
  }

  /**
   * Modal content
   */
  onOpen() {
    const { contentEl } = this;
    
    // Set up modal layout
    contentEl.createEl('h2', { text: 'CV Templates' });
    
    // Create search and filter bar
    const searchBarContainer = contentEl.createDiv({ cls: 'oh-my-cv-template-search-container' });
    
    // Search input
    const searchInput = searchBarContainer.createEl('input', {
      type: 'text',
      placeholder: 'Search templates...',
      cls: 'oh-my-cv-template-search'
    });
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
      this.updateTemplateList();
    });
    
    // Category filter
    const filterContainer = searchBarContainer.createDiv({ cls: 'oh-my-cv-template-filter' });
    
    // Get unique categories
    const categories = Array.from(
      new Set(this.templates.map(template => template.category || 'Uncategorized'))
    );
    
    // All categories button
    const allCategoriesBtn = new ButtonComponent(filterContainer)
      .setButtonText('All')
      .onClick(() => {
        this.activeCategory = null;
        this.updateTemplateList();
        this.updateCategoryButtons();
      });
    allCategoriesBtn.buttonEl.addClass('oh-my-cv-category-button');
    allCategoriesBtn.buttonEl.addClass('active');
    
    // Category buttons
    categories.forEach(category => {
      const btn = new ButtonComponent(filterContainer)
        .setButtonText(category)
        .onClick(() => {
          this.activeCategory = category;
          this.updateTemplateList();
          this.updateCategoryButtons();
        });
      btn.buttonEl.addClass('oh-my-cv-category-button');
      btn.buttonEl.setAttribute('data-category', category);
    });
    
    // Create main container with template list and preview
    const mainContainer = contentEl.createDiv({ cls: 'oh-my-cv-template-container' });
    
    // Template list on the left
    const templateListContainer = mainContainer.createDiv({ cls: 'oh-my-cv-template-list' });
    
    // Preview on the right
    const previewContainer = mainContainer.createDiv({ cls: 'oh-my-cv-template-preview-container' });
    this.previewEl = previewContainer.createDiv({ cls: 'oh-my-cv-template-preview' });
    
    // Populate the template list initially
    this.populateTemplateList(templateListContainer);
    
    // Button container
    const buttonContainer = contentEl.createDiv({ cls: 'oh-my-cv-template-buttons' });
    
    // Create buttons
    const cancelButton = new ButtonComponent(buttonContainer)
      .setButtonText('Cancel')
      .onClick(() => this.close());
    cancelButton.buttonEl.addClass('oh-my-cv-template-cancel-button');
    
    const selectButton = new ButtonComponent(buttonContainer)
      .setButtonText('Apply Template')
      .setDisabled(true)
      .onClick(() => {
        if (this.selectedTemplate) {
          this.onSelectCallback(this.selectedTemplate);
          this.close();
        }
      });
    selectButton.buttonEl.addClass('oh-my-cv-template-select-button');
    
    // Update select button state when selection changes
    document.addEventListener('click', () => {
      selectButton.setDisabled(!this.selectedTemplate);
    });
    
    // Clean up event listener when the modal is closed
    this.onClose = () => {
      document.removeEventListener('click', () => {});
      contentEl.empty();
    };
  }
  
  /**
   * Clean up when the modal is closed
   */
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  
  /**
   * Populate the template list
   * @param container Container to populate
   */
  private populateTemplateList(container: HTMLElement) {
    container.empty();
    
    // Filter templates based on search and category
    const filteredTemplates = this.getFilteredTemplates();
    
    if (filteredTemplates.length === 0) {
      container.createEl('p', { 
        text: 'No templates match your search criteria.',
        cls: 'oh-my-cv-template-empty'
      });
      return;
    }
    
    // Create template items
    filteredTemplates.forEach(template => {
      const templateItem = container.createDiv({ cls: 'oh-my-cv-template-item' });
      
      // Check if this is the selected template
      if (this.selectedTemplate && this.selectedTemplate.id === template.id) {
        templateItem.addClass('selected');
      }
      
      // Template name and info
      const nameEl = templateItem.createEl('h3', { 
        text: template.name,
        cls: 'oh-my-cv-template-name'
      });
      
      // Add category tag if available
      if (template.category) {
        const categoryEl = templateItem.createSpan({ 
          text: template.category,
          cls: 'oh-my-cv-template-category'
        });
      }
      
      // Template description
      templateItem.createDiv({ 
        text: template.description,
        cls: 'oh-my-cv-template-description'
      });
      
      // Add tags if available
      if (template.tags && template.tags.length > 0) {
        const tagsContainer = templateItem.createDiv({ cls: 'oh-my-cv-template-tags' });
        template.tags.forEach(tag => {
          tagsContainer.createSpan({ 
            text: tag,
            cls: 'oh-my-cv-template-tag'
          });
        });
      }
      
      // Template click handler
      templateItem.addEventListener('click', () => {
        this.selectedTemplate = template;
        this.updateSelectedTemplate(container);
        this.updatePreview(template);
      });
    });
  }
  
  /**
   * Update the template list based on search and category filters
   */
  private updateTemplateList() {
    const containerEl = this.contentEl.querySelector('.oh-my-cv-template-list');
    if (containerEl) {
      this.populateTemplateList(containerEl as HTMLElement);
    }
  }
  
  /**
   * Update the style of the selected template in the list
   * @param container The template list container
   */
  private updateSelectedTemplate(container: HTMLElement) {
    // Remove selected class from all items
    const items = container.querySelectorAll('.oh-my-cv-template-item');
    items.forEach(item => item.removeClass('selected'));
    
    // Add selected class to the current template
    if (this.selectedTemplate) {
      const selectedItem = Array.from(items).find(item => {
        const nameEl = item.querySelector('.oh-my-cv-template-name');
        return nameEl && nameEl.textContent === this.selectedTemplate?.name;
      });
      
      if (selectedItem) {
        selectedItem.addClass('selected');
      }
    }
  }
  
  /**
   * Update the category buttons to show which one is active
   */
  private updateCategoryButtons() {
    const buttons = this.contentEl.querySelectorAll('.oh-my-cv-category-button');
    
    // Remove active class from all buttons
    buttons.forEach(button => button.removeClass('active'));
    
    // Add active class to the current category button
    if (this.activeCategory) {
      const activeButton = Array.from(buttons).find(button => 
        button.getAttribute('data-category') === this.activeCategory
      );
      
      if (activeButton) {
        activeButton.addClass('active');
      }
    } else {
      // If no category is selected, "All" button should be active
      buttons[0].addClass('active');
    }
  }
  
  /**
   * Filter templates based on search term and category
   * @returns Filtered templates
   */
  private getFilteredTemplates(): CVTemplate[] {
    return this.templates.filter(template => {
      // Filter by category if one is selected
      if (this.activeCategory && template.category !== this.activeCategory) {
        return false;
      }
      
      // If there's a search term, filter by it
      if (this.searchTerm) {
        const searchFields = [
          template.name,
          template.description,
          template.category || '',
          ...(template.tags || [])
        ].map(field => field.toLowerCase());
        
        return searchFields.some(field => field.includes(this.searchTerm));
      }
      
      return true;
    });
  }
  
  /**
   * Update the preview pane with the selected template
   * @param template Template to preview
   */
  private updatePreview(template: CVTemplate) {
    this.previewEl.empty();
    
    // Create preview header
    const previewHeader = this.previewEl.createDiv({ cls: 'oh-my-cv-preview-header' });
    previewHeader.createEl('h3', { text: 'Preview: ' + template.name });
    
    // Preview content
    const previewContent = this.previewEl.createDiv({ 
      cls: 'oh-my-cv-preview-content',
      attr: { style: this.getPreviewStyles(template) }
    });
    
    // Generate a simple preview of the template content
    const previewText = this.generatePreviewHTML(template.content);
    previewContent.innerHTML = previewText;
  }
  
  /**
   * Get CSS styles for the template preview
   * @param template The template
   * @returns CSS style string
   */
  private getPreviewStyles(template: CVTemplate): string {
    const { theme, margins } = template.style;
    
    return `
      color: ${theme.textColor || '#333'};
      background-color: ${theme.backgroundColor || '#fff'};
      font-family: ${theme.bodyFont || 'sans-serif'};
      padding: ${margins.top / 2}px ${margins.right / 2}px ${margins.bottom / 2}px ${margins.left / 2}px;
      font-size: ${theme.fontSize || '11pt'};
      line-height: ${theme.lineHeight || '1.5'};
    `;
  }
  
  /**
   * Generate a simple HTML preview from markdown content
   * @param content Markdown content
   * @returns HTML preview
   */
  private generatePreviewHTML(content: string): string {
    // Simple markdown to HTML conversion for preview
    // Just handles basic elements for the preview
    let html = content
      .replace(/^# (.*$)/gm, '<h1 style="color:' + (this.selectedTemplate?.style.theme.primaryColor || '#000') + '">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="color:' + (this.selectedTemplate?.style.theme.primaryColor || '#000') + '">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="color:' + (this.selectedTemplate?.style.theme.primaryColor || '#000') + '">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*$)/gm, '<li>$1</li>')
      .replace(/\\cvtag\{(.*?)\}/g, '<span class="preview-tag">$1</span>')
      .replace(/\\daterange\{(.*?)\}\{(.*?)\}/g, '<span class="preview-date">$1 – $2</span>');
    
    // Replace consecutive list items with a ul wrapper
    html = html.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)*/g, match => {
      return `<ul>${match}</ul>`;
    });
    
    // Replace newpage markers
    html = html.replace(/\\newpage/g, '<hr class="preview-page-break">');
    
    // Truncate the preview if it's too long
    const MAX_PREVIEW_LENGTH = 1500;
    if (html.length > MAX_PREVIEW_LENGTH) {
      html = html.substring(0, MAX_PREVIEW_LENGTH) + '...';
    }
    
    return html;
  }
}

/**
 * Template Selector Component
 * A simpler dropdown for selecting templates
 */
export class TemplateSelector {
  private containerEl: HTMLElement;
  private selectEl: HTMLSelectElement;
  private onSelectCallback: (template: CVTemplate) => void;
  private templates: CVTemplate[];
  
  /**
   * Create a new template selector
   * @param containerEl Container element to add the selector to
   * @param onSelect Callback when a template is selected
   */
  constructor(containerEl: HTMLElement, onSelect: (template: CVTemplate) => void) {
    this.containerEl = containerEl;
    this.onSelectCallback = onSelect;
    
    // Get templates
    this.templates = [...DEFAULT_TEMPLATES];
    const customTemplates = getPluginInstance().settings.getSettings().templates || [];
    this.templates = [...this.templates, ...customTemplates];
    
    this.createSelector();
  }
  
  /**
   * Create the template selector dropdown
   */
  private createSelector() {
    const selectorContainer = this.containerEl.createDiv({ cls: 'oh-my-cv-template-selector-container' });
    
    // Create select element
    this.selectEl = selectorContainer.createEl('select', { cls: 'oh-my-cv-template-selector' });
    
    // Add default option
    this.selectEl.createEl('option', {
      value: '',
      text: 'Select a template...',
      attr: { disabled: 'disabled', selected: 'selected' }
    });
    
    // Group templates by category
    const categories = this.groupTemplatesByCategory();
    
    // Add options for each category
    Object.entries(categories).forEach(([category, templates]) => {
      const optgroup = this.selectEl.createEl('optgroup', { attr: { label: category } });
      
      templates.forEach(template => {
        optgroup.createEl('option', {
          value: template.id,
          text: template.name,
        });
      });
    });
    
    // Add change event handler
    this.selectEl.addEventListener('change', this.handleTemplateSelection.bind(this));
    
    // Add browse button
    const browseButton = new ButtonComponent(selectorContainer)
      .setIcon('search')
      .setTooltip('Browse Templates')
      .onClick(() => {
        new TemplateManager((template) => {
          this.onSelectCallback(template);
          // Update the selector to match the selected template
          this.selectEl.value = template.id;
        }).open();
      });
    browseButton.buttonEl.addClass('oh-my-cv-template-browse-button');
  }
  
  /**
   * Group templates by category
   * @returns Templates grouped by category
   */
  private groupTemplatesByCategory(): Record<string, CVTemplate[]> {
    const categories: Record<string, CVTemplate[]> = {};
    
    this.templates.forEach(template => {
      const category = template.category || 'Other';
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push(template);
    });
    
    return categories;
  }
  
  /**
   * Handle template selection from the dropdown
   */
  private handleTemplateSelection() {
    const templateId = this.selectEl.value;
    const template = this.templates.find(t => t.id === templateId);
    
    if (template) {
      this.onSelectCallback(template);
    }
  }
}
