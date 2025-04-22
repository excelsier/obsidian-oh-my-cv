/**
 * Export service for the Oh My CV plugin
 * Handles PDF generation and export functionality
 */

import { Notice, TFile, Modal, Setting } from 'obsidian';
import { PDFExportOptions, CVDocument, CVMetadata, CVTemplate, CVTheme } from '../core/types';
import { getPluginInstance } from '../core/plugin-instance';
import { getTemplateById } from '../core/templates';
import { PDFExportOptionsModal } from '../ui/export-modal';
import html2pdf from 'html2pdf.js';

/**
 * Service for handling CV exports to PDF and other formats
 */
export class ExportService {
  private plugin: any;

  /**
   * Create a new export service
   * @param plugin The Oh My CV plugin instance
   */
  constructor(plugin?: any) {
    this.plugin = plugin || getPluginInstance();
  }

  /**
   * Export CV to PDF
   * @param contentElement The HTML element containing the CV content
   * @param document The CV document metadata
   * @param options Export options
   */
  async exportToPDF(
    contentElement: HTMLElement,
    document: CVDocument,
    options?: Partial<PDFExportOptions>
  ): Promise<void> {
    try {
      // Show export notification
      new Notice('Preparing PDF export...');

      // Create a clone of the content element to avoid modifying the original
      const clone = contentElement.cloneNode(true) as HTMLElement;

      // Apply export styling
      this.applyExportStyling(clone, document.metadata);

      // Merge export options
      const defaultFilename = `${document.metadata.title || 'CV'}.pdf`;
      const exportOptions: PDFExportOptions = {
        filename: defaultFilename,
        pageSize: document.metadata.pageSize,
        orientation: document.metadata.orientation || 'portrait',
        margins: document.metadata.margins,
        includeHeader: false,
        includeFooter: false,
        includePageNumbers: true,
        embedFonts: true,
        imageQuality: 90,
        ...options
      };

      // Apply header and footer if needed
      if (exportOptions.includeHeader && exportOptions.headerContent) {
        this.addHeader(clone, exportOptions.headerContent);
      }

      if (exportOptions.includeFooter && exportOptions.footerContent) {
        this.addFooter(clone, exportOptions.footerContent);
      }

      if (exportOptions.includePageNumbers) {
        this.addPageNumbers(clone);
      }

      // Configure html2pdf options
      const html2pdfOptions = {
        margin: [
          exportOptions.margins.top,
          exportOptions.margins.right,
          exportOptions.margins.bottom,
          exportOptions.margins.left
        ],
        filename: exportOptions.filename,
        image: { 
          type: 'jpeg', 
          quality: (exportOptions.imageQuality || 90) / 100 
        },
        html2canvas: { 
          scale: 2,
          logging: false,
          dpi: 192,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: exportOptions.pageSize,
          orientation: exportOptions.orientation || 'portrait' as 'portrait' | 'landscape'
        },
        // Handle font embedding
        fontFaces: exportOptions.embedFonts ? true : false
      };

      // Generate the PDF
      await html2pdf()
        .set(html2pdfOptions)
        .from(clone)
        .save();

      new Notice('PDF export completed successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      new Notice(`PDF export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Apply styling for PDF export
   * @param element The element to style
   * @param metadata The CV metadata
   * @param template Optional template to use for styling
   */
  private applyExportStyling(element: HTMLElement, metadata: CVMetadata, template?: CVTemplate): void {
    // Add export-specific classes
    element.classList.add('oh-my-cv-export');
    
    // Check if we have a template with styling
    const templateStyle = template?.style;
    const theme: CVTheme = templateStyle?.theme || {
      primaryColor: metadata.themeColor || '#4051b5',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      headingFont: metadata.fontFamily || 'Arial, sans-serif',
      bodyFont: metadata.fontFamily || 'Arial, sans-serif',
      fontSize: `${metadata.fontSize || 11}pt`,
      lineHeight: `${metadata.lineHeight || 1.5}`
    };
    
    // Apply template or metadata styling
    const fontFamily = theme.bodyFont || metadata.fontFamily || 'Arial, sans-serif';
    const fontSize = theme.fontSize || `${metadata.fontSize || 11}pt`;
    const lineHeight = theme.lineHeight || `${metadata.lineHeight || 1.5}`;
    const textColor = theme.textColor || '#000';
    const bgColor = theme.backgroundColor || '#fff';
    const themeColor = theme.primaryColor || metadata.themeColor || '#4051b5';
    
    element.style.fontFamily = fontFamily;
    element.style.fontSize = fontSize;
    element.style.lineHeight = lineHeight;
    element.style.color = textColor;
    element.style.backgroundColor = bgColor;

    // Set theme color as a CSS variable
    element.style.setProperty('--theme-color', themeColor);

    // Apply custom CSS if available
    if (metadata.customCss) {
      // Create a style element for the custom CSS
      const styleElement = document.createElement('style');
      styleElement.textContent = metadata.customCss;
      element.appendChild(styleElement);
    }

    // Ensure all links are absolute and styled correctly
    element.querySelectorAll('a').forEach(link => {
      // Style links with theme color
      const linkEl = link as HTMLElement;
      const linkColor = templateStyle?.theme.linkColor || templateStyle?.theme.primaryColor || metadata.themeColor;
      linkEl.style.color = linkColor;
      linkEl.style.textDecoration = 'none';

      // Convert relative URLs to absolute
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
        link.setAttribute('href', `https://${href}`);
      }
    });

    // Add page break elements styling
    element.querySelectorAll('.oh-my-cv-page-break').forEach(pageBreak => {
      pageBreak.setAttribute('style', 'page-break-after: always; break-after: page;');
      
      // Remove any indicator elements
      pageBreak.querySelectorAll('.oh-my-cv-page-break-indicator').forEach(indicator => {
        indicator.remove();
      });
    });

    // Ensure section headings don't get orphaned
    element.querySelectorAll('h2, h3').forEach(heading => {
      const headingEl = heading as HTMLElement;
      // Use setAttribute for CSS properties that TypeScript might not recognize
      headingEl.style.setProperty('page-break-after', 'avoid');
      headingEl.style.setProperty('break-after', 'avoid');
      headingEl.style.setProperty('page-break-before', 'auto');
      headingEl.style.setProperty('break-before', 'auto');
    });

    // Keep list items together when possible
    element.querySelectorAll('li').forEach(item => {
      const itemEl = item as HTMLElement;
      itemEl.style.setProperty('page-break-inside', 'avoid');
      itemEl.style.setProperty('break-inside', 'avoid');
    });
  }

  /**
   * Add a header to the document
   * @param element The container element
   * @param headerContent The header content
   */
  private addHeader(element: HTMLElement, headerContent: string): void {
    const headerElement = document.createElement('div');
    headerElement.classList.add('oh-my-cv-header');
    headerElement.innerHTML = headerContent;
    element.prepend(headerElement);
  }

  /**
   * Add a footer to the document
   * @param element The container element
   * @param footerContent The footer content
   */
  private addFooter(element: HTMLElement, footerContent: string): void {
    const footerElement = document.createElement('div');
    footerElement.classList.add('oh-my-cv-footer');
    footerElement.innerHTML = footerContent;
    element.appendChild(footerElement);
  }

  /**
   * Add page numbers to the document
   * @param element The container element
   */
  private addPageNumbers(element: HTMLElement): void {
    // Note: This is a basic implementation. Real page numbers require special handling
    // during the PDF generation process, which html2pdf.js doesn't directly support.
    // For a more robust solution, we would need to use a different PDF library
    // or implement a custom solution.
    
    const pageNumberStyle = document.createElement('style');
    pageNumberStyle.textContent = `
      .oh-my-cv-page-number::after {
        content: counter(page);
        counter-increment: page;
      }
    `;
    element.appendChild(pageNumberStyle);
    
    const pageNumberElement = document.createElement('div');
    pageNumberElement.classList.add('oh-my-cv-page-number');
    pageNumberElement.innerHTML = 'Page ';
    
    // Add to footer if it exists, otherwise append to the document
    const footer = element.querySelector('.oh-my-cv-footer') as HTMLElement | null;
    if (footer) {
      footer.appendChild(pageNumberElement);
    } else {
      const footerElement = document.createElement('div');
      footerElement.classList.add('oh-my-cv-footer');
      footerElement.appendChild(pageNumberElement);
      element.appendChild(footerElement);
    }
  }

  /**
   * Generate HTML for export
   * @param document The CV document or content string
   * @param template Optional template to use for styling
   * @returns HTML string ready for export
   */
  generateHTML(document: CVDocument | string, template?: CVTemplate): string {
    // Create a container for the export content
    const content = typeof document === 'string' ? document : document.content;
    const metadata = typeof document === 'string' ? null : document.metadata;
    
    // Create a div with the content
    const container = window.document.createElement('div');
    container.className = 'oh-my-cv-export-container';
    container.innerHTML = this.processMarkdown(content);
    
    // Apply styling
    if (metadata) {
      this.applyExportStyling(container as HTMLElement, metadata, template);
    } else if (template) {
      // Apply basic template styling without metadata
      const containerEl = container as HTMLElement;
      if (template.style && template.style.theme) {
        containerEl.style.fontFamily = template.style.theme.bodyFont || 'sans-serif';
        containerEl.style.color = template.style.theme.textColor || '#000';
        containerEl.style.backgroundColor = template.style.theme.backgroundColor || '#fff';
        containerEl.style.setProperty('--theme-color', template.style.theme.primaryColor || '#4051b5');
      } else {
        containerEl.style.fontFamily = 'sans-serif';
        containerEl.style.color = '#000';
        containerEl.style.backgroundColor = '#fff';
        containerEl.style.setProperty('--theme-color', '#4051b5');
      }
    }
    
    return container.outerHTML;
  }
  
  /**
   * Process markdown for export
   * @param markdown The markdown content
   * @returns Processed HTML
   */
  private processMarkdown(markdown: string): string {
    // Process custom CV markers - this is a simplified version
    // In a full implementation, use a proper markdown processor
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*$)/gm, '<li>$1</li>')
      .replace(/\cvtag\{(.*?)\}/g, '<span class="oh-my-cv-tag">$1</span>')
      .replace(/\cvskill\{(.*?)\}\{(.*?)\}/g, 
        '<div class="oh-my-cv-skill"><div class="oh-my-cv-skill-name">$1</div>' +
        '<div class="oh-my-cv-skill-level" style="width: $2%;"></div></div>')
      .replace(/\daterange\{(.*?)\}\{(.*?)\}/g, 
        '<div class="oh-my-cv-date-range"><span class="oh-my-cv-date-start">$1</span> – ' +
        '<span class="oh-my-cv-date-end">$2</span></div>')
      .replace(/\\newpage/g, '<div class="oh-my-cv-page-break"></div>')
      .replace(/\textbf\{(.*?)\}/g, '<strong>$1</strong>')
      .replace(/\textit\{(.*?)\}/g, '<em>$1</em>')
      .replace(/\textsc\{(.*?)\}/g, '<span class="small-caps">$1</span>');
    
    // Wrap lists
    html = html.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)*/g, (match) => {
      return `<ul class="oh-my-cv-list">${match}</ul>`;
    });
    
    return html;
  }
  
  /**
   * Show Export Dialog
   * @param document The CV document to export
   */
  showExportDialog(document: CVDocument): void {
    // We'll implement the ExportDialog class later
    new PDFExportOptionsModal(document, this).open();
  }
  
  /**
   * Export to PDF with options
   * This is a direct entry point for simple PDF export
   * @param document The CV document to export
   * @param options Export options
   */
  async exportWithOptions(document: CVDocument, options: Partial<PDFExportOptions>): Promise<void> {
    // Find the preview element
    const containerEl = window.document.createElement('div');
    containerEl.innerHTML = this.generateHTML(document);
    
    try {
      await this.exportToPDF(containerEl as HTMLElement, document, options);
    } catch (error) {
      console.error('Export error:', error);
      new Notice(`Failed to export PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export CV to Markdown file
   * @param document The CV document
   * @param filename The target filename
   */
  async exportToMarkdown(document: CVDocument, filename?: string): Promise<void> {
    try {
      // Generate the markdown content
      const frontmatter = `---\n${Object.entries(document.metadata)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}:\n${Object.entries(value)
              .map(([subKey, subValue]) => `  ${subKey}: ${subValue}`)
              .join('\n')}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n')}
---`;

      const markdownContent = `${frontmatter}\n\n${document.content}`;

      // Set filename
      const outputFilename = filename || `${document.metadata.title || 'CV'}.md`;

      // Save to file
      const adapter = this.plugin.app.vault.adapter;
      const savePath = await this.getSavePath(outputFilename);
      
      if (savePath) {
        await adapter.write(savePath, markdownContent);
        new Notice(`Markdown exported to ${savePath}`);
      }
    } catch (error) {
      console.error('Markdown export error:', error);
      new Notice(`Markdown export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a save path for the exported file
   * @param filename The suggested filename
   * @returns The full save path, or null if cancelled
   */
  private async getSavePath(filename: string): Promise<string | null> {
    // In a real implementation, this would show a file picker dialog
    // For now, we'll just save to the root of the vault
    return `${filename}`;
  }
}
