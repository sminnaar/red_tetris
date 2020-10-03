import Head from 'next/head'
import styles from '../styles/Home.module.css'
import MyApp from './_app'

import Tetris from '../components/Tetris'



export default function Home() {
    return (
        <div>
            <Tetris />
        </div>
    )

}