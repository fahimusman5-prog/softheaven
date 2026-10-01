'use client';
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="en"><body style={{fontFamily:'Arial,sans-serif',padding:40,color:'#24324b'}}><h1>SoftHaven is temporarily unavailable.</h1><p>We could not connect to the store. Please retry in a moment.</p><button onClick={reset}>Try again</button></body></html>;}
