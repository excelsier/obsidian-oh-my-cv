/**
 * Manual test script for the Oh My CV Obsidian Plugin
 * This script helps verify the markdown rendering functionality
 * Run with: node tests/manual-test.js
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Setup mock DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;

// Load test CV content
const testCVPath = path.join(__dirname, 'fixtures/test-cv.md');
const cvContent = fs.readFileSync(testCVPath, 'utf8');

// Simple markdown renderer (for testing only)
function renderMarkdown(markdown) {
  // Process custom CV markers
  let html = markdown
    // Basic markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/- (.*$)/gm, '<li>$1</li>')
    // Custom CV commands
    .replace(/\\cvtag\{(.*?)\}/g, '<span class="oh-my-cv-tag">$1</span>')
    .replace(/\\cvskill\{(.*?)\}\{(.*?)\}/g, 
      '<div class="oh-my-cv-skill"><div class="oh-my-cv-skill-name">$1</div>' +
      '<div class="oh-my-cv-skill-level" style="width: $2%;"></div></div>')
    .replace(/\\daterange\{(.*?)\}\{(.*?)\}/g, 
      '<div class="oh-my-cv-date-range"><span class="oh-my-cv-date-start">$1</span> – ' +
      '<span class="oh-my-cv-date-end">$2</span></div>')
    .replace(/\\newpage/g, '<div class="oh-my-cv-page-break"></div>')
    .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
    .replace(/\\textsc\{(.*?)\}/g, '<span class="small-caps">$1</span>');
  
  // Wrap lists
  html = html.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)*/g, (match) => {
    return `<ul class="oh-my-cv-list">${match}</ul>`;
  });
  
  return html;
}

// Generate HTML preview
const renderedHTML = renderMarkdown(cvContent);

// Generate a full HTML document for visual inspection
const styles = `
  body { 
    font-family: Arial, sans-serif; 
    margin: 40px;
    color: #333;
    line-height: 1.5;
  }
  .oh-my-cv-tag {
    display: inline-block;
    background-color: #eee;
    padding: 3px 8px;
    border-radius: 4px;
    margin-right: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 6px;
  }
  .oh-my-cv-skill {
    margin-bottom: 12px;
  }
  .oh-my-cv-skill-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
  .oh-my-cv-skill-level {
    height: 8px;
    background-color: #4051b5;
    border-radius: 4px;
    opacity: 0.8;
  }
  .oh-my-cv-date-range {
    font-style: italic;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  .oh-my-cv-page-break {
    border-top: 1px dashed #999;
    margin: 20px 0;
    position: relative;
  }
  .oh-my-cv-page-break::after {
    content: "Page Break";
    position: absolute;
    right: 0;
    top: -10px;
    font-size: 0.7rem;
    background-color: #4051b5;
    color: white;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .small-caps {
    font-variant: small-caps;
    font-weight: 500;
  }
  h1, h2, h3 {
    color: #4051b5;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  h1 {
    font-size: 2.2rem;
    margin-top: 0;
  }
  h2 {
    font-size: 1.6rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }
  h3 {
    font-size: 1.3rem;
  }
  ul {
    margin-top: 0.5rem;
    margin-bottom: 0.8rem;
    padding-left: 20px;
  }
  li {
    margin-bottom: 0.4rem;
  }
`;

const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CV Test Render</title>
  <style>${styles}</style>
</head>
<body>
  <div class="oh-my-cv-preview">
    ${renderedHTML}
  </div>
</body>
</html>`;

// Save the HTML output for visual inspection
const outputPath = path.join(__dirname, 'fixtures/visual-output/test-cv-render.html');
// Create directory if it doesn't exist
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}
fs.writeFileSync(outputPath, fullHTML);

console.log(`Test CV rendered to: ${outputPath}`);
console.log('Open this file in a web browser to visually inspect the rendering');
