/**
 * CV Editor View for the Oh My CV plugin
 * Implements a dedicated Obsidian view for CV editing
 */

import { ItemView, WorkspaceLeaf, TFile, Editor, MarkdownView, setIcon, Notice, ButtonComponent } from 'obsidian';
import { CV_EDITOR_VIEW_TYPE, PLUGIN_NAME } from '../core/constants';
import { getTemplateById } from '../core/templates';
import { TemplateManager, TemplateSelector } from './template-manager';
import { CVDocument } from '../core/types';
import { getPluginInstance } from '../core/plugin-instance';
import { MarkdownService } from '../services/markdown-service';
import { ExportService } from '../services/export-service';

/**
 * Dedicated view for editing CVs with split layout
 */
export class CVEditorView extends ItemView {
  // Services and plugin reference
  private markdownService: MarkdownService;
  private exportService: ExportService;

  // UI Components
  // ItemView already has contentEl, so we don't need to redeclare it
  private mainContainerEl: HTMLElement;
  private editorEl: HTMLTextAreaElement;
  private previewEl: HTMLElement;
  private toolbarEl: HTMLElement;
  private statusBarEl: HTMLElement;

  // Document state
  private currentDocument: CVDocument | null = null;
  private unsavedChanges: boolean = false;

  /**
   * Create a new CV editor view
   * @param leaf The workspace leaf to attach to
   */
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);

    // Initialize services
    this.markdownService = new MarkdownService(this);
    this.exportService = new ExportService(getPluginInstance());
  }

  /**
   * Get the type of the view
   */
  getViewType(): string {
    return CV_EDITOR_VIEW_TYPE;
  }

  /**
   * Get the display text for the view
   */
  getDisplayText(): string {
    if (this.currentDocument) {
      return `CV: ${this.currentDocument.metadata.title}`;
    }
    return PLUGIN_NAME;
  }

  /**
   * Get the icon for the view
   */
  getIcon(): string {
    return 'file-text';
  }

  /**
   * Initialize the view when it's opened
   */
  async onOpen(): Promise<void> {
    try {
      // Add the container class to the content element
      this.contentEl.empty();
      this.contentEl.addClass('oh-my-cv-container');
      this.mainContainerEl = this.contentEl;
      
      // Get side panel mode from view state
      const state = this.getState();
      const isSidePanel = state?.isSidePanel === true;
      
      // Apply side panel specific styling if needed
      if (isSidePanel) {
        this.contentEl.addClass('oh-my-cv-side-panel');
      }
      
      // Create the header
      this.createHeader();
      
      // Create the main content area with correct layout
      this.createMainContent(isSidePanel);
      
      // Create the status bar
      this.createStatusBar();
      
      // Register events
      this.registerEvents();
      
      // Load CSS styles to ensure proper rendering
      this.loadStyles();
    } catch (error) {
      console.error('Error opening CV editor view:', error);
      new Notice(`Error opening CV editor: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up when the view is closed
   */
  async onClose(): Promise<void> {
    // Prompt to save if there are unsaved changes
    if (this.unsavedChanges) {
      // In a real implementation, we would show a dialog here
      console.log('There are unsaved changes.');
    }
    
    // Clear the content
    this.contentEl.empty();
  }
  
  /**
   * Load CSS styles needed for proper rendering
   * This ensures the CV preview looks correct
   */
  private loadStyles(): void {
    // Add required CSS styles for proper rendering
    const styleEl = document.createElement('style');
    styleEl.id = 'oh-my-cv-runtime-styles';
    styleEl.textContent = `
      .oh-my-cv-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      
      /* Side panel specific styles */
      .oh-my-cv-side-panel {
        font-size: 0.85em;
      }
      
      /* Main layout container */
      .oh-my-cv-main-content {
        display: flex;
        flex-direction: row;
        flex: 1;
        overflow: hidden;
        height: calc(100% - 100px);
      }
      
      /* Vertical layout for side panel */
      .oh-my-cv-side-panel-content {
        flex-direction: column;
      }
      
      /* Editor and preview containers */
      .oh-my-cv-editor-container,
      .oh-my-cv-preview-container {
        flex: 1;
        padding: 10px;
        overflow: auto;
      }
      
      /* Side panel specific container adjustments */
      .oh-my-cv-side-panel-editor,
      .oh-my-cv-side-panel-preview {
        width: 100%;
        height: auto;
        min-height: 200px;
        max-height: 45%;
      }
      
      /* Side panel toolbar adjustments */
      .oh-my-cv-side-panel-toolbar {
        flex-wrap: wrap;
        justify-content: center;
        padding: 5px 0;
      }
      
      /* Side panel template selector adjustments */
      .oh-my-cv-side-panel-selector {
        font-size: 0.9em;
      }
      
      /* Make sure buttons fit in the side panel */
      .oh-my-cv-side-panel .oh-my-cv-toolbar button {
        padding: 4px;
        margin: 2px;
      }
      
      .oh-my-cv-editor {
        width: 100%;
        height: calc(100% - 80px);
        font-family: var(--font-monospace);
        resize: none;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        padding: 10px;
      }
      
      .oh-my-cv-preview {
        height: 100%;
        overflow: auto;
        padding: 20px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background-color: var(--background-primary);
      }
    `;
    
    // Remove any existing style element
    const existingStyle = document.getElementById('oh-my-cv-runtime-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add to document head
    document.head.appendChild(styleEl);
  }

  /**
   * Create the header with title and buttons
   */
  private createHeader(): void {
    const headerEl = this.mainContainerEl.createDiv({ cls: 'oh-my-cv-header' });
    
    // Title
    headerEl.createEl('h2', { text: 'CV Editor' });
    
    // Buttons container
    const buttonsEl = headerEl.createDiv({ cls: 'oh-my-cv-buttons' });
    
    // Template button
    const templateButton = new ButtonComponent(buttonsEl)
      .setButtonText('Templates')
      .setClass('oh-my-cv-button')
      .setClass('oh-my-cv-template-button')
      .onClick(() => {
        new TemplateManager((template) => {
          this.applyTemplate(template.id);
        }).open();
      });
    
    // Save button
    const saveButton = buttonsEl.createEl('button', {
      cls: 'oh-my-cv-button oh-my-cv-save-button',
      text: 'Save',
    });
    saveButton.addEventListener('click', () => this.saveDocument());
    
    // Export button
    const exportButton = buttonsEl.createEl('button', {
      cls: 'oh-my-cv-button oh-my-cv-export-button',
      text: 'Export PDF',
    });
    exportButton.addEventListener('click', () => this.exportToPDF());
    
    // Settings button
    const settingsButton = buttonsEl.createEl('button', {
      cls: 'oh-my-cv-button oh-my-cv-settings-button',
      text: 'Settings',
    });
    settingsButton.addEventListener('click', () => this.openSettings());
  }

  /**
   * Create the main content area with editor and preview
   */
  private createMainContent(isSidePanel: boolean = false): void {
    const mainContentEl = this.contentEl.createDiv({ cls: 'oh-my-cv-main-content' });
    
    // Apply special class for side panel mode to change layout to vertical
    if (isSidePanel) {
      mainContentEl.addClass('oh-my-cv-side-panel-content');
    }
    
    // Create editor container
    const editorContainerEl = mainContentEl.createDiv({ cls: 'oh-my-cv-editor-container' });
    editorContainerEl.createEl('h3', { text: 'Markdown Editor' });
    
    // Modify layout based on whether we're in side panel mode
    if (isSidePanel) {
      editorContainerEl.addClass('oh-my-cv-side-panel-editor');
    }
    
    // Editor area
    this.editorEl = editorContainerEl.createEl('textarea', { 
      cls: 'oh-my-cv-editor',
      attr: { spellcheck: 'true' } 
    });
    
    // Add template selector - in side panel, make it more compact
    const templateSelectorContainer = editorContainerEl.createDiv({
      cls: isSidePanel ? 
        'oh-my-cv-template-selector-wrapper oh-my-cv-side-panel-selector' : 
        'oh-my-cv-template-selector-wrapper'
    });
    
    new TemplateSelector(templateSelectorContainer, (template) => {
      this.applyTemplate(template.id);
    });
    
    // Toolbar for formatting
    this.toolbarEl = editorContainerEl.createDiv({
      cls: isSidePanel ? 
        'oh-my-cv-toolbar oh-my-cv-side-panel-toolbar' : 
        'oh-my-cv-toolbar'
    });
    this.createToolbar();
    
    // Create preview container
    const previewContainerEl = mainContentEl.createDiv({ cls: 'oh-my-cv-preview-container' });
    previewContainerEl.createEl('h3', { text: 'Live Preview' });
    
    // Add special class for side panel preview
    if (isSidePanel) {
      previewContainerEl.addClass('oh-my-cv-side-panel-preview');
    }
    
    // Create the preview element
    this.previewEl = previewContainerEl.createDiv({ cls: 'oh-my-cv-preview' });
  }

  /**
   * Create the toolbar with formatting buttons
   */
  private createToolbar(): void {
    // Clear any existing buttons
    this.toolbarEl.empty();
    
    // Helper function to create toolbar buttons
    const addButton = (icon: string, title: string, callback: () => void) => {
      const button = this.toolbarEl.createEl('button', {
        cls: `oh-my-cv-toolbar-button`,
        attr: { title }
      });
      setIcon(button, icon);
      button.addEventListener('click', callback);
      return button;
    };
    
    // Add buttons for common formatting
    addButton('heading-1', 'Heading 1', () => this.insertTextAtCursor('# ', ''));
    addButton('heading-2', 'Heading 2', () => this.insertTextAtCursor('## ', ''));
    addButton('heading-3', 'Heading 3', () => this.insertTextAtCursor('### ', ''));
    addButton('bold', 'Bold', () => this.insertTextAtCursor('**', '**'));
    addButton('italic', 'Italic', () => this.insertTextAtCursor('*', '*'));
    addButton('list', 'Bullet List', () => this.insertTextAtCursor('- ', ''));
    addButton('link', 'Link', () => this.insertTextAtCursor('[', '](url)'));
    addButton('table', 'Table', () => this.insertTable());
    addButton('horizontal-split', 'Page Break', () => this.insertTextAtCursor('\\newpage\n', ''));
    
    // Create template selector
    const templateSelect = this.toolbarEl.createEl('select', {
      cls: 'oh-my-cv-template-select',
      attr: { title: 'Apply Template' }
    });
    
    // Add option for selecting templates
    const defaultOption = templateSelect.createEl('option', {
      text: 'Select Template',
      attr: { value: '' }
    });
    
    // Add options for each template
    const templates = getPluginInstance().settings.getTemplates();
    templates.forEach(template => {
      templateSelect.createEl('option', {
        text: template.name,
        attr: { value: template.id }
      });
    });
    
    // Handle template selection
    templateSelect.addEventListener('change', (e: Event) => {
      const select = e.target as HTMLSelectElement;
      const templateId = select.value;
      
      if (templateId) {
        this.applyTemplate(templateId);
        // Reset selector
        select.value = '';
      }
    });
  }

  /**
   * Create the status bar
   */
  private createStatusBar(): void {
    this.statusBarEl = this.mainContainerEl.createDiv({ cls: 'oh-my-cv-status-bar' });
    this.updateStatusBar();
  }

  /**
   * Update the status bar with current document info
   */
  private updateStatusBar(): void {
    this.statusBarEl.empty();
    
    if (this.currentDocument) {
      // Show document path
      const pathEl = this.statusBarEl.createSpan({ cls: 'oh-my-cv-status-path' });
      pathEl.setText(this.currentDocument.path);
      
      // Show last modified time
      const lastModifiedEl = this.statusBarEl.createSpan({ cls: 'oh-my-cv-status-modified' });
      const date = new Date(this.currentDocument.metadata.lastModified);
      lastModifiedEl.setText(`Last modified: ${date.toLocaleString()}`);
      
      // Show save status
      const saveStatusEl = this.statusBarEl.createSpan({ cls: 'oh-my-cv-status-save' });
      saveStatusEl.setText(this.unsavedChanges ? 'Unsaved changes' : 'Saved');
      
      // Add class if there are unsaved changes
      if (this.unsavedChanges) {
        saveStatusEl.addClass('oh-my-cv-status-unsaved');
      }
    } else {
      this.statusBarEl.setText('No document loaded');
    }
  }

  /**
   * Register events for the view
   */
  private registerEvents(): void {
    // Listen for changes in the editor
    this.editorEl.addEventListener('input', () => {
      this.handleEditorChange();
    });
    
    // Listen for keyboard shortcuts
    this.editorEl.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        this.saveDocument();
      }
    });
  }

  /**
   * Handle changes in the editor
   */
  private handleEditorChange(): void {
    // Mark as having unsaved changes
    this.unsavedChanges = true;
    
    // Update the preview
    this.updatePreview();
    
    // Update the status bar
    this.updateStatusBar();
  }

  /**
   * Update the preview with the current content
   */
  private updatePreview(): void {
    const content = this.editorEl.value;
    
    if (this.currentDocument) {
      // Update the document content
      this.currentDocument.content = content;
    }
    
    // Render the markdown
    this.markdownService.renderMarkdown(content, this.previewEl);
  }

  /**
   * Save the current document
   */
  private async saveDocument(): Promise<void> {
    if (!this.currentDocument) {
      return;
    }
    
    try {
      // Update the document content
      this.currentDocument.content = this.editorEl.value;
      
      // Save the document
      await getPluginInstance().storage.saveCV(this.currentDocument);
      
      // Mark as saved
      this.unsavedChanges = false;
      
      // Update the status bar
      this.updateStatusBar();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  }

  /**
   * Export the current document to PDF
   */
  public async exportToPDF(): Promise<void> {
    if (!this.currentDocument) {
      return;
    }
    
    try {
      await this.exportService.exportToPDF(this.previewEl, this.currentDocument);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }

  /**
   * Open the settings panel
   */
  private openSettings(): void {
    // Show a notice to the user about opening settings
    new Notice('Opening settings... Please navigate to the Oh My CV tab');
    
    // Use Obsidian command system to open settings
    // This is a safer way to work with Obsidian's API which might change
    setTimeout(() => {
      // Use the settings command if available, otherwise show a message
      try {
        // @ts-ignore - Obsidian's typings may not include all available API methods
        this.app.setting.open();
      } catch (e) {
        new Notice('Please open Settings and navigate to the Oh My CV tab');
      }
    }, 100);
  }

  /**
   * Insert text at the current cursor position
   * @param before Text to insert before the selection
   * @param after Text to insert after the selection
   */
  private insertTextAtCursor(before: string, after: string): void {
    const editor = this.editorEl;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    const newText = before + selectedText + after;
    editor.setRangeText(newText, start, end, 'select');
    editor.focus();
    
    // Update the content and preview
    this.handleEditorChange();
  }

  /**
   * Insert a markdown table template
   */
  private insertTable(): void {
    const tableTemplate = '| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |\n| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |\n';
    this.insertTextAtCursor(tableTemplate, '');
  }

  /**
   * Apply a template to the editor
   * @param templateId The ID of the template to apply
   */
  private applyTemplate(templateId: string): void {
    // Check for built-in templates first
    const template = getTemplateById(templateId);
    
    // If not found, check user templates
    const userTemplate = template ? null : 
      getPluginInstance().settings.getSettings().templates.find(t => t.id === templateId);
    
    const selectedTemplate = template || userTemplate;
    
    if (selectedTemplate) {
      // Ask for confirmation if there's existing content
      if (this.editorEl.value.trim() !== '') {
        const warningMessage = 'Applying a template will replace your current content. Are you sure?';
        if (!confirm(warningMessage)) {
          return;
        }
      }
      
      // Apply the template
      this.editorEl.value = selectedTemplate.content;
      this.handleEditorChange();
      
      // Apply the template's styling
      if (selectedTemplate.style) {
        this.applyTemplateStyle(selectedTemplate.style);
      }
      
      // Show success message
      new Notice(`Template '${selectedTemplate.name}' applied successfully`);
    } else {
      new Notice('Template not found', 3000);
    }
  }
  
  /**
   * Apply template styling to the preview
   * @param style Template style to apply
   */
  private applyTemplateStyle(style: any): void {
    const { theme } = style;
    
    // Apply theme color to preview
    if (theme && theme.primaryColor) {
      const docEl = document.documentElement as HTMLElement;
      docEl.style.setProperty('--theme-color', theme.primaryColor);
      
      // Apply the style to the preview container
      if (this.previewEl) {
        // Apply primary color to headings
        const headings = this.previewEl.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
          (heading as HTMLElement).style.color = theme.primaryColor;
        });
        
        // Apply other styling as needed
        if (theme.backgroundColor) {
          this.previewEl.style.backgroundColor = theme.backgroundColor;
        }
        
        if (theme.textColor) {
          this.previewEl.style.color = theme.textColor;
        }
        
        // Apply custom CSS if provided
        if (style.customCSS) {
          // Create a style element for the custom CSS
          const styleElement = document.createElement('style');
          styleElement.textContent = style.customCSS;
          this.previewEl.appendChild(styleElement);
        }
      }
    }
  }

  /**
   * Load a CV document into the editor
   * @param document The CV document to load
   */
  async loadDocument(document: CVDocument): Promise<void> {
    try {
      // Store the document
      this.currentDocument = document;
      
      // Update the title
      this.leaf.setViewState({
        type: CV_EDITOR_VIEW_TYPE,
        state: { path: document.path }
      });
      
      // Set the editor content
      this.editorEl.value = document.content;
      
      // Update the preview
      this.updatePreview();
      
      // Mark as saved (since we just loaded it)
      this.unsavedChanges = false;
      
      // Update the status bar
      this.updateStatusBar();
    } catch (error) {
      console.error('Error loading document:', error);
    }
  }

  /**
   * Create a new document from a template
   * @param templateId The ID of the template to use
   */
  async newDocumentFromTemplate(templateId: string = 'default'): Promise<void> {
    try {
      const plugin = getPluginInstance();
      const template = plugin.settings.getTemplateById(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Get default filename
      const title = prompt('Enter a title for your CV:', template.name);
      
      if (!title) {
        return; // User cancelled
      }
      
      // Create the document
      const document = await plugin.storage.createCV(
        title,
        template.content,
        {
          title
        }
      );
      
      // Load the document
      await this.loadDocument(document);
    } catch (error) {
      console.error('Error creating new document:', error);
    }
  }
}
