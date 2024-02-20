import OpenAI from 'openai';

let openaiclient;

try {  
    const openAIKeyFromEnv = process.env.OPENAI_API_KEY;
    console.log("openAIKey from env!!!!!!!!!!!!!!!!!!!!!!!!: ", openAIKeyFromEnv);

    if(openAIKeyFromEnv==undefined || openAIKeyFromEnv==""){
        console.log("No OpenAI key, add it to .env file");
        throw new Error('No OpenAI key, add it to .env file');
    }

    openaiclient = new OpenAI({ apiKey: openAIKeyFromEnv });
    console.log("openaiclient created");
} catch (error) {
  console.error('Error creating OpenAI client:', error);
}

export default openaiclient;