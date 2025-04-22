/**
 * Markdown service for the Oh My CV plugin
 * Handles Markdown processing with extensions for CV rendering
 */

import { MarkdownRenderer, MarkdownView, Component } from 'obsidian';
import { CASING_RULES } from '../core/constants';
import { getPluginInstance } from '../core/plugin-instance';

/**
 * Service for processing Markdown with specialized extensions for CVs
 */
export class MarkdownService {
  private plugin: any; // Using plugin instance
  private component: Component;

  /**
   * Create a new Markdown service
   * @param plugin The Oh My CV plugin instance
   * @param component The component to use for Markdown rendering (typically the view)
   */
  constructor(component: Component) {
    this.plugin = getPluginInstance();
    this.component = component;
  }

  /**
   * Render Markdown content to HTML
   * @param markdown The markdown content to render
   * @param container The container element to render into
   */
  async renderMarkdown(markdown: string, container: HTMLElement): Promise<void> {
    try {
      // Apply pre-processing
      let processedMarkdown = markdown;
      
      // Apply auto-casing if enabled
      if (this.plugin.settings.isAutoCasingEnabled()) {
        processedMarkdown = this.applyCasingRules(processedMarkdown);
      }
      
      // Process custom LaTeX-style commands
      processedMarkdown = this.processLatexStyleCommands(processedMarkdown);
      
      // Clear the container
      container.empty();
      
      // Use Obsidian's Markdown renderer
      await MarkdownRenderer.renderMarkdown(
        processedMarkdown,
        container,
        '',
        this.component
      );
      
      // Apply post-processing to the rendered content
      this.postProcessRenderedContent(container);
      
    } catch (error) {
      console.error('Error rendering markdown:', error);
      container.innerHTML = `<div class="oh-my-cv-error">Error rendering markdown: ${error}</div>`;
    }
  }

  /**
   * Apply auto-casing rules to correct common terms
   * @param content The content to process
   * @returns The processed content with correct casing
   */
  private applyCasingRules(content: string): string {
    let result = content;
    
    // Apply each casing rule
    Object.entries(CASING_RULES).forEach(([incorrect, correct]) => {
      // Create regex that matches word boundaries
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      result = result.replace(regex, correct);
    });
    
    return result;
  }

  /**
   * Process LaTeX-style commands
   * @param content The content to process
   * @returns The processed content
   */
  private processLatexStyleCommands(content: string): string {
    let processed = content;
    
    // Handle page breaks
    processed = processed.replace(/\\newpage/g, '<div class="oh-my-cv-page-break"></div>');
    
    // Handle custom spacing
    processed = processed.replace(/\\\\(\[(\d+)px\])?/g, (match, group1, group2) => {
      const pixels = group2 ? parseInt(group2) : 10;
      return `<div style="height: ${pixels}px;"></div>`;
    });
    
    // Handle text formatting commands
    processed = processed.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    processed = processed.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    processed = processed.replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
    processed = processed.replace(/\\textsc\{([^}]+)\}/g, '<span class="small-caps">$1</span>');
    
    // Handle custom CV-specific commands
    processed = processed.replace(/\\cvtag\{([^}]+)\}/g, 
      '<span class="oh-my-cv-tag">$1</span>');
    processed = processed.replace(/\\cvskill\{([^}]+)\}\{([^}]+)\}/g, 
      '<div class="oh-my-cv-skill"><div class="oh-my-cv-skill-name">$1</div><div class="oh-my-cv-skill-level" style="width: $2%;"></div></div>');
    
    // Handle date ranges for experience/education
    processed = processed.replace(/\\daterange\{([^}]+)\}\{([^}]+)\}/g, 
      '<div class="oh-my-cv-date-range"><span class="oh-my-cv-date-start">$1</span> – <span class="oh-my-cv-date-end">$2</span></div>');
      
    // Additional LaTeX commands could be added here
    
    return processed;
  }

  /**
   * Post-process the rendered content for additional styling and features
   * @param container The container with the rendered content
   */
  private postProcessRenderedContent(container: HTMLElement): void {
    // Add classes to elements for styling
    this.addClassesToElements(container);
    
    // Process cross-references if enabled
    if (this.plugin.settings.isTeXSupportEnabled()) {
      this.processCrossReferences(container);
    }
    
    // Visualize page breaks if enabled
    if (this.plugin.settings.isPageBreaksEnabled()) {
      this.visualizePageBreaks(container);
    }
  }

  /**
   * Add specific classes to elements for CV styling
   * @param container The container with the rendered content
   */
  private addClassesToElements(container: HTMLElement): void {
    // Add classes to headings
    container.querySelectorAll('h1').forEach(el => el.classList.add('oh-my-cv-name'));
    container.querySelectorAll('h2').forEach(el => el.classList.add('oh-my-cv-section'));
    container.querySelectorAll('h3').forEach(el => el.classList.add('oh-my-cv-subsection'));
    
    // Add classes to lists
    container.querySelectorAll('ul').forEach(el => el.classList.add('oh-my-cv-list'));
    container.querySelectorAll('li').forEach(el => el.classList.add('oh-my-cv-list-item'));
    
    // Add classes to links
    container.querySelectorAll('a').forEach(el => el.classList.add('oh-my-cv-link'));
    
    // Add classes to paragraphs
    container.querySelectorAll('p').forEach(el => el.classList.add('oh-my-cv-paragraph'));
  }

  /**
   * Process cross-references in the rendered content
   * @param container The container with the rendered content
   */
  private processCrossReferences(container: HTMLElement): void {
    // Simple implementation: Find all elements with id attributes
    const elementsWithIds = container.querySelectorAll('[id]');
    const idMap = new Map<string, HTMLElement>();
    
    // Create a map of all elements with IDs
    elementsWithIds.forEach(el => {
      idMap.set(el.id, el as HTMLElement);
    });
    
    // Find all cross-reference links
    container.querySelectorAll('a[href^="#"]').forEach(link => {
      const targetId = link.getAttribute('href')?.substring(1);
      if (targetId && idMap.has(targetId)) {
        link.classList.add('oh-my-cv-cross-reference');
        
        // Add tooltip with the target text
        const targetElement = idMap.get(targetId);
        if (targetElement) {
          link.setAttribute('title', targetElement.textContent || '');
        }
      }
    });
  }

  /**
   * Visualize page breaks in the rendered content
   * @param container The container with the rendered content
   */
  private visualizePageBreaks(container: HTMLElement): void {
    // Find existing page breaks
    container.querySelectorAll('.oh-my-cv-page-break').forEach(pageBreak => {
      // Add a visual indicator
      const indicator = document.createElement('div');
      indicator.classList.add('oh-my-cv-page-break-indicator');
      indicator.textContent = 'Page Break';
      pageBreak.prepend(indicator);
    });
    
    // TODO: Implement auto page break detection based on content height
    // This will require calculating the height of the content and inserting
    // page breaks at appropriate positions based on the page size
  }

  /**
   * Convert HTML to plain text (for export or search)
   * @param html The HTML content to convert
   * @returns The plain text version
   */
  htmlToPlainText(html: string): string {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || '';
  }
}
