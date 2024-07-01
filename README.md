# AI Chat Interface

## Overview

This project is a sophisticated web application that enables users to interact with two advanced AI models: Gemini (Chrome) and Llama3. The application consists of a robust backend server and a responsive frontend React application, providing a seamless and intuitive user experience for AI-powered conversations. The interface can be accessed from any device on the local network, making it versatile and convenient for various use cases.

## Features

- Interactive and user-friendly chat interface
- Dual AI model support: Gemini (Chrome) and Llama3
- Dynamic theme switching between light and dark modes
- Curated set of common prompt suggestions for quick interactions
- Comprehensive conversation history management
- One-click export of conversations to Markdown format
- Responsive design for various screen sizes
- Accessible from any device on the local network

## Requirements

### Backend

- Node.js (v14 or later)
- npm (v6 or later)
- Chrome Canary (for Gemini AI)
- Llama3 server (for Llama3 AI)

### Frontend

- Node.js (v14 or later)
- npm (v6 or later)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation and Configuration

### Backend Setup

1. Navigate to the `backend` folder:
   
   ```
   cd backend
   ```

2. Install required dependencies:
   
   ```
   npm install
   ```

3. Configure the `server.js` file:
   
   - Locate the `serverIP` variable and set it to your machine's local IP address (e.g., '192.168.1.100')
   - Adjust the `userDataDir` and `executablePath` variables to match your Chrome Canary installation path

4. Start the backend server:
   
   ```
   node server.js
   ```

### Frontend Setup

1. Navigate to the `frontend` folder:
   
   ```
   cd frontend
   ```

2. Install required dependencies:
   
   ```
   npm install
   ```

3. Open `src/AIPromptApp.js` and update the `serverURL` constant:
   
   - Replace the IP address with your machine's local IP address
   - Example: `const serverURL = 'http://192.168.1.100:3001';`

4. Start the frontend development server:
   
   ```
   npm start
   ```

### Chrome Canary Configuration for Gemini Nano

Follow these steps to set up Built-in Gemini Nano in Chrome Canary:

1. Download and install Chrome Canary (version 127 or later) from [https://google.com/chrome/canary/](https://google.com/chrome/canary/)

2. Open Chrome Canary and navigate to `chrome://flags/#prompt-api-for-gemini-nano`
   
   - Set this flag to "Enabled"

3. Without restarting, go to `chrome://flags/#optimization-guide-on-device-model`
   
   - Set this flag to "Enabled BypassPerfRequirement" (not just "Enabled")

4. Restart Chrome Canary

5. Open `chrome://components/` and locate "Optimization Guide On Device Model"
   
   - Ensure the model is fully downloaded (Version should be something like "2024.6.5.2205")
   - If the version shows "0.0.0.0", click "Check for update" and wait for the download to complete

6. If you can't find the "Optimization Guide On Device Model" option:
   
   - Go to `chrome://settings/languages`
   - Add "English" to your languages and set it as "Display Chrome in this language"
   - Restart Chrome Canary and check `chrome://components/` again

7. To verify the setup:
   
   - Open any webpage and press F12 to access the console
   - Enter `window.ai`
   - If this doesn't produce an error, the setup was successful

8. You can now create AI instances using either:
   
   ```javascript
   const model = await window.ai.createTextSession();
   ```
   
   or
   
   ```javascript
   const model = await window.ai.createGenericSession();
   ```

9. Test the setup with:
   
   ```javascript
   const model = await window.ai.createTextSession();
   await model.prompt('Who are you?');
   ```

## Usage

1. Ensure both backend and frontend servers are running on your host machine
2. To access the application:
   - On the host machine: Open your web browser and navigate to `http://localhost:3000`
   - From any device on the same local network: Open a web browser and enter `http://<host-machine-ip>:3000`
     (Replace `<host-machine-ip>` with the actual IP address of the machine running the servers)
3. Select your preferred AI model: Gemini or Llama3
4. Enter your prompt in the text area and submit
5. View the AI's response and continue the conversation
6. Use the sidebar to access and manage your conversation history
7. Export your conversation to Markdown using the "Export to Markdown" button for easy sharing or documentation

## Network Access

The AI Chat Interface is designed to be accessible from any device on your local network:

- The application runs on the host machine (where you've set up the backend and frontend)
- Other devices (smartphones, tablets, laptops) on the same Wi-Fi or local network can access the interface
- To connect from another device, simply open a web browser and enter `http://<host-machine-ip>:3000`
- This allows for flexible use across multiple devices without needing to install the application on each one

Note: Ensure your host machine's firewall allows incoming connections on port 3000 for the frontend and port 3001 for the backend.

## Troubleshooting

- If you encounter issues with the Gemini AI, ensure Chrome Canary is installed and configured correctly as per the instructions above
- For Llama3 AI issues, verify that the Llama3 server is running and accessible from your backend server
- Check that the IP addresses in both frontend and backend configurations match your local network setup
- If you can't access the application from other devices, verify that your host machine's firewall is not blocking the connection
- Ensure all devices are on the same local network

## Contributing

We welcome contributions to improve the AI Chat Interface! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Gemini and Llama3 teams for their amazing AI models.

## Support

If you have any questions or need assistance, please open an issue in the GitHub repository or contact the maintainers directly.

---

Happy chatting with AI from any device on your network! 🤖💬🌐
