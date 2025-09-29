"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Upload, 
  Download, 
  FileText, 
  Table, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  FileSpreadsheet
} from "lucide-react"

type ImportResult = {
  success: boolean
  imported: number
  skipped: number
  total: number
  errors?: string[]
}

type Chapter = {
  id: number
  title: string
  order: number
}

interface BulkImporterProps {
  chapters: Chapter[]
  onImportComplete: () => void
}

export default function BulkImporter({ chapters, onImportComplete }: BulkImporterProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    
    if (fileType === 'json') {
      await handleJSONImport(file)
    } else if (fileType === 'csv') {
      await handleCSVImport(file)
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      alert('Excel files not yet supported. Please convert to CSV or JSON.')
    } else {
      alert('Unsupported file type. Please use JSON or CSV files.')
    }
  }

  const handleJSONImport = async (file: File) => {
    try {
      setIsImporting(true)
      setImportResult(null)

      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validate JSON structure
      if (!Array.isArray(data.flashcards) && !Array.isArray(data)) {
        throw new Error('Invalid JSON format. Expected array of flashcards or object with flashcards array.')
      }

      const flashcards = Array.isArray(data) ? data : data.flashcards

      const response = await fetch('/api/import-flashcards-json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards })
      })

      const result = await response.json()
      setImportResult(result)
      
      if (result.success) {
        onImportComplete()
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleCSVImport = async (file: File) => {
    try {
      setIsImporting(true)
      setImportResult(null)

      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row')
      }

      // Parse CSV header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      
      // Validate required columns
      const requiredColumns = ['question', 'answer']
      const missingColumns = requiredColumns.filter(col => !headers.includes(col))
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
      }

      // Parse data rows
      const flashcards = []
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const flashcard: any = {}

          headers.forEach((header, index) => {
            const value = values[index] || ''
            
            switch (header) {
              case 'question':
                flashcard.question = value
                break
              case 'answer':
                flashcard.answer = value
                break
              case 'chapter':
              case 'chapter_title':
                // Find chapter by title
                const chapter = chapters.find(c => 
                  c.title.toLowerCase().includes(value.toLowerCase()) ||
                  value.toLowerCase().includes(c.title.toLowerCase())
                )
                if (chapter) {
                  flashcard.chapter_id = chapter.id
                }
                break
              case 'category':
                flashcard.category = value
                break
              case 'tags':
                flashcard.tags = value ? value.split(';').map(tag => tag.trim()).filter(tag => tag) : []
                break
            }
          })

          if (!flashcard.question || !flashcard.answer) {
            errors.push(`Row ${i + 1}: Missing question or answer`)
            continue
          }

          flashcards.push(flashcard)
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
        }
      }

      if (flashcards.length === 0) {
        throw new Error('No valid flashcards found in CSV')
      }

      // Import flashcards
      const response = await fetch('/api/import-flashcards-json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards })
      })

      const result = await response.json()
      
      if (errors.length > 0) {
        result.errors = [...(result.errors || []), ...errors]
      }
      
      setImportResult(result)
      
      if (result.success) {
        onImportComplete()
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const template = {
        flashcards: [
          {
            question: "What are the official languages of Canada?",
            answer: "English and French",
            chapter_id: 2, // "Who We Are"
            tags: ["languages", "official", "basic"]
          },
          {
            question: "When did Canada become a country?",
            answer: "July 1, 1867",
            chapter_id: 3, // "Canada History"
            tags: ["confederation", "history", "date"]
          }
        ]
      }

      const dataStr = JSON.stringify(template, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'flashcards_template.json'
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const csvContent = [
        'question,answer,chapter,tags,category',
        '"What are the official languages of Canada?","English and French","Who We Are","languages;official;basic",""',
        '"When did Canada become a country?","July 1, 1867","Canada History","confederation;history;date",""'
      ].join('\n')

      const dataBlob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'flashcards_template.csv'
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Import Flashcards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Template Downloads */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Download Templates</h3>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => downloadTemplate('json')}>
                <FileText className="w-4 h-4 mr-2" />
                JSON Template
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate('csv')}>
                <Table className="w-4 h-4 mr-2" />
                CSV Template
              </Button>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {isImporting ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-4" />
                <p className="text-lg font-medium">Importing flashcards...</p>
                <p className="text-sm text-gray-500">Please wait while we process your file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-lg font-medium mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JSON and CSV files
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className={`border-2 ${importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {importResult.success ? 'Import Successful!' : 'Import Failed'}
                      </h4>
                      <div className="mt-2 text-sm">
                        <p>Total processed: {importResult.total}</p>
                        <p>Successfully imported: {importResult.imported}</p>
                        <p>Skipped: {importResult.skipped}</p>
                      </div>
                      
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-red-800 mb-2">Errors:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li>• ... and {importResult.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setImportResult(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Format Guide */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">File Format Guide</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div>
                <strong>JSON Format:</strong> Use the template with "flashcards" array containing objects with question, answer, chapter_id, and tags fields.
              </div>
              <div>
                <strong>CSV Format:</strong> Required columns: question, answer. Optional: chapter, tags (semicolon-separated), category.
              </div>
              <div>
                <strong>Chapter Assignment:</strong> Use chapter titles (e.g., "Rights and Responsibilities") or chapter IDs.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}