// app/teacher/courses/CreateCoursePage.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation' // 🌟 NEW: Import useRouter for redirection
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'
import { createCourse } from '../_actions/course.actions' 
// 👇 We import all the icons AND the LucideIcon type
import { Save, Clock, BookOpen, Video, FileText, Bold, Italic, Underline, List, Heading, Link, Pilcrow, UploadCloud, CheckCircle, XCircle, LucideIcon } from 'lucide-react'

// --- Rich Text Editor Component (Unchanged) ---
const RichTextEditor = ({ name, placeholder }: { name: string, placeholder: string }) => {
    const [content, setContent] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const selectionRangeRef = useRef<Range | null>(null);

    // 2. Handler to update state on input events
    const handleInput = useCallback(() => {
        const htmlContent = contentRef.current?.innerHTML || '';
        setContent(htmlContent);
    }, []);
    
    // 3. Logic to apply formatting using native browser command
    const applyFormatting = (command: string, value: string | undefined = undefined) => {
        // Ensure the command is executed on the selected text
        document.execCommand(command, false, value);

        // Manually update the hidden input state after execution
        handleInput();
        contentRef.current?.focus();
    };

    // Store the current text selection when the user clicks the Link button
    const handleLinkClick = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selectionRangeRef.current = selection.getRangeAt(0);
            
            // Try to pre-fill linkText with selected text
            const selectedText = selection.toString();
            setLinkText(selectedText);

            setIsLinkDialogOpen(true);
        } else {
            // If no text is selected, just open the dialog
            setIsLinkDialogOpen(true);
        }
    };

    // Apply the link after the dialog is confirmed
    const handleApplyLink = () => {
        if (linkUrl.trim() === '') {
            toast.error("URL cannot be empty.");
            return;
        }

        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

        if (selectionRangeRef.current) {
            // Restore selection before applying link command
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(selectionRangeRef.current);
            }
        } else if (linkText.trim() !== '') {
            // If no range was captured but text was entered, insert the text first
            document.execCommand('insertText', false, linkText);
        }

        // Apply link command
        applyFormatting('createLink', url);

        // Close and reset state
        setIsLinkDialogOpen(false);
        setLinkUrl('');
        setLinkText('');
        selectionRangeRef.current = null;
    };

    // Initialize contentEditable
    useEffect(() => {
        if (contentRef.current && !contentRef.current.innerHTML) {
            contentRef.current.innerHTML = '';
        }
    }, []);

    // 🎯 FIX: Changed 'icon: any' to 'icon: LucideIcon'
    const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: LucideIcon, onClick: () => void, title: string }) => (
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={onClick} 
            title={title}
            className="h-8 w-8 text-gray-700 hover:bg-gray-100 transition-colors"
        >
            <Icon className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            {/* Link Insertion Dialog (Modal) */}
            {isLinkDialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Insert Link</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="linkText">Link Text (Optional)</Label>
                                <Input 
                                    id="linkText"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Text to display"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="linkUrl">URL</Label>
                                <Input 
                                    id="linkUrl"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsLinkDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="button" 
                                    onClick={handleApplyLink} 
                                    disabled={linkUrl.trim() === ''}
                                >
                                    Insert Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            <div className="border rounded-lg bg-gray-50 flex flex-col shadow-sm">
                {/* Hidden Input to ensure Server Action (FormData) gets the final HTML content */}
                <input type="hidden" name={name} value={content} />

                {/* Functional Toolbar */}
                <div className="flex items-center p-2 border-b bg-white rounded-t-lg">
                    
                    {/* Inline Formatting controls (using document.execCommand) */}
                    <div className='flex items-center space-x-1 border-r pr-2 mr-2'>
                        <ToolbarButton icon={Bold} onClick={() => applyFormatting('bold')} title="Bold (Ctrl+B)" />
                        <ToolbarButton icon={Italic} onClick={() => applyFormatting('italic')} title="Italic (Ctrl+I)" />
                        <ToolbarButton icon={Underline} onClick={() => applyFormatting('underline')} title="Underline (Ctrl+U)" /> 
                    </div>

                    {/* Block Formatting controls */}
                    <div className='flex items-center space-x-1 border-r pr-2 mr-2'>
                        {/* H2 */}
                        <ToolbarButton icon={Heading} onClick={() => applyFormatting('formatBlock', '<h2>')} title="Heading 2" />
                        {/* Unordered List */}
                        <ToolbarButton icon={List} onClick={() => applyFormatting('insertUnorderedList')} title="Bullet List" />
                        {/* Link - Now opens custom dialog */}
                        <ToolbarButton icon={Link} onClick={handleLinkClick} title="Insert Link" />
                    </div>
                    
                    {/* Misc Controls (Simulated or simple) */}
                    <div className='flex items-center space-x-1'>
                        <ToolbarButton icon={Pilcrow} onClick={() => applyFormatting('insertParagraph')} title="New Paragraph" />
                        {/* Placeholder for custom/color control */}
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-gray-100 transition-colors" title="Text Color (Simulated)">
                            A
                        </Button>
                    </div>
                </div>

                {/* The actual contentEditable div for visual rich text input */}
                <div
                    ref={contentRef}
                    contentEditable={true}
                    onInput={handleInput}
                    // Styling to make it look like a seamless input field
                    className="flex-1 w-full border-none focus-visible:ring-0 resize-none h-full min-h-[250px] p-4 bg-white outline-none overflow-y-auto" 
                    role="textbox"
                    aria-multiline="true"
                    data-placeholder={placeholder}
                    style={{ WebkitUserModify: 'read-write', userSelect: 'auto' }}
                />
            </div>
        </>
    )
}
// --- End Rich Text Editor Component ---


