/**
 * PDF Export Options Modal
 * Provides UI for setting PDF export options
 */

import { Modal, Setting, ButtonComponent, DropdownComponent, Notice, setIcon } from 'obsidian';
import { CVDocument, PDFExportOptions } from '../core/types';
import { ExportService } from '../services/export-service';
import { getPluginInstance } from '../core/plugin-instance';

/**
 * Modal for configuring PDF export options
 */
export class PDFExportOptionsModal extends Modal {
  private document: CVDocument;
  private exportService: ExportService;
  private options: PDFExportOptions;

  /**
   * Create a new PDF export options modal
   * @param document The CV document to export
   * @param exportService The export service
   */
  constructor(document: CVDocument, exportService: ExportService) {
    super(getPluginInstance().app);
    this.document = document;
    this.exportService = exportService;

    // Set default options based on document metadata and plugin settings
    const settings = getPluginInstance().settings.getSettings();
    const lastExportOptions = getPluginInstance().settings.getLastExportOptions();
    
    this.options = {
      filename: `${document.metadata.title || 'CV'}.pdf`,
      pageSize: document.metadata.pageSize || lastExportOptions?.pageSize || settings.defaultPageSize,
      orientation: document.metadata.orientation || lastExportOptions?.orientation || 'portrait',
      margins: document.metadata.margins || lastExportOptions?.margins || settings.defaultMargins,
      includeHeader: lastExportOptions?.includeHeader || false,
      includeFooter: lastExportOptions?.includeFooter || false,
      includePageNumbers: lastExportOptions?.includePageNumbers || true,
      headerContent: lastExportOptions?.headerContent || '',
      footerContent: lastExportOptions?.footerContent || '',
      embedFonts: lastExportOptions?.embedFonts || true,
      imageQuality: lastExportOptions?.imageQuality || 90,
    };
  }
  
  /**
   * Update the page preview to reflect current settings
   * @param previewEl The preview element to update
   */
  private updatePagePreview(previewEl: HTMLElement): void {
    // Clear existing content
    previewEl.empty();
    
    // Set preview class based on page size and orientation
    previewEl.className = 'oh-my-cv-page-preview';
    previewEl.addClass(`size-${this.options.pageSize.toLowerCase()}`);
    previewEl.addClass(`orientation-${this.options.orientation}`);
    
    // Add page content preview
    const pageContent = previewEl.createDiv({ cls: 'oh-my-cv-page-content' });
    
    // Add margin indicators
    const margins = this.options.margins;
    const marginTop = pageContent.createDiv({ cls: 'oh-my-cv-margin oh-my-cv-margin-top' });
    marginTop.style.height = `${margins.top / 4}px`;
    
    const marginRight = pageContent.createDiv({ cls: 'oh-my-cv-margin oh-my-cv-margin-right' });
    marginRight.style.width = `${margins.right / 4}px`;
    
    const marginBottom = pageContent.createDiv({ cls: 'oh-my-cv-margin oh-my-cv-margin-bottom' });
    marginBottom.style.height = `${margins.bottom / 4}px`;
    
    const marginLeft = pageContent.createDiv({ cls: 'oh-my-cv-margin oh-my-cv-margin-left' });
    marginLeft.style.width = `${margins.left / 4}px`;
    
    // Add content area
    pageContent.createDiv({ cls: 'oh-my-cv-content-area' });
  }

  /**
   * Modal content
   */
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('oh-my-cv-export-modal');
    
    // Title
    contentEl.createEl('h2', { text: 'Export to PDF' });
    
    // Description
    contentEl.createEl('p', {
      text: 'Configure export options for your CV PDF.',
      cls: 'oh-my-cv-export-description'
    });
    
    // Create tabs container
    const tabsContainer = contentEl.createDiv({ cls: 'oh-my-cv-tabs' });
    
    // Create tab buttons
    const pageSetupTab = tabsContainer.createDiv({ cls: 'oh-my-cv-tab active', attr: { 'data-tab': 'page-setup' } });
    setIcon(pageSetupTab.createSpan(), 'file-text');
    pageSetupTab.createSpan({ text: 'Page Setup' });
    
    const contentTab = tabsContainer.createDiv({ cls: 'oh-my-cv-tab', attr: { 'data-tab': 'content' } });
    setIcon(contentTab.createSpan(), 'text');
    contentTab.createSpan({ text: 'Content' });
    
