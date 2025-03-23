import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Clock, Calendar, Loader2 } from "lucide-react"
import axios from "axios"

// Base task type
interface BaseTask {
  name: string
  days: string[]
  time: string
  duration: number
  travel?: number
}

// Extra task type
interface ExtraTask {
  name: string
  frequency: number
  duration: number
}

// Pre-populated base tasks (your recurring tasks)
const initialBaseTasks: BaseTask[] = [
  {
    name: "Part-Time Job",
    days: ["Tue", "Wed", "Thu"],
    time: "09:30 - 18:00",
    duration: 8.5,
    travel: 3,
  },
  {
    name: "Class - Project1",
    days: ["Mon"],
    time: "10:00 - 12:00",
    duration: 2,
    travel: 3,
  },
  {
    name: "Class - Digital Forensics",
    days: ["Fri"],
    time: "15:00 - 18:00",
    duration: 3,
    travel: 3,
  },
  { name: "Software Job - Domonit", days: [], time: "", duration: 10 },
  { name: "Software Job - Cookly", days: [], time: "", duration: 10 },
  { name: "Fitness - Weight Lifting", days: [], time: "", duration: 3 },
  { name: "Study Azure AZ-900", days: [], time: "", duration: 8 }, // Added Azure study
  { name: "Study class material/homework", days: [], time: "", duration: 6 }, // Added general study
]

export default function ScheduleInputForm() {
  const [baseTasks] = useState<BaseTask[]>(initialBaseTasks)
  const [extraTasks, setExtraTasks] = useState<ExtraTask[]>([])
  const [extraTaskName, setExtraTaskName] = useState("")
  const [extraTaskFrequency, setExtraTaskFrequency] = useState("1")
  const [extraTaskDuration, setExtraTaskDuration] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addExtraTask = () => {
    if (!extraTaskName || !extraTaskDuration) return
    const newTask: ExtraTask = {
      name: extraTaskName,
      frequency: parseInt(extraTaskFrequency),
      duration: parseFloat(extraTaskDuration),
    }
    setExtraTasks([...extraTasks, newTask])
    setExtraTaskName("")
    setExtraTaskFrequency("1")
    setExtraTaskDuration("")
  }

  const generateSchedule = async () => {
    setLoading(true)
    setError(null)
    setSubmitSuccess(false)

    const data = {
      wakeTime: "07:00",
      sleepTime: "00:00",
      baseTasks,
      extraTasks,
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/generate-schedule/",
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      console.log("Schedule created:", response.data)
      setSubmitSuccess(true)
      setTimeout(() => setSubmitSuccess(false), 3000) // Show success for 3 seconds
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        "Failed to generate schedule. Please try again."
      setError(errorMessage)
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-blue-50'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-2xl'
      >
        <h2 className='text-4xl font-bold mb-6 text-center text-blue-950'>
          Weekly Scheduler
        </h2>

        {/* Base Tasks Display */}
        <Card className='bg-white shadow-lg border-0 rounded-xl mb-6'>
          <CardContent className='p-6'>
            <h3 className='text-2xl font-bold mb-4 text-blue-950'>
              Base Tasks (Weekly)
            </h3>
            <AnimatePresence>
              {baseTasks.map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='mb-3'
                >
                  <div className='flex items-center justify-between text-blue-900'>
                    <div>
                      <h4 className='font-semibold'>{task.name}</h4>
                      <p className='text-sm'>
                        {task.days.length > 0
                          ? `${task.days.join(", ")} | ${task.time}`
                          : "Flexible"}
                        {task.travel ? ` | Travel: ${task.travel}h` : ""}
                      </p>
                      <p className='text-sm flex items-center'>
                        <Clock className='w-4 h-4 mr-1' />
                        {task.duration}h/week
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Extra Tasks Input */}
        <Card className='bg-white shadow-lg border-0 rounded-xl'>
          <CardContent className='p-6'>
            <h3 className='text-2xl font-bold mb-4 text-blue-950'>
              Add Extra Tasks (This Week)
            </h3>
            <form onSubmit={(e) => e.preventDefault()} className='space-y-6'>
              <div className='space-y-4'>
                <div>
                  <Label
                    htmlFor='extraTaskName'
                    className='text-sm font-medium text-blue-900'
                  >
                    Task Name
                  </Label>
                  <Input
                    id='extraTaskName'
                    value={extraTaskName}
                    onChange={(e) => setExtraTaskName(e.target.value)}
                    className='mt-1 border-blue-100 focus:border-blue-200 focus:ring-blue-200'
                    placeholder='e.g., Doctor Appointment'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label
                      htmlFor='extraTaskFrequency'
                      className='text-sm font-medium text-blue-900'
                    >
                      <Calendar className='w-4 h-4 inline mr-1' />
                      Frequency (times/week)
                    </Label>
                    <Input
                      id='extraTaskFrequency'
                      type='number'
                      value={extraTaskFrequency}
                      onChange={(e) => setExtraTaskFrequency(e.target.value)}
                      className='mt-1 border-blue-100 focus:border-blue-200 focus:ring-blue-200'
                      min='1'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='extraTaskDuration'
                      className='text-sm font-medium text-blue-900'
                    >
                      <Clock className='w-4 h-4 inline mr-1' />
                      Duration (hours)
                    </Label>
                    <Input
                      id='extraTaskDuration'
                      type='number'
                      value={extraTaskDuration}
                      onChange={(e) => setExtraTaskDuration(e.target.value)}
                      className='mt-1 border-blue-100 focus:border-blue-200 focus:ring-blue-200'
                      step='0.5'
                      min='0.5'
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-center pt-4'>
                <Button
                  onClick={addExtraTask}
                  disabled={!extraTaskName || !extraTaskDuration || loading}
                  className='w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors'
                >
                  <Plus className='mr-2' />
                  Add Extra Task
                </Button>
              </div>
            </form>

            {/* Display Added Extra Tasks */}
            {extraTasks.length > 0 && (
              <div className='mt-6'>
                <h4 className='text-lg font-semibold text-blue-950'>
                  Added Extra Tasks
                </h4>
                <AnimatePresence>
                  {extraTasks.map((task, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className='mt-2'
                    >
                      <p className='text-blue-900'>
                        {task.name} | {task.frequency}x/week | {task.duration}h
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Schedule Button */}
        <div className='mt-6 flex justify-center'>
          <Button
            onClick={generateSchedule}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              "Generate Schedule"
            )}
          </Button>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='text-center text-emerald-500 font-medium mt-4'
            >
              Schedule booked successfully on Google Calendar! ✨
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='text-center text-rose-500 font-medium mt-4'
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
