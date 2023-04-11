import { GetServerSideProps } from "next";
import Head from "next/head";
import { db } from '../../services/firebaseConnection'
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { Textarea } from "../../components/textarea";
import { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { FaTrash } from 'react-icons/fa'

interface SingleTaskProps {
  singleTask: {
    task: string
    created: string
    public: boolean
    user: string
    taskId: string
  }
  commentsList: CommentsProps[]
}

interface CommentsProps {
  id: string
  comment: string
  taskId: string
  user: string
  name: string
}

export default function Task({ singleTask, commentsList }: SingleTaskProps) {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [comments, setComments] = useState<CommentsProps[]>(commentsList || [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (input === "") return

    if (!session?.user?.email || !session?.user?.name) return

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: singleTask?.taskId
      })

      const newComment = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: singleTask?.taskId
      }

      setComments((previousItems) => [...previousItems, newComment])
      setInput('')
    }catch(error) {
      console.log(error)
    }
  } 

  async function handleDelete(id: string) {
    try {
      const deletedComment = doc(db, "comments", id)
      await deleteDoc(deletedComment)
      
      const updateCommentList = comments.filter( (comment) => comment.id !== id )
      setComments(updateCommentList)
    }catch(error) {
      console.log(error)
    }
  }

  return (
    <div className="w-full max-w-5xl mt-10 mx-auto mb-0 px-4 flex flex-col items-center justify-center font-roboto">
      <Head>
        <title>Task Details Page</title>
      </Head>
      <main className="mt-16 w-full">
        <h1 className="mb-3 text-2xl font-semibold">Task</h1>
        <article className="border border-gray-400 p-3 leading-8 rounded flex items-center justify-center">
          <p className="whitespace-pre-wrap w-full">
            { singleTask.task }
          </p>
        </article>
      </main>
      <section className="w-full my-4 max-w-5xl">
        <h2 className="mt-3 mb-1 mx-0 text-xl">Add comments: </h2>
        <form onSubmit={handleSubmit}>
          <Textarea 
            disabled={!session?.user}
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder="Type your comment..."
          />
          <button 
            disabled={!session?.user}
            className={`w-full py-2 rounded border-0 text-white text-lg hover:scale-y-105 transform duration-500 ${!session?.user ? 'bg-blue-200 cursor-not-allowed' : 'bg-blue-500 cursor-pointer'}`}
          >
            Send
          </button>
        </form>
      </section>
      <section className="w-full max-w-5xl">
        <h2 className="mb-1 mt-3 mx-0 text-lg">Last comments:</h2>
        { comments.length === 0 && (
          <span className="text-sm text-red-500">No comments so far. Be the first to create a comment...</span>
        )}

        { comments.map(singelComment => (
          <article key={singelComment.id} className="border border-gray-400 p-3 rounded mb-3">
            <div className="flex items-center">
              <label className="bg-gray-200 py-0.5 px-1 rounded mr-2 text-blue-900">{ singelComment.name }</label>
              { singelComment.user === session?.user?.email && (
                <button 
                  className="text-red-500 border-0 bg-transparent"
                  onClick={() => handleDelete(singelComment.id)}
                >
                  <FaTrash />
                </button>
              ) }
            </div>
            <p className="mt-3 whitespace-pre-wrap">{ singelComment.comment }</p>
          </article>
        )) }
      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string
  const docRef = doc(db, "tasks", id)

  const qry = query(collection(db, "comments"), where("taskId", "==", id))
  const snapshotComments = await getDocs(qry)

  let allComments: CommentsProps[] = []
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId
    })
  })

  const snapshot = await getDoc(docRef)

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  if (!snapshot.data()?.public) { // ou napshot.data()?.public === false
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const ms = snapshot.data()?.created?.seconds * 1000
  const task = {
    task: snapshot.data()?.task,
    public: snapshot.data()?.public,
    created: new Date(ms).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id
  }

  return {
    props: {
      singleTask: task, 
      commentsList: allComments,
    }
  }
}