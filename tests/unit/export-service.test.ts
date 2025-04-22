/**
 * Unit tests for the Export Service
 * Demonstrates how we can test PDF export functionality outside of Obsidian
 */
import { ExportService } from '../../src/services/export-service';
import { MarkdownService } from '../../src/services/markdown-service';
import { SettingsService } from '../../src/services/settings-service';
import { App, Plugin } from '../mocks/obsidian';
import { DEFAULT_SETTINGS } from '../../src/core/constants';
import fs from 'fs';
import path from 'path';

// Mock html2pdf.js
jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    from: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(undefined),
    output: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])), // Mock PDF binary data
  })),
}));

describe('ExportService', () => {
  let app: App;
  let plugin: Plugin;
  let settingsService: SettingsService;
  let markdownService: MarkdownService;
  let exportService: ExportService;

  beforeEach(() => {
    // Setup mocks
    app = new App();
    plugin = new Plugin(app, { id: 'obsidian-oh-my-cv' });
    settingsService = new SettingsService(plugin);
    
    // Set initial settings
    settingsService.updateSettings(DEFAULT_SETTINGS);
    
    // Create required services
    markdownService = new MarkdownService(settingsService);
    exportService = new ExportService(settingsService, markdownService);
  });

  test('should generate PDF from markdown content', async () => {
    // Setup
    const markdown = '# Test CV\n\nThis is a test CV for export functionality.';
    const outputPath = path.join(__dirname, '../fixtures/test-cv.pdf');
    
    // Create test fixtures directory if it doesn't exist
    const fixturesDir = path.dirname(outputPath);
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // Execute
    const result = await exportService.exportToPDF(markdown, outputPath);
    
    // Verify
    expect(result.success).toBe(true);
    expect(result.path).toBe(outputPath);
  });

  test('should apply custom page size settings when exporting', async () => {
    // Setup - change settings to use Letter size
    settingsService.setSetting('defaultPageSize', 'LETTER');
    
    // Get the references to the mocked html2pdf.js module
    const html2pdf = require('html2pdf.js').default;
    
    // Execute
    await exportService.exportToPDF('# Test CV', 'test-output.pdf');
    
    // Verify that html2pdf was called with the correct page size
    expect(html2pdf).toHaveBeenCalled();
    expect(html2pdf().set).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSize: 'Letter',
      })
    );
  });

  test('should apply custom margins when exporting', async () => {
    // Setup - set custom margins
    const customMargins = { top: 25, right: 25, bottom: 25, left: 25 };
    settingsService.setSetting('defaultMargins', customMargins);
    
    // Get the references to the mocked html2pdf.js module
    const html2pdf = require('html2pdf.js').default;
    
    // Execute
    await exportService.exportToPDF('# Test CV', 'test-output.pdf');
    
    // Verify that html2pdf was called with the correct margins
    expect(html2pdf).toHaveBeenCalled();
    expect(html2pdf().set).toHaveBeenCalledWith(
      expect.objectContaining({
        margin: [
          customMargins.top,
          customMargins.right,
          customMargins.bottom,
          customMargins.left,
        ],
      })
    );
  });

  test('should export markdown file correctly', async () => {
    // Setup
    const markdown = '# Test CV\n\nThis is a test CV for export functionality.';
    const outputPath = path.join(__dirname, '../fixtures/test-cv.md');
    
    // Execute
    const result = await exportService.exportToMarkdown(markdown, outputPath);
    
    // Verify
    expect(result.success).toBe(true);
    expect(result.path).toBe(outputPath);
  });

  test('should handle export errors gracefully', async () => {
    // Setup - make the html2pdf.js mock throw an error
    const html2pdf = require('html2pdf.js').default;
    html2pdf().save.mockRejectedValueOnce(new Error('Export failed'));
    
    // Execute
    const result = await exportService.exportToPDF('# Test CV', 'test-output.pdf');
    
    // Verify
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Export failed');
  });

  // Visual test - generate an HTML representation for visual inspection
  test('should generate HTML for visual testing', () => {
    // Setup
    const markdown = `# John Doe
## Software Engineer

Professional software engineer with experience in web development.

## Skills
- JavaScript/TypeScript
- React
- Node.js

## Experience
### Senior Developer at TechCorp
*2018 - Present*

Built enterprise applications.`;
    
    // Execute
    const html = exportService.generateHTML(markdown);
    
    // Create test output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../fixtures/visual-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save the HTML for visual inspection
    const outputPath = path.join(outputDir, 'export-preview.html');
    
    // Add export styling for realistic preview
    const styledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Export Preview Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    .cv-container {
      width: 210mm; /* A4 width */
      min-height: 297mm; /* A4 height */
      margin: 0 auto;
      padding: ${DEFAULT_SETTINGS.defaultMargins.top}mm ${DEFAULT_SETTINGS.defaultMargins.right}mm ${DEFAULT_SETTINGS.defaultMargins.bottom}mm ${DEFAULT_SETTINGS.defaultMargins.left}mm;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      background: white;
    }
    h1 {
      color: ${DEFAULT_SETTINGS.defaultThemeColor};
    }
    .page-break {
      page-break-after: always;
      margin-bottom: 30px;
      border-bottom: 1px dashed #ccc;
    }
  </style>
</head>
<body>
  <div class="cv-container">
    ${html}
  </div>
</body>
</html>`;
    
    // Write the HTML to a file for visual inspection
    fs.writeFileSync(outputPath, styledHtml);
    
    // Basic verification
    expect(html).toContain('<h1>John Doe</h1>');
    expect(html).toContain('<h2>Software Engineer</h2>');
    expect(html).toContain('<li>JavaScript/TypeScript</li>');
  });
});
