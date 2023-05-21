# Virtual Piano

This is a virtual piano implemented in JavaScript using the Web Audio API and MIDI.

## Functionality

The virtual piano has the following features:

- The range of the piano can be selected using a range selector.
- The piano keys are dynamically generated based on the selected range.
- The keys can be played using either a connected MIDI device or a computer keyboard.
- The currently pressed keys are displayed in the middle of the screen.

## How to Use

To use the virtual piano, follow these steps:

1. Clone or download the repository.
2. Open the `index.html` file in a web browser.
3. Connect a MIDI device to your computer, if available.
4. Use the range selector to choose the desired range of the piano.
5. Play the piano keys using either the connected MIDI device or the computer keyboard.

## Dependencies

The virtual piano code does not have any external dependencies. It uses the Web Audio API and the MIDI interface provided by the browser.

## Code Structure

The code is organized into the following main sections:

- Functionality constants: These are the constants used for configuring the virtual piano.
- Utils: This section contains utility functions used for creating and manipulating SVG elements.
- Virtual Piano Setup: This section sets up the virtual piano by generating the SVG elements for the piano keys based on the selected range.
- Web Audio Implementation: This section handles the Web Audio API implementation for playing the piano keys.
- MIDI Handling: This section handles MIDI input from connected devices and maps MIDI notes to piano keys.
- Keyboard Mapping: This section maps computer keyboard keys to piano keys for keyboard input.