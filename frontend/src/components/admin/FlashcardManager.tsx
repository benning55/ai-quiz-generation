"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  BookOpen,
  Tag,
  Calendar,
  Save,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { API_ENDPOINTS } from '@/config/api'

type Flashcard = {
  id: number
  question: string
  answer: string
  category: string | null
  tags: string[] | null
  chapter_id: number | null
  chapter?: {
    id: number
    title: string
    order: number
  }
  created_at: string
}

type Chapter = {
  id: number
  title: string
  description: string
  order: number
}

export default function FlashcardManager() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    chapter_id: null as number | null,
    tags: '' as string
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterFlashcards()
  }, [flashcards, searchTerm, selectedChapter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load flashcards and chapters in parallel
      const [flashcardsResponse, chaptersResponse] = await Promise.all([
        fetch(API_ENDPOINTS.FLASHCARDS + '?limit=1000'),
        fetch('/api/chapters/')
      ])

      if (flashcardsResponse.ok && chaptersResponse.ok) {
        const [flashcardsData, chaptersData] = await Promise.all([
          flashcardsResponse.json(),
          chaptersResponse.json()
        ])
        
        setFlashcards(flashcardsData)
        setChapters(chaptersData.sort((a: Chapter, b: Chapter) => a.order - b.order))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFlashcards = () => {
    let filtered = flashcards

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by chapter
    if (selectedChapter !== null) {
      filtered = filtered.filter(card => card.chapter_id === selectedChapter)
    }

    setFilteredFlashcards(filtered)
    setCurrentPage(1)
  }

  const openDialog = (flashcard?: Flashcard) => {
    if (flashcard) {
      setEditingFlashcard(flashcard)
      setFormData({
        question: flashcard.question,
        answer: flashcard.answer,
        chapter_id: flashcard.chapter_id,
        tags: flashcard.tags?.join(', ') || ''
      })
    } else {
      setEditingFlashcard(null)
      setFormData({
        question: '',
        answer: '',
        chapter_id: null,
        tags: ''
      })
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingFlashcard(null)
    setFormData({
      question: '',
      answer: '',
      chapter_id: null,
      tags: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const flashcardData = {
      question: formData.question,
      answer: formData.answer,
      chapter_id: formData.chapter_id,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    }

    try {
      let response
      if (editingFlashcard) {
        // Update existing flashcard
        response = await fetch(`${API_ENDPOINTS.FLASHCARDS}${editingFlashcard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flashcardData)
        })
      } else {
        // Create new flashcard
        response = await fetch(API_ENDPOINTS.FLASHCARDS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flashcardData)
        })
      }

      if (response.ok) {
        await loadData()
        closeDialog()
      } else {
        console.error('Error saving flashcard:', await response.text())
      }
    } catch (error) {
      console.error('Error saving flashcard:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return

    try {
      const response = await fetch(`${API_ENDPOINTS.FLASHCARDS}${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error)
    }
  }

  const assignToChapter = async (flashcardId: number, chapterTitle: string) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}/assign-chapter?chapter_title=${encodeURIComponent(chapterTitle)}`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Error assigning to chapter:', error)
    }
  }

  const exportFlashcards = () => {
    const dataStr = JSON.stringify(filteredFlashcards, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flashcards.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Pagination
  const totalPages = Math.ceil(filteredFlashcards.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFlashcards = filteredFlashcards.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading flashcards...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Flashcard Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search flashcards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Chapter Filter */}
              <select
                value={selectedChapter || ''}
                onChange={(e) => setSelectedChapter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Chapters</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.order}. {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={exportFlashcards} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Flashcard
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Flashcards</p>
              <p className="text-2xl font-bold text-blue-800">{flashcards.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">With Chapters</p>
              <p className="text-2xl font-bold text-green-800">
                {flashcards.filter(f => f.chapter_id).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Unassigned</p>
              <p className="text-2xl font-bold text-yellow-800">
                {flashcards.filter(f => !f.chapter_id).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Filtered Results</p>
              <p className="text-2xl font-bold text-purple-800">{filteredFlashcards.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashcards Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Question</th>
                  <th className="text-left p-4 font-medium">Answer</th>
                  <th className="text-left p-4 font-medium">Chapter</th>
                  <th className="text-left p-4 font-medium">Tags</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentFlashcards.map((flashcard) => (
                    <motion.tr
                      key={flashcard.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 max-w-xs">
                        <p className="truncate" title={flashcard.question}>
                          {flashcard.question}
                        </p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="truncate" title={flashcard.answer}>
                          {flashcard.answer}
                        </p>
                      </td>
                      <td className="p-4">
                        {flashcard.chapter ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {flashcard.chapter.order}. {flashcard.chapter.title}
                          </span>
                        ) : (
                          <select
                            onChange={(e) => {
                              const chapter = chapters.find(c => c.id === parseInt(e.target.value))
                              if (chapter) {
                                assignToChapter(flashcard.id, chapter.title)
                              }
                            }}
                            className="text-sm border rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="">Assign Chapter</option>
                            {chapters.map(chapter => (
                              <option key={chapter.id} value={chapter.id}>
                                {chapter.order}. {chapter.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        {flashcard.tags && flashcard.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {flashcard.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {flashcard.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{flashcard.tags.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No tags</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(flashcard)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(flashcard.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredFlashcards.length)} of {filteredFlashcards.length}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFlashcard ? 'Edit Flashcard' : 'Add New Flashcard'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question *</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="w-full p-3 border rounded-md resize-none h-24"
                placeholder="Enter the question..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Answer *</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                className="w-full p-3 border rounded-md resize-none h-24"
                placeholder="Enter the answer..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chapter</label>
              <select
                value={formData.chapter_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  chapter_id: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full p-3 border rounded-md"
              >
                <option value="">Select a chapter (optional)</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.order}. {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Enter tags separated by commas..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas (e.g., "history, government, important")
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingFlashcard ? 'Update' : 'Create'} Flashcard
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}