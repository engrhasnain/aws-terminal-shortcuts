// AWS Terminal Copy-Paste Helper - Content Script
console.log('AWS Terminal Copy-Paste Helper: Extension loaded');

// Function to check if we're on an EC2 Instance Connect page
function isEC2TerminalPage() {
  // Check if the URL contains EC2 instance connect patterns
  const url = window.location.href;
  return url.includes('ec2') && (
    url.includes('instance-connect') || 
    url.includes('connect') ||
    document.querySelector('.terminal') !== null ||
    document.querySelector('[class*="terminal"]') !== null
  );
}

// Function to find the terminal element
function findTerminalElement() {
  // AWS EC2 Instance Connect typically uses xterm.js
  // Look for common terminal container classes
  const selectors = [
    '.xterm-helper-textarea', // This is the actual input element in xterm.js - MOST IMPORTANT
    '.xterm-screen',
    '.xterm',
    '.terminal',
    '[class*="terminal"]',
    'canvas.xterm-cursor-layer'
  ];
  
  for (let selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('AWS Terminal Helper: Terminal element found with selector:', selector);
      return element;
    }
  }
  
  return null;
}

// Function to simulate right-click at a specific position
function simulateRightClick(element, x, y) {
  const rect = element.getBoundingClientRect();
  const clickX = x || rect.left + rect.width / 2;
  const clickY = y || rect.top + rect.height / 2;
  
  const contextMenuEvent = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: clickX,
    clientY: clickY,
    button: 2
  });
  
  element.dispatchEvent(contextMenuEvent);
}

// Function to copy selected text from terminal
async function copyFromTerminal() {
  console.log('AWS Terminal Helper: Copy triggered');
  
  const terminal = findTerminalElement();
  if (!terminal) {
    console.log('AWS Terminal Helper: Terminal not found');
    return;
  }
  
  // Try multiple methods to get selected text
  let selectedText = '';
  
  // Method 1: Try to get text from window.getSelection (works for some terminals)
  const selection = window.getSelection();
  selectedText = selection.toString();
  
  // Method 2: If no selection, try to access xterm.js instance directly
  if (!selectedText && window.term) {
    selectedText = window.term.getSelection();
    console.log('AWS Terminal Helper: Got selection from xterm instance');
  }
  
  // Method 3: Try to find xterm instance in the DOM
  if (!selectedText) {
    // Look for xterm instance stored in the element
    const xtermContainer = document.querySelector('.xterm');
    if (xtermContainer && xtermContainer._term) {
      selectedText = xtermContainer._term.getSelection();
      console.log('AWS Terminal Helper: Got selection from xterm container');
    }
  }
  
  // Method 4: Execute copy command directly (let the browser handle it)
  if (!selectedText) {
    try {
      // Try to execute the copy command - this will copy whatever is selected
      const success = document.execCommand('copy');
      if (success) {
        console.log('AWS Terminal Helper: Used execCommand to copy');
        showNotification('Copied!', 'success');
        return;
      }
    } catch (err) {
      console.log('AWS Terminal Helper: execCommand failed:', err);
    }
  }
  
  // If we have text, copy it to clipboard
  if (selectedText) {
    try {
      await navigator.clipboard.writeText(selectedText);
      console.log('AWS Terminal Helper: Text copied to clipboard:', selectedText.substring(0, 50) + '...');
      showNotification('Copied!', 'success');
    } catch (err) {
      console.error('AWS Terminal Helper: Failed to copy:', err);
      showNotification('Copy failed', 'error');
    }
  } else {
    console.log('AWS Terminal Helper: No text selected');
    showNotification('No text selected', 'warning');
  }
}

