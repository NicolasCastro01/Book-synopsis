import { createReadStream } from "fs";
import { TransformStream } from "node:stream/web";
import { Configuration, OpenAIApi } from "openai";
import { Readable, Transform } from "stream";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {

  if(req.method === 'GET'){
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*',
      'Connection': 'keep-alive'
    })
    res.flushHeaders()
    res.end()
    return
  }

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const book = req.body.book || "";
  if (book.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid book",
      },
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePromptBook(book),
      temperature: 0,
      max_tokens: 2048,
      stream: true
    },
    {responseType: 'stream'}) as any;

    completion.data.pipe(res)
    
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePromptBook(book){
  return `
    Pesquise a sinopse do livro e me retorne

    Nome do livro: ${book}
    Sinopse:
  `
}
