import { GetServerSideProps } from 'next'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { Textarea } from '../../components/textarea'
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import { db } from '../../services/firebaseConnection'
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import Link from 'next/link'

interface HomeProps {
  user: {
    email: string
  }
}

interface TaskProps {
  id: string
  created: Date
  public: boolean
  task: string
  user: string
}

export default function Dashboard({ user }: HomeProps) {
  const [input, setInput] = useState('')
  const [publicTask, setPublicTask] = useState(false)
  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {
    async function loadTasks() {
      const taskRef = collection(db, "tasks")
      const qry = query(
        taskRef, orderBy('created', 'desc'), where('user', '==', user?.email)
      )
      onSnapshot(qry, (snapshot) => {
        let list = [] as TaskProps[]

        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            task: doc.data().task,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public
          })
        })
        setTasks(list)
      })
    }
    loadTasks()
  }, [user?.email])


  const handleChangePublic = (e: ChangeEvent<HTMLInputElement>) => {
    setPublicTask(e.target.checked)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
  

    if (input === '') return

    try {
      await addDoc(collection(db, "tasks"), {
        task: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      })

      setInput('')
      setPublicTask(false)

    }catch(error) {
      console.log(error)
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `https://todo-plus-built.vercel.app/task/${id}`
    )
  }

  async function handleDelete(id: string) {
    const docRef = doc(db, "tasks", id)
    await deleteDoc(docRef)
  }

  return (
    <div className='mt-16 w-full '>
      <Head>
        <title>Task+ Dashboard</title>
      </Head>
      <main>
        <section className='bg-black w-full flex items-center justify-center'>
          <div className='max-w-5xl w-full px-4 pb-7 mt-14'>
            <h1 className='text-white mb-2'>Add a new todo</h1>
            <form onSubmit={handleSubmit}>
              <Textarea 
                placeholder='Type your task...'
                value={input}
                onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              />
              <div className=''>
                <input 
                  type="checkbox" 
                  checked={publicTask}
                  onChange={handleChangePublic}
                  className='w-4 h-4 my-3'
                />
                <label className='text-white ml-2'>Make todo public</label>
              </div>
              <button 
                type="submit"
                className='w-full border-0 rounded text-white bg-blue-500 py-2 text-lg'
              >
                Add Todo
              </button>
            </form>
          </div>
        </section>
        
        <section className='mt-8 mx-auto mb-0 px-4 w-full max-w-5xl flex flex-col'>
          { tasks.length < 1 ? 
            <h1 className='text-center text-2xl mb-3 text-red-500'>You didn't create tasks yet!</h1> :
            <h1 className='text-center text-2xl mb-3'>My Todos</h1> }

          { tasks.map(task => (
            <article key={task.id} className='mb-3 leading-8 flex flex-col items-start border border-gray-400 rounded p-3'>

              { task.public === true && (
                <div className='flex items-center justify-center mb-2 '>
                  <label className='bg-blue-500 px-1 rounded text-base'>Public</label>
                  <button 
                  onClick={() => handleShare(task.id)}
                    className='text-blue-500 bg-transparent border-0 mx-2'
                  >
                    <FiShare2 />
                  </button>
                </div>
              ) }
              
              <div className='w-full flex items-center justify-between'>

                { task.public === true ? (
                  <Link href={`/task/${task.id}`}>
                    <p className='whitespace-pre-wrap'>{ task.task }</p>
                  </Link>
                ) : (
                  <p className='whitespace-pre-wrap'>{ task.task }</p>
                ) }
                
                <button 
                onClick={() => handleDelete(task.id)}
                  className='text-red-500 bg-trasnparent border-o mx-2'>
                  <FaTrash 
                />
                </button>
              </div>
            </article>
          )) }
          
        </section>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      user: {
        email: session?.user?.email
      }
    }
  }
}