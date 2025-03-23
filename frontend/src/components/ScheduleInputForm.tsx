"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Using Shadcn UI Input
import { Label } from "@/components/ui/label" // Import Label component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Correct Select and SelectItem components
import { Loader2, CheckCircle } from "lucide-react"

interface TaskInput {
  taskName: string
  estimatedTime: string
  priority: string
  dueDate: string
}

export default function ScheduleInputForm() {
  const [taskName, setTaskName] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [tasks, setTasks] = useState<TaskInput[]>([])
  const [loading, setLoading] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = () => {
    const newTask = { taskName, estimatedTime, priority, dueDate }
    setTasks([...tasks, newTask])

    const outputJSON = { tasks: [...tasks, newTask] }
    console.log("Generated Schedule JSON:", JSON.stringify(outputJSON, null, 2))

    setSubmitSuccess(true)
    setLoading(false)
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6'>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-2xl'
      >
        <h2 className='text-3xl font-bold mb-4'>Enter Your Tasks</h2>

        <Card className='bg-gray-800 p-6 rounded-xl shadow-lg'>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className='space-y-4'>
                {/* Task Name Input */}
                <div>
                  <Label htmlFor='taskName'>Task Name</Label>
                  <Input
                    id='taskName'
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className='bg-gray-700 text-white'
                    placeholder='Enter task name'
                  />
                </div>

                {/* Estimated Time Input */}
                <div>
                  <Label htmlFor='estimatedTime'>Estimated Time (hours)</Label>
                  <Input
                    id='estimatedTime'
                    type='number'
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className='bg-gray-700 text-white'
                    placeholder='Enter estimated time'
                  />
                </div>

                {/* Priority Select */}
                <div>
                  <Label htmlFor='priority'>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className='bg-gray-700 text-white'>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent className='bg-gray-700'>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date Input */}
                <div>
                  <Label htmlFor='dueDate'>Due Date</Label>
                  <Input
                    id='dueDate'
                    type='date'
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className='bg-gray-700 text-white'
                  />
                </div>
              </div>

              <div className='flex justify-center mt-6'>
                <Button
                  onClick={() => {
                    setLoading(true)
                    handleSubmit()
                  }}
                  disabled={loading || !taskName || !estimatedTime || !dueDate}
                  className='bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg flex items-center gap-2'
                >
                  {loading ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Submit Task
                </Button>
              </div>

              {submitSuccess && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className='mt-4 text-lg font-semibold text-green-400'
                >
                  🎉 Task Added Successfully!
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='mt-6 w-full max-w-2xl'
      >
        <h3 className='text-2xl font-bold mb-4'>Task List</h3>
        <ul className='space-y-4'>
          {tasks.map((task, index) => (
            <li key={index} className='bg-gray-700 p-4 rounded-lg'>
              <h4 className='text-xl font-semibold'>{task.taskName}</h4>
              <p className='text-sm'>
                Estimated Time: {task.estimatedTime} hours
              </p>
              <p className='text-sm'>Priority: {task.priority}</p>
              <p className='text-sm'>Due Date: {task.dueDate}</p>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