export default function CreateCoursePage() {
  const router = useRouter() // 🌟 NEW: Initialize router
  const [publishOption, setPublishOption] = useState<'draft' | 'publish' | 'schedule'>('draft')

  // State for video upload management
  const [videoUploadState, setVideoUploadState] = useState<{
    file: File | null;
    progress: number;
    url: string | null; // This will hold the local Blob URL for preview only
    error: string | null;
  }>({ file: null, progress: 0, url: null, error: null });

  // 1. We remove Firebase Auth setup, so we set isAuthReady to true immediately
  const isAuthReady = true;

  // 2. MODIFIED Video Upload Handler: Stores the File object and creates a local preview URL.
  const handleFileUpload = (file: File) => {
    // --- BASIC CLIENT-SIDE VALIDATION ---
    if (!file.type.startsWith('video/')) {
        setVideoUploadState(prev => ({ ...prev, error: "File must be a video." }));
        toast.error("File must be a video type.");
        return;
    }

    // --- FILE READY STATE ---
    // Create a local blob URL for the video player to use in the browser.
    const localURL = URL.createObjectURL(file);
    
    // Store the actual file object and the local URL. Set progress to 100 
    // to indicate it's ready to be sent to the server.
    setVideoUploadState({ 
        file, 
        progress: 100, // Ready status
        url: localURL, 
        error: null 
    });
    toast.success("Video file selected and ready for submission.");
  };

  // 3. Form Submission Handler: Appends the File object to the FormData.
  const handleSubmit = async (formData: FormData) => {
    
    // Check for required file
    if (!videoUploadState.file) {
        toast.error("Please select a course video file.");
        return;
    }

    // 🌟 FIX: Append the actual File object to the form data
    // The key 'videoFile' must match the key expected by the Server Action
    formData.append('videoFile', videoUploadState.file);
    
    // Check if the mock 'videoUrl' field is still in the FormData and remove it if necessary
    // This is good practice to ensure clean data being sent.
    formData.delete('videoUrl'); 
    
    // Append the dynamic status choice to the form data
    formData.append('statusChoice', publishOption);
    
    // Check for scheduling date if selected
    if (publishOption === 'schedule' && !formData.get('scheduledDate')) {
        toast.error("Please select a scheduled date.");
        return;
    }
    
    // NOTE: The Server Action will now receive the file and save it to public/videos
    const result = await createCourse(formData) 
    
    if (result.success) {
      toast.success(result.message)
      // Redirect to the main courses page after success
      router.push('/teacher/courses') // 🌟 NEW: Redirect upon successful creation/save
    } else {
      toast.error(result.message)
    }
  }

  // Helper component for the styled file input
  const VideoUploadArea = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { file, progress, url, error } = videoUploadState;
    // Since we removed the simulation, isUploading is simplified
    const isReady = file && progress === 100;

    const MAX_FILE_SIZE_MB = 10000; 
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const handleVideoFile = (selectedFile: File) => {
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            const sizeError = `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`;
            setVideoUploadState(prev => ({ ...prev, error: sizeError }));
            toast.error(sizeError);
            return;
        }
        handleFileUpload(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation(); 
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleVideoFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleVideoFile(selectedFile);
        }
        e.target.value = ''; 
    };

    const handleClick = () => {
        // We only check for isReady since there's no progress state during client file selection
         fileInputRef.current?.click();
    };

    let content;

    if (isReady && url && file) {
        // STATE 1: File Selected - SHOW VIDEO PLAYER PREVIEW
        content = (
            <div className="flex flex-col w-full">
                <div className="relative w-full h-auto rounded-lg overflow-hidden bg-black mb-4">
                    {/* The Video Player Element using the local blob URL */}
                    <video 
                        src={url} 
                        controls 
                        className="w-full max-h-[300px] object-contain"
                        aria-label={`Preview of ${file.name}`}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="flex justify-between items-center px-2">
                    <div className='flex items-center text-green-600 space-x-2'>
                        <CheckCircle className="h-5 w-5" />
                        <p className="text-sm font-semibold truncate max-w-[200px]">{file.name} (Ready to upload)</p>
                    </div>
                    <Button 
                        type="button" 
                        variant="link" 
                        onClick={handleClick} 
                        className="text-indigo-600 p-0 h-auto text-sm"
                    >
                        Replace Video
                    </Button>
                </div>
            </div>
        );
    } else if (error) {
        // STATE 2: Error
        content = (
            <div className="flex flex-col items-center text-red-600 p-6">
                <XCircle className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Selection Error</p>
                <p className="text-xs text-center text-red-500 mt-1">{error}</p>
                <Button 
                    type="button" 
                    variant="link" 
                    onClick={handleClick} 
                    className="mt-2 text-indigo-600 p-0 h-auto"
                >
                    Try Selecting Again
                </Button>
            </div>
        );
    } else {
        // STATE 3: Initial/Ready to Select File
        content = (
            <div className="flex flex-col items-center p-6">
                <UploadCloud className="h-10 w-10 text-indigo-600 mb-3" />
                <p className="text-sm font-medium text-gray-700">Drag & drop your video file here</p>
                <p className="text-xs text-gray-500 mt-1">or click to browse (MP4, MOV)</p>
                <p className="text-xs text-gray-500 mt-1">Max file size: {MAX_FILE_SIZE_MB}MB</p>
                <Button 
                    type="button" 
                    onClick={handleClick} 
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Choose Video File
                </Button>
            </div>
        );
    }

    return (
        <div 
            // Conditional styling for the container based on state
            className={`border-2 border-dashed ${error ? 'border-red-400 bg-red-50/50' : isReady ? 'border-green-400' : 'border-gray-300'} rounded-lg p-4 transition-colors bg-white/70 flex justify-center items-center ${isReady ? 'min-h-auto' : 'min-h-[200px]'} cursor-pointer `}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={!isReady && !error ? handleClick : undefined} // Only click to trigger file selection if in initial state
        >
            <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                onChange={handleFileChange}
                className="hidden"
            />
            {/* The main content area: selection, error, or video preview */}
            <div className='w-full'>
                {content}
            </div>
        </div>
    );
  };


  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Create New Course</h1>
      
      {/* Since Firebase auth is removed, isAuthReady is always true */}
      {isAuthReady ? (
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-8">
        
        {/* Course Details Card (Unchanged) */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Basic Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input id="title" name="title" required placeholder="e.g., Introduction to Next.js" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required placeholder="A brief overview of the course content." rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Video Upload and Notes Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Video Upload Component */}
            <div className="grid gap-2">
                <Label className='flex items-center space-x-2'>
                    <Video className="h-4 w-4 text-primary" /> 
                    <span>Course Video File Upload</span>
                </Label>
                <VideoUploadArea />
                {/* The VideoUploadArea manages the file in state, which is then added in handleSubmit */}
            </div>

            {/* Rich Text Notes Input (Unchanged) */}
            <div className="grid gap-2">
                <Label htmlFor="notes" className='flex items-center space-x-2'>
                    <FileText className="h-4 w-4 text-indigo-600" /> 
                    <span>Detailed Course Notes (HTML Rich Text)</span>
                </Label>
                <RichTextEditor 
                    name="notes" 
                    placeholder="Enter detailed notes, summaries, or transcripts here. Text will appear formatted immediately." 
                />
            </div>
          </CardContent>
        </Card>

        {/* Publishing Options Section (Unchanged) */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              onValueChange={(value: 'draft' | 'publish' | 'schedule') => setPublishOption(value)} 
              defaultValue="draft" 
              className="flex flex-col space-y-2"
            >
              <Label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-600 transition-colors">
                <RadioGroupItem value="draft" id="draft" />
                <div className='flex items-center space-x-2'>
                  <Save className="h-4 w-4 text-gray-500" />
                  <span>Save as Draft - Only visible to you.</span>
                </div>
              </Label>

              <Label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-600 transition-colors">
                <RadioGroupItem value="publish" id="publish" />
                <div className='flex items-center space-x-2'>
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span>Publish Now - Immediately visible to students.</span>
                </div>
              </Label>
              
              <Label className="flex items-center space-x-2 p-3 border rounded-md cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-600 transition-colors">
                <RadioGroupItem value="schedule" id="schedule" />
                <div className='flex items-center space-x-2'>
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Set Timer (Schedule) - Visible at a future date/time.</span>
                </div>
              </Label>
            </RadioGroup>

            {/* Conditional Input for Scheduling */}
            {publishOption === 'schedule' && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <Label htmlFor="scheduledDate">Schedule Publish Date/Time</Label>
                <Input 
                  id="scheduledDate" 
                  name="scheduledDate" 
                  type="datetime-local" 
                  required 
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
            type="submit" 
            className="w-full" 
            disabled={!videoUploadState.file} // Disable if no file is selected
        >
          {publishOption === 'draft' ? 'Save Draft' :
            publishOption === 'publish' ? 'Publish Course' :
            'Schedule Publication'
          }
        </Button>
      </form>
      ) : (
        <div className="text-center p-10 text-gray-500">Loading editor and authentication...</div>
      )}
    </div>
  )
}