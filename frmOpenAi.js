const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Define input and output file paths
const inputFilePath = path.join(__dirname, 'Form1.frm');
const reactFilePath = path.join(__dirname, 'Component.jsx');
const cssFilePath = path.join(__dirname, 'styles.css');
const reportFilePath = path.join(__dirname, 'ConversionReport.md');

// Set up OpenAI API configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const functions = [
    {
      name: 'convert_vb6_to_react',
      description: 'Converts VB6 form components to React.js code, CSS styles, and a conversion report',
      parameters: {
        type: 'object',
        properties: {
          react_code: {
            type: 'string',
            description: 'The React.js component code',
          },
          css_code: {
            type: 'string',
            description: 'The CSS styles for the component',
          },
          conversion_report: {
            type: 'string',
            description: 'The conversion report detailing mappings and notes',
          },
        },
        required: ['react_code', 'css_code', 'conversion_report'],
      },
    },
  ]
// Read the .frm file
fs.readFile(inputFilePath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading .frm file:', err);
    return;
  }

  // Parse the .frm file content
  const components = parseVb6FormContent(data);

  // Generate prompt for LLM
  const prompt = generateLLMPrompt(components);

  try {
    // Send the prompt to the LLM and get the structured response
    const response = await sendPromptToLLM(prompt);

    // console.log(response.choices[0].message)
    // Extract the structured response

    const { react_code, css_code, conversion_report } = response.choices[0].message.function_call.arguments;

    responseJson = JSON.parse(responseText)
    react_code = responseJson['react_code']
    css_code = responseJson['css_code']
    conversion_report = responseJson['conversion_report']

    // console.log(react_code, css_code, conversion_report)
    // Write the generated files
    writeToFile(reactFilePath, react_code, 'React file');
    writeToFile(cssFilePath, css_code, 'CSS file');
    writeToFile(reportFilePath, conversion_report, 'Report file');
  } catch (error) {
    console.error('Error processing LLM response:', error);
  }
});

// Function to parse VB6 form content
function parseVb6FormContent(content) {
  const components = [];
  let currentComponent = null;

  content.split('\n').forEach((line) => {
    line = line.trim();

    // Check for a new component
    if (line.startsWith('Begin VB.')) {
      if (currentComponent) {
        components.push(currentComponent);
      }
      currentComponent = { type: line.split(' ')[1], properties: {} };
    }
    // If we're within a component, gather its properties
    else if (currentComponent && line.includes('=')) {
      const [key, value] = line.split('=').map((str) => str.trim());
      currentComponent.properties[key] = value.replace(/^"|"$/g, '');
    }
    // If end of component is reached
    else if (line.startsWith('End')) {
      if (currentComponent) {
        components.push(currentComponent);
        currentComponent = null;
      }
    }
  });

  // Append last component if any
  if (currentComponent) {
    components.push(currentComponent);
  }

  return components;
}

// Function to generate LLM prompt
function generateLLMPrompt(components) {
  return `Convert the following VB6 form components to a React.js application with the following requirements:

Components:
${JSON.stringify(components, null, 2)}

Objective:
Transform the code in the VB6 components into a new, fully functional React.js component, using only basic React libraries to convert forms from VB6.

Deliverables:
- ReactJS File: Include both the UI and logic code in a .jsx file.
- Stylesheet File: Provide a separate stylesheet file (e.g., .css or .scss) used by the ReactJS file.
- Report File: Create a report that contains the mapping table (old and new function and variable names) and notes about any code that couldn't be converted. Highlight any code blocks or dependencies that cannot be converted directly, especially if third-party libraries or specific features in the Frm file are incompatible with React.js.
Include any recommendations for alternative approaches or potential workarounds where applicable.
`;
}

// Function to send prompt to LLM
async function sendPromptToLLM(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      functions: functions,
      function_call: 'auto',
      max_tokens: 1500,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

// Function to write content to a file
function writeToFile(filePath, content, fileDescription) {
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(`Error writing ${fileDescription}:`, err);
      return;
    }
    console.log(`${fileDescription} written successfully`);
  });
}

// Function to extract specific sections from the response
function extractSection(responseText, sectionName) {
    const regex = new RegExp(`${sectionName}:\n([\s\S]*?)(?=\n[A-Z]|$)`);
    const match = responseText.match(regex);
    return match ? match[1].trim() : '';
  }
