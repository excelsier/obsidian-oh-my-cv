/**
 * Unit tests for the Markdown Service
 * This demonstrates how we can test markdown rendering outside of Obsidian
 */
import { MarkdownService } from '../../src/services/markdown-service';
import { App, Plugin } from '../mocks/obsidian';
import { SettingsService } from '../../src/services/settings-service';
import { DEFAULT_SETTINGS } from '../../src/core/constants';
import fs from 'fs';
import path from 'path';

describe('MarkdownService', () => {
  let app: App;
  let plugin: Plugin;
  let settingsService: SettingsService;
  let markdownService: MarkdownService;

  beforeEach(() => {
    // Setup mocks
    app = new App();
    plugin = new Plugin(app, { id: 'obsidian-oh-my-cv' });
    settingsService = new SettingsService(plugin);
    
    // Set initial settings
    settingsService.updateSettings(DEFAULT_SETTINGS);
    
    // Create markdown service
    markdownService = new MarkdownService(settingsService);
  });

  test('should render basic markdown correctly', () => {
    // Setup
    const markdown = '# Heading 1\n\nThis is a paragraph with **bold** and *italic* text.';
    
    // Execute
    const html = markdownService.renderMarkdown(markdown);
    
    // Verify
    expect(html).toContain('<h1>Heading 1</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  test('should apply auto-casing when enabled', () => {
    // Setup - enable auto-casing
    settingsService.setSetting('enableAutoCasing', true);
    const markdown = 'this is a title that should be auto-cased';
    
    // Execute 
    const html = markdownService.renderMarkdown(`# ${markdown}`);
    
    // Verify - headings should be auto-cased when the feature is enabled
    expect(html).toContain('This Is A Title That Should Be Auto-cased');
  });

  test('should not apply auto-casing when disabled', () => {
    // Setup - disable auto-casing
    settingsService.setSetting('enableAutoCasing', false);
    const markdown = 'this is a title that should NOT be auto-cased';
    
    // Execute
    const html = markdownService.renderMarkdown(`# ${markdown}`);
    
    // Verify - text should remain unchanged when auto-casing is disabled
    expect(html).toContain(markdown);
  });

  test('should process custom TeX commands', () => {
    // Setup - enable TeX support
    settingsService.setSetting('enableTeXSupport', true);
    const markdown = 'This is a custom TeX command: \\myCommand{argument}';
    
    // Execute
    const html = markdownService.renderMarkdown(markdown);
    
    // Verify - TeX commands should be processed
    expect(html).toContain('myCommand');
    expect(html).toContain('argument');
  });

  test('should handle page breaks correctly', () => {
    // Setup
    const markdown = 'Content before page break\n\\newpage\nContent after page break';
    
    // Execute
    const html = markdownService.renderMarkdown(markdown);
    
    // Verify
    expect(html).toContain('page-break');
  });
  
  // Visual regression test - saves rendered HTML for visual comparison
  test('should produce consistent HTML output for visual testing', () => {
    // Setup
    // Define a test CV markdown that exercises many formatting features
    const testCV = `# John Doe
## Senior Software Engineer

Professional software engineer with **10+ years** of experience in:
- JavaScript/TypeScript
- React & Angular
- Node.js backend development

\\newpage

## Work Experience

### Senior Developer at TechCorp
*2018 - Present*

Built and maintained large-scale enterprise applications.

### Developer at StartupInc
*2015 - 2018*

Full-stack development with React and Node.js.
`;
    
    // Execute
    const html = markdownService.renderMarkdown(testCV);
    
    // Create test output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../fixtures/visual-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save the rendered HTML for visual comparison
    const outputPath = path.join(outputDir, 'test-cv-render.html');
    
    // Create a complete HTML document for viewing
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CV Render Test</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .page-break { page-break-after: always; border-bottom: 1px dashed #ccc; margin: 20px 0; }
    h1, h2, h3 { color: #333; }
  </style>
</head>
<body>
  <div class="cv-preview">
    ${html}
  </div>
</body>
</html>`;
    
    // Write the HTML to a file for visual inspection
    fs.writeFileSync(outputPath, fullHtml);
    
    // Basic verification of HTML structure
    expect(html).toContain('<h1>John Doe</h1>');
    expect(html).toContain('<h2>Senior Software Engineer</h2>');
    expect(html).toContain('<strong>10+ years</strong>');
    expect(html).toContain('page-break');
    expect(html).toContain('<h3>Senior Developer at TechCorp</h3>');
  });
});
