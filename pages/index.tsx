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
      handleState('loading', true)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ book: state.bookInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      handleState('result', data.result)
      handleState('bookInput', '');
    } catch(error) {
      console.error(error);
      if(error.response.status === 504){
        onSubmit(event)
      }
    } finally {
      handleState('loading', false)
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
            placeholder="Enter an book"
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
