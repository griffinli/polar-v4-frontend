import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
    return (
        <>
            <Head>
                <title>Polar</title>
                {/*<meta name="description" content="Generated by create next app"/>*/}
                {/*<link rel="icon" href="/favicon.ico"/>*/}
            </Head>

            <div className={styles.button_container}>
                <p className={styles.dialogue}>Which company made your product?</p>

                <Link href="/apple">
                    <button className={styles.option}>Apple</button>
                </Link>

                <Link href="/microsoft">
                    <button className={styles.option}>Microsoft</button>
                </Link>
            </div>
        </>
    )
}
