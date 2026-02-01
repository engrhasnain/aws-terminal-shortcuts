# AWS Terminal Copy-Paste Helper

A Chrome/Opera browser extension that enables standard keyboard shortcuts (Ctrl+C and Ctrl+V) in AWS EC2 Instance Connect terminal.

## Problem It Solves

AWS EC2 Instance Connect's browser-based terminal doesn't support standard keyboard shortcuts for copy and paste. Users have to right-click and select copy/paste from the context menu, which slows down workflow.

## Features

- ✅ **Ctrl+Shift+C** - Copy selected text from terminal
- ✅ **Ctrl+Shift+V** - Paste text into terminal
- ✅ Visual notifications for copy/paste actions
- ✅ Auto-detects AWS EC2 terminal pages
- ✅ Works with both Chrome and Opera browsers
- ✅ Doesn't interfere with terminal operations (Ctrl+C still sends interrupt signal)

## Installation Instructions

### Step 1:Clone the Repo


### Step 2: Load Extension in Chrome/Opera

#### For Chrome:

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to and select the `aws-terminal-shortcuts` folder
6. The extension should now appear in your extensions list!

#### For Opera:

1. Open Opera browser
2. Go to `opera://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to and select the `aws-terminal-shortcuts` folder
6. The extension should now appear in your extensions list!

### Step 3: Grant Permissions

When you first load the extension, you may need to grant clipboard permissions:
1. Click on the extension icon (or it will prompt you)
2. Allow clipboard read and write permissions
3. You're all set!

## How to Use

1. **Navigate to AWS Console**: Go to your AWS EC2 Instance Connect terminal
   - Example: `https://console.aws.amazon.com/ec2/...`

2. **Wait for notification**: You should see a green notification saying "AWS Terminal shortcuts active!"

3. **Copy text**:
   - Select text in the terminal with your mouse
   - Press `Ctrl+Shift+C`
   - You'll see a "Copied!" notification

4. **Paste text**:
   - Press `Ctrl+Shift+V`
   - You'll see a "Pasted!" notification

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+C` | Copy selected text |
| `Ctrl+Shift+V` | Paste from clipboard |

**Note**: Regular `Ctrl+C` still works as the terminal interrupt signal (SIGINT) to stop processes. This extension uses `Ctrl+Shift` combinations to avoid interfering with normal terminal operations.

## Troubleshooting

### Extension not working?

1. **Check if extension is enabled**: Go to `chrome://extensions/` and make sure the extension is enabled
2. **Refresh the AWS page**: After installing the extension, refresh your EC2 Instance Connect page
3. **Check console**: Press `F12` to open Developer Tools, check the Console tab for any error messages

### Clipboard permission errors?

1. Make sure you granted clipboard permissions when installing
2. In Chrome, go to `chrome://extensions/` → click on extension details → check permissions
3. Some browsers may require you to interact with the page first (click somewhere) before clipboard access works

### Copy/Paste not working?

1. Make sure you're on an actual EC2 Instance Connect page
2. Try the alternative shortcuts (`Ctrl+Shift+C` / `Ctrl+Shift+V`)
3. Check if the terminal has fully loaded (wait a few seconds after page load)

## Technical Details

### How it works:

1. **Content Script Injection**: The extension injects JavaScript into AWS Console pages
2. **Terminal Detection**: Automatically detects when you're on an EC2 terminal page
3. **Keyboard Event Interception**: Listens for keyboard shortcuts and intercepts them
4. **Clipboard API**: Uses modern browser Clipboard API for copy/paste operations
5. **Visual Feedback**: Shows notifications to confirm actions

### Browser Permissions:

- `clipboardRead`: Required to read clipboard content for paste
- `clipboardWrite`: Required to write to clipboard for copy
- `host_permissions`: Only runs on AWS Console pages for security

## Development

Want to modify or improve the extension?

1. Edit the `content.js` file to change behavior
2. Edit the `manifest.json` file to change permissions or metadata
3. After making changes, go to `chrome://extensions/` and click the "Reload" button on the extension

## Common Use Cases

- **DevOps Engineers**: Quickly copy commands, logs, and output from EC2 terminals
- **System Administrators**: Efficiently paste configuration commands
- **Developers**: Copy error messages and debugging output
- **Anyone**: Save time and improve workflow when using AWS EC2 Instance Connect

## Privacy & Security

- Extension only runs on AWS Console pages
- No data is sent to external servers
- All clipboard operations happen locally in your browser
- Open source - you can inspect all the code

## Future Enhancements

Potential features for future versions:
- [ ] Support for other cloud providers (GCP, Azure)
- [ ] Customizable keyboard shortcuts
- [ ] Command history feature
- [ ] Auto-paste formatting for common commands
- [ ] Settings page for user preferences

## Support

If you encounter any issues or have suggestions, please:
1. Check the Troubleshooting section above
2. Check browser console for error messages (`F12` → Console tab)
3. Verify you're using the latest version

## License

This extension is provided as-is for educational and productivity purposes.

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Compatible**: Chrome, Opera, and Chromium-based browsers
