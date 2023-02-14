import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [state, setState] = useState({
    result: '',
    bookInput: '',
    loading: false
  });

  function handleState(key: string, value: string | boolean){
    setState(prevState => ({...prevState, [key]: value}))
  }

  async function onSubmit(event) {
    event.preventDefault();

    try {
      handleState('loading', true);
      handleState('result', '');
    
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ book: state.bookInput }),
      })

      let finalText = ''

      response.body
      .pipeThrough(new TextDecoderStream())
      .pipeTo(new WritableStream({
        write(chunk){
            try {
              const chunkWithouPrefixData = chunk.replace(/^data: /, '').trim().concat('\n')
              
              if (isValidJson(chunkWithouPrefixData)) {
                const parsedChunk = JSON.parse(chunkWithouPrefixData)
                const text = parsedChunk.choices[0].text
      
                finalText += text;
      
                handleState('result', finalText)
              } else {
                handleState('bookInput', '');
                handleState('loading', false)
              }

            } catch (error) {
              console.error(`Error parsing JSON: ${error}`)
            }
          }
        }))

      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch(error) {} 
  }

  function isValidJson(jsonString){
    try {
      JSON.parse(jsonString)
      return true
    } catch (error) {
      return false
    }
  }

  return (
    <div>
      <Head>
        <title>Book synopsis</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Book synopsis</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="book"
            placeholder="Enter an book and your author"
            value={state.bookInput}
            onChange={({target:{value}}) => handleState('bookInput', value)}
            disabled={state.loading}
          />
          <input type="submit" value="Book synopsis" disabled={state.loading}/>
        </form>
        <div className={styles.result}>{state.result}</div>
      </main>
    </div>
  );
}
