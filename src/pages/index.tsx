import Head from 'next/head'
import Image from 'next/image'
import heroPng from '../assets/hero.png'
import { GetStaticProps } from 'next'
import { db } from '../services/firebaseConnection'
import { collection, getDocs } from 'firebase/firestore'

interface HomeProps {
  posts: number
  comments: number
}

export default function Home({posts, comments}: HomeProps) {
  return (
    <div className='bg-black w-full h-screen flex justify-center items-center flex-col overflow-hidden'>
      <Head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Roboto:wght@400;500;700&display=swap');
        </style>
        <title>Tasks+</title>
      </Head>
      <main>
        <div className='flex flex-col items-center justify-center overflow-y-scroll'>
          <Image 
            alt='Logo Tarefas+'
            src={heroPng}
            priority
            className='object-contain w-auto h-auto'
          />
        </div>
        <h1 className='text-white text-center m-7 leading-8 md:text-4xl'>Application built for you to organize <br /> your studies and tasks</h1>
        <div className='flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-around'>
          <section className='bg-white rounded px-2 md:px-8 py-1 md:py-3 hover:scale-105 transform duration-500 w-80 md:w-48 text-center'>
            <span>+{posts} Posts</span>
          </section>
          <section className='bg-white rounded px-1 md:px-8 py-1 md:py-3 hover:scale-105 transform duration-500 w-80 md:w-48 text-center'>
            <span>+{comments} Comments</span>
          </section>
        </div>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const postRef = collection(db, "tasks")
  const postsQty = await getDocs(postRef)
  
  const commentRef = collection(db, "comments")
  const commentsQty = await getDocs(commentRef)

  return {
    props: {
      posts: postsQty.size || 0,
      comments: commentsQty.size || 0
    },
    revalidate: 60 // revalidação a cada 60 segundos
  }
}