// Function to paste text into terminal
async function pasteToTerminal() {
  console.log('AWS Terminal Helper: Paste triggered');
  
  const terminal = findTerminalElement();
  if (!terminal) {
    console.log('AWS Terminal Helper: Terminal not found');
    return;
  }
  
  try {
    // Read from clipboard
    const text = await navigator.clipboard.readText();
    console.log('AWS Terminal Helper: Text read from clipboard:', text.substring(0, 50) + '...');
    
    // Method 1: Try to use xterm.js paste method directly from window.term
    if (window.term && typeof window.term.paste === 'function') {
      try {
        window.term.paste(text);
        console.log('AWS Terminal Helper: Pasted using window.term.paste()');
        showNotification('Pasted!', 'success');
        return; // EXIT IMMEDIATELY after successful paste
      } catch (e) {
        console.log('AWS Terminal Helper: window.term.paste() failed:', e);
      }
    }
    
    // Method 2: Try to find xterm instance in the DOM and use its paste method
    const xtermElements = document.querySelectorAll('.xterm, [class*="xterm"]');
    for (let elem of xtermElements) {
      if (elem._term && typeof elem._term.paste === 'function') {
        try {
          elem._term.paste(text);
          console.log('AWS Terminal Helper: Pasted using element._term.paste()');
          showNotification('Pasted!', 'success');
          return; // EXIT IMMEDIATELY after successful paste
        } catch (e) {
          console.log('AWS Terminal Helper: element._term.paste() failed:', e);
        }
      }
    }
    
    // Method 3: Simulate typing by dispatching input events
    try {
      // Focus the terminal first
      terminal.focus();
      terminal.click();
      
      // Give it a moment to focus
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', text);
      
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer
      });
      
      // Only dispatch to ONE element - prefer xterm-screen if it exists
      const xtermScreen = document.querySelector('.xterm-screen');
      if (xtermScreen) {
        xtermScreen.dispatchEvent(pasteEvent);
      } else {
        terminal.dispatchEvent(pasteEvent);
      }
      
      console.log('AWS Terminal Helper: Pasted using clipboard event simulation');
      showNotification('Pasted!', 'success');
      return; // EXIT IMMEDIATELY after attempting paste
    } catch (e) {
      console.log('AWS Terminal Helper: Clipboard event simulation failed:', e);
    }
    
    // Method 4: Last resort - simulate right-click paste
    try {
      // Put text in clipboard first
      await navigator.clipboard.writeText(text);
      
      // Simulate right-click which should show paste option
      simulateRightClick(terminal);
      
      console.log('AWS Terminal Helper: Triggered right-click for paste menu');
      showNotification('Right-click to paste', 'info');
      return; // EXIT
    } catch (e) {
      console.log('AWS Terminal Helper: Right-click simulation failed:', e);
    }
    
    // If we got here, nothing worked
    showNotification('Paste failed - try manual paste', 'warning');
    
  } catch (err) {
    console.error('AWS Terminal Helper: Failed to paste:', err);
    showNotification('Paste failed - check permissions', 'error');
  }
}

// Function to show notification
function showNotification(message, type = 'info') {
  // Remove any existing notification
  const existingNotification = document.getElementById('aws-terminal-helper-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'aws-terminal-helper-notification';
  notification.textContent = message;
  
  // Style based on type
  const colors = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Auto-remove after 2 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Main keyboard event listener
function setupKeyboardListeners() {
  document.addEventListener('keydown', async function(event) {
    // Only process if we're on an EC2 terminal page
    if (!isEC2TerminalPage()) {
      return;
    }
    
    // Check if Ctrl key is pressed (or Cmd on Mac)
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    
    // Ctrl+Shift+C for copy
    if (isCtrlPressed && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      event.stopPropagation();
      await copyFromTerminal();
    }
    
    // Ctrl+Shift+V for paste
    if (isCtrlPressed && event.shiftKey && event.key === 'V') {
      event.preventDefault();
      event.stopPropagation();
      await pasteToTerminal();
    }
  }, true); // Use capture phase to intercept before other handlers
  
  console.log('AWS Terminal Helper: Keyboard listeners set up');
}

// Wait for page to be fully loaded
function initialize() {
  if (isEC2TerminalPage()) {
    console.log('AWS Terminal Helper: EC2 terminal page detected');
    
    // Wait a bit for the terminal to fully load
    setTimeout(() => {
      setupKeyboardListeners();
      showNotification('AWS Terminal shortcuts active!', 'success');
    }, 2000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also watch for navigation changes (for single-page apps)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    initialize();
  }
}).observe(document, { subtree: true, childList: true });