    const stylingTab = tabsContainer.createDiv({ cls: 'oh-my-cv-tab', attr: { 'data-tab': 'styling' } });
    setIcon(stylingTab.createSpan(), 'brush');
    stylingTab.createSpan({ text: 'Styling' });
    
    // Create content containers for each tab
    const tabContentContainer = contentEl.createDiv({ cls: 'oh-my-cv-tab-content' });
    
    // Page Setup tab content
    const pageSetupContent = tabContentContainer.createDiv({ 
      cls: 'oh-my-cv-tab-pane active', 
      attr: { 'data-tab-content': 'page-setup' } 
    });
    
    // Content tab content
    const contentTabContent = tabContentContainer.createDiv({ 
      cls: 'oh-my-cv-tab-pane', 
      attr: { 'data-tab-content': 'content' } 
    });
    
    // Styling tab content
    const stylingTabContent = tabContentContainer.createDiv({ 
      cls: 'oh-my-cv-tab-pane', 
      attr: { 'data-tab-content': 'styling' } 
    });
    
    // Add tab switching logic
    const tabs = tabsContainer.querySelectorAll('.oh-my-cv-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.removeClass('active'));
        
        // Add active class to clicked tab
        tab.addClass('active');
        
        // Hide all tab content
        const tabContents = tabContentContainer.querySelectorAll('.oh-my-cv-tab-pane');
        tabContents.forEach(content => content.removeClass('active'));
        
        // Show content for active tab
        const tabName = tab.getAttribute('data-tab');
        const activeContent = tabContentContainer.querySelector(`[data-tab-content="${tabName}"]`);
        if (activeContent) activeContent.addClass('active');
      });
    });
    
    // File name setting (in page setup tab)
    new Setting(pageSetupContent)
      .setName('File name')
      .setDesc('Name of the exported PDF file')
      .addText(text => text
        .setValue(this.options.filename)
        .onChange(value => {
          // Ensure filename ends with .pdf
          if (!value.endsWith('.pdf')) {
            value += '.pdf';
          }
          this.options.filename = value;
        }));
    
    // Create a container for the page size preview
    const pageSizePreviewContainer = pageSetupContent.createDiv({ cls: 'oh-my-cv-page-preview-container' });
    const pageSizePreview = pageSizePreviewContainer.createDiv({ cls: 'oh-my-cv-page-preview' });
    
    // Page size setting
    new Setting(pageSetupContent)
      .setName('Page size')
      .setDesc('Choose the paper size for your CV')
      .addDropdown(dropdown => {
        dropdown
          .addOption('A4', 'A4')
          .addOption('LETTER', 'US Letter')
          .addOption('LEGAL', 'US Legal')
          .addOption('TABLOID', 'Tabloid')
          .setValue(this.options.pageSize)
          .onChange(value => {
            this.options.pageSize = value as 'A4' | 'LETTER' | 'LEGAL' | 'TABLOID';
            this.updatePagePreview(pageSizePreview);
          });
      });
      
    // Page orientation
    new Setting(pageSetupContent)
      .setName('Orientation')
      .setDesc('Choose the orientation of your PDF')
      .addDropdown(dropdown => {
        dropdown
          .addOption('portrait', 'Portrait')
          .addOption('landscape', 'Landscape')
          .setValue(this.options.orientation || 'portrait')
          .onChange(value => {
            this.options.orientation = value as 'portrait' | 'landscape';
            this.updatePagePreview(pageSizePreview);
          });
      });
    
    // Margin settings
    const marginSetting = new Setting(pageSetupContent)
      .setName('Margins')
      .setDesc('Set page margins in millimeters');
    
    // Margin container
    const marginContainer = pageSetupContent.createDiv({ cls: 'oh-my-cv-margins-container' });
    
    // Update the page preview initially
    this.updatePagePreview(pageSizePreview);
    
    // Top margin
    new Setting(marginContainer)
      .setName('Top')
      .addText(text => text
        .setValue(this.options.margins.top.toString())
        .onChange(value => {
          const margin = parseInt(value);
          if (!isNaN(margin)) {
            this.options.margins.top = margin;
          }
        }));
    
    // Right margin
    new Setting(marginContainer)
      .setName('Right')
      .addText(text => text
        .setValue(this.options.margins.right.toString())
        .onChange(value => {
          const margin = parseInt(value);
          if (!isNaN(margin)) {
            this.options.margins.right = margin;
          }
        }));
    
    // Bottom margin
    new Setting(marginContainer)
      .setName('Bottom')
      .addText(text => text
        .setValue(this.options.margins.bottom.toString())
        .onChange(value => {
          const margin = parseInt(value);
          if (!isNaN(margin)) {
            this.options.margins.bottom = margin;
          }
        }));
    
    // Left margin
    new Setting(marginContainer)
      .setName('Left')
      .addText(text => text
        .setValue(this.options.margins.left.toString())
        .onChange(value => {
          const margin = parseInt(value);
          if (!isNaN(margin)) {
            this.options.margins.left = margin;
          }
        }));
    
    // Content options in the Content tab
    // Include page numbers
    new Setting(contentTabContent)
      .setName('Page numbers')
      .setDesc('Include page numbers in the footer')
      .addToggle(toggle => toggle
        .setValue(this.options.includePageNumbers)
        .onChange(value => {
          this.options.includePageNumbers = value;
        }));
    
    // Include header
    const headerSetting = new Setting(contentTabContent)
      .setName('Header')
      .setDesc('Include a header on each page')
      .addToggle(toggle => toggle
        .setValue(this.options.includeHeader)
        .onChange(value => {
          this.options.includeHeader = value;
          headerContentSetting.setDisabled(!value);
        }));
    
    // Header content
    const headerContentSetting = new Setting(contentTabContent)
      .setName('Header content')
      .setDesc('Text to include in the header')
      .addText(text => text
        .setValue(this.options.headerContent || '')
        .onChange(value => {
          this.options.headerContent = value;
        }));
    
    headerContentSetting.setDisabled(!this.options.includeHeader);
    
    // Include footer
    const footerSetting = new Setting(contentTabContent)
      .setName('Footer')
      .setDesc('Include a footer on each page')
      .addToggle(toggle => toggle
        .setValue(this.options.includeFooter)
        .onChange(value => {
          this.options.includeFooter = value;
          footerContentSetting.setDisabled(!value);
        }));
    
    // Footer content
    const footerContentSetting = new Setting(contentTabContent)
      .setName('Footer content')
      .setDesc('Text to include in the footer')
      .addText(text => text
        .setValue(this.options.footerContent || '')
        .onChange(value => {
          this.options.footerContent = value;
        }));
    
    footerContentSetting.setDisabled(!this.options.includeFooter);
    
    // Styling options in the Styling tab
    new Setting(stylingTabContent)
      .setName('Font embedding')
      .setDesc('Embed fonts in the PDF for consistent display')
      .addToggle(toggle => toggle
        .setValue(this.options.embedFonts || true)
        .onChange(value => {
          this.options.embedFonts = value;
        }));
        
    new Setting(stylingTabContent)
      .setName('Image quality')
      .setDesc('Quality of images in the PDF (higher values increase file size)')
      .addSlider(slider => slider
        .setLimits(60, 100, 5)
        .setValue(this.options.imageQuality || 90)
        .setDynamicTooltip()
        .onChange(value => {
          this.options.imageQuality = value;
        }));
    
    // Buttons container
    const buttonsContainer = contentEl.createDiv({ cls: 'oh-my-cv-export-buttons' });
    
    // Cancel button
    new ButtonComponent(buttonsContainer)
      .setButtonText('Cancel')
      .onClick(() => this.close())
      .buttonEl.addClass('oh-my-cv-export-cancel-button');
    
    // Export button
    new ButtonComponent(buttonsContainer)
      .setButtonText('Export PDF')
      .setCta()
      .onClick(() => {
        this.close();
        this.exportPDF();
        
        // Save the most recent export options to settings
        const plugin = getPluginInstance();
        plugin.settings.setLastExportOptions(this.options);
      })
      .buttonEl.addClass('oh-my-cv-export-button');
  }
  
  /**
   * Export PDF with selected options
   */
  private async exportPDF() {
    try {
      // Find the preview element
      const containerEl = document.createElement('div');
      containerEl.innerHTML = this.exportService.generateHTML(this.document);
      
      await this.exportService.exportToPDF(containerEl as HTMLElement, this.document, this.options);
    } catch (error) {
      console.error('Export error:', error);
      new Notice(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Clean up when the modal is closed
   */
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
