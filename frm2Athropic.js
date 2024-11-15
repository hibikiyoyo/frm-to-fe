const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const {Anthropic} = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

require('dotenv').config();


console.log("Open API Key: " + process.env.OPENAI_API_KEY)

// Set up OpenAI API configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


image_url = "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg"
image_media_type = "image/jpeg"
image_data = base64.standard_b64encode(httpx.get(image_url).content).decode("utf-8")

const tools = [
    {
        type: "function",
        function: {
            name: "convert_vb6_to_react",
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
        }
    }
]


console.log(msg);
const rootDirectory = process.argv[2];
if (!rootDirectory) {
  console.error('Please provide the root directory as an argument.');
  process.exit(1);
}

// Function to process each .frm file
async function processFrmFile(filePath, outputPath) {
    const directory = path.dirname(filePath);
    const baseName = path.basename(filePath, '.frm');
    const outputDir = path.join(outputPath, directory, baseName);

    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(path.dirname(outputDir), { recursive: true });
    }

    const reactFilePath = path.join(outputDir, `${baseName}.jsx`);
    const cssFilePath = path.join(outputDir, `styles.css`);
    const reportFilePath = path.join(outputDir, `${baseName}_ConversionReport.md`);

  
    // Read the .frm file
    fs.readFile(filePath, 'utf8', async (err, data) => {
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
    
        // Extract the structured response
        args = response.choices[0].message.tool_calls[0].function.arguments;
        argsJson = JSON.parse(args)
        console.log(argsJson)
        const { react_code, css_code, conversion_report } = argsJson
        // Write the generated files
        writeToFile(reactFilePath, react_code, 'React file');
        writeToFile(cssFilePath, css_code, 'CSS file');
        writeToFile(reportFilePath, conversion_report, 'Report file');
        } catch (error) {
        console.error('Error processing LLM response:', error);
        }
    });

}

// Function to read all .frm files in a directory and its subdirectories
function getFrmFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        // Recursively search directories
        results = results.concat(getFrmFiles(filePath));
      } else if (file.endsWith('.frm')) {
        results.push(filePath);
      }
    });
    return results;
  }

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
  return `You are an expert coder's assistant, helping to transform legacy VB6 form files into modern React.js applications. Please use all of your knowledge and any relevant documentation available on the internet to assist in this transformation.

  Convert the following VB6 form components to a React.js application with the following requirements:
  
  Components:
  ${JSON.stringify(components, null, 2)}
  
  Objective:
  Transform the code in the VB6 components into a new, fully functional React.js component, including both the UI and any logic functions present in the original VB6 code. Use only basic React libraries to convert forms from VB6.
  
  You should take into account:
  - Proper React component structuring, ensuring best practices are used.
  - Converting all VB6 logic functions, event handlers, and control flow into appropriate React hooks or class methods.
  - Identifying and addressing any potential challenges or discrepancies in the logic during the conversion.
  - Utilizing your knowledge of how React manages state and events compared to VB6 to ensure equivalent functionality is achieved.
  
  Deliverables:
  - ReactJS File: Include both the UI and logic code in a .jsx file and also import the generated Stylesheet File. Ensure that all logic functions (e.g., event handlers, validation, and other business logic) from the original VB6 code are properly implemented in the React component.
  - Stylesheet File: Provide a separate stylesheet file (e.g., .css or .scss) used by the ReactJS file.
  - Report File: Create a report that contains the mapping table (old and new function and variable names) and notes about any code that couldn't be converted, including suggestions on how to handle it in the React component.
  
  Remember, you are acting as a coding assistant, and your goal is to provide the best possible transformation using modern coding techniques.`;
}

// Function to send prompt to LLM
async function sendPromptToLLM(prompt) {
  try {
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-3.5-turbo',
    //   messages: [
    //     {
    //       role: 'user',
    //       content: prompt,
    //     },
    //   ],
    //   tools: tools,
    //   max_tokens: 1500,
    // });
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      temperature: 0,
      system: "You are an expert coder's assistant the senior of VB6 and also FE (ReactJs and Tailwind), helping me to transform legacy VB6 form files into modern React.js applications using Tailwind.",
      tools: tools,
      tool_choice:{"type": "tool", "name": "convert_vb6_to_react"},
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "image",
              "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": "<base64_encoded_image>"
              }
            },
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ]
    });
    return msg
  } catch (error) {
    throw error;
  }
}

// Function to write content to a file
function writeToFile(filePath, content, fileDescription) {

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(`Error writing ${fileDescription}:`, err);
      return;
    }
    console.log(`${fileDescription} written successfully`);
  });
}

// Ensure the output folder exists
outputRootDirectory = path.join(rootDirectory, 'output')

if (!fs.existsSync(outputRootDirectory)) {
    fs.mkdirSync(outputRootDirectory);
}

// Start processing all .frm files in the root directory
const frmFiles = getFrmFiles(rootDirectory);
frmFiles.forEach((filePath) => {
  processFrmFile(filePath, outputRootDirectory);
});


// Function to encode file to Base64
function encodeImageToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}