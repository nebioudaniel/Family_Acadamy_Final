"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'
import { createCourse } from '../_actions/course.actions'
import { Save, Clock, BookOpen, Video, FileText, Bold, Italic, Underline, List, Heading, Link, Pilcrow, UploadCloud, CheckCircle, XCircle, LucideIcon, Type, Minus, Check, ChevronsUpDown } from 'lucide-react'

// Assuming these are available from your components directory
// Make sure you have these installed: npx shadcn-ui@latest add popover command button
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils" 

// Define the structure for Combobox options
type ComboboxOption = {
    value: string; // The value passed to document.execCommand
    label: string;
};

// --- Combobox Toolbar Component (Corrected) ---
const ToolbarCombobox = ({ options, placeholder, command, applyFormatting }: { 
    options: ComboboxOption[]; 
    placeholder: string; 
    command: string; 
    // 🌟 CORRECTED: Now accepting applyFormatting from the parent
    applyFormatting: (command: string, value: string | undefined) => void; 
}) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    const selectedLabel = options.find((option) => option.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[120px] justify-between h-8 text-sm px-2 hover:bg-gray-100"
                    title={placeholder}
                >
                    {value
                        ? selectedLabel || placeholder
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        // 🌟 CORRECTED: Use the passed applyFormatting function
                                        applyFormatting(command, option.value); 
                                        
                                        setValue(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// --- RichTextEditor component continues ---
const RichTextEditor = ({ name, placeholder }: { name: string, placeholder: string }) => {
    const [content, setContent] = useState('');
    // The main reference to the editable content area
    const contentRef = useRef<HTMLDivElement>(null); 
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const selectionRangeRef = useRef<Range | null>(null);
    
    // State to track all active formatting for visual feedback
    const [currentStyle, setCurrentStyle] = useState({ 
        isBold: false, 
        isItalic: false, 
        isUnderline: false,
        isList: false,
    });

    // Font Data Definitions
    const FONT_SIZES: ComboboxOption[] = [
        { label: 'Small', value: '1' },
        { label: 'Normal', value: '3' }, 
        { label: 'Large', value: '5' },
        { label: 'Huge', value: '7' },
    ];
    
    const FONT_FAMILIES: ComboboxOption[] = [
        { label: 'Sans-Serif', value: 'Arial, sans-serif' },
        { label: 'Serif', value: 'Times New Roman, serif' },
        { label: 'Monospace', value: 'Courier New, monospace' },
    ];


    // Handler to update state on input events (Unchanged)
    const handleInput = useCallback(() => {
        const htmlContent = contentRef.current?.innerHTML || '';
        setContent(htmlContent);
    }, []);
    
    // Logic to apply formatting (Unchanged)
    // 🌟 NOTE: This function must be defined here so we can pass it to ToolbarCombobox
    const applyFormatting = useCallback((command: string, value: string | undefined = undefined) => {
        // 🌟 CRITICAL FIX: Ensure focus is explicitly set before running execCommand
        // This makes sure the command is applied to the selected area.
        if (contentRef.current) {
            contentRef.current.focus();
        }
        document.execCommand(command, false, value);
        handleInput();
        updateStyleState();
    }, [handleInput]); // Added handleInput as dependency
    
    // Function to check the style of the current selection (Unchanged)
    const updateStyleState = useCallback(() => {
        if (!document.queryCommandSupported('bold')) return;
        const isBold = document.queryCommandState('bold');
        const isItalic = document.queryCommandState('italic');
        const isUnderline = document.queryCommandState('underline');
        const isList = document.queryCommandState('insertUnorderedList');
        setCurrentStyle({ isBold, isItalic, isUnderline, isList });
    }, []);

    // Add event listeners to update the style state (Unchanged)
    useEffect(() => {
        const editorElement = contentRef.current;
        const handleSelectionChangeOrMouseUp = () => {
            requestAnimationFrame(updateStyleState);
        };

        if (editorElement) {
            document.addEventListener('selectionchange', handleSelectionChangeOrMouseUp);
            editorElement.addEventListener('mouseup', handleSelectionChangeOrMouseUp);
            editorElement.addEventListener('keyup', handleSelectionChangeOrMouseUp);
        }
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChangeOrMouseUp);
            if (editorElement) {
                editorElement.removeEventListener('mouseup', handleSelectionChangeOrMouseUp);
                editorElement.removeEventListener('keyup', handleSelectionChangeOrMouseUp);
            }
        };
    }, [updateStyleState]);

    // Link handlers (Unchanged)
    const handleLinkClick = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selectionRangeRef.current = selection.getRangeAt(0);
            const selectedText = selection.toString();
            setLinkText(selectedText);
            setIsLinkDialogOpen(true);
        } else {
            setIsLinkDialogOpen(true);
        }
    };

    const handleApplyLink = () => {
        if (linkUrl.trim() === '') {
            toast.error("URL cannot be empty.");
            return;
        }

        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

        if (selectionRangeRef.current) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(selectionRangeRef.current);
            }
        } else if (linkText.trim() !== '') {
            document.execCommand('insertText', false, linkText);
        }

        applyFormatting('createLink', url);
        setIsLinkDialogOpen(false);
        setLinkUrl('');
        setLinkText('');
        selectionRangeRef.current = null;
    };

    // Initialize contentEditable (Unchanged)
    useEffect(() => {
        if (contentRef.current && !contentRef.current.innerHTML) {
            contentRef.current.innerHTML = '';
        }
    }, []);

    // Toolbar Button Component (Unchanged)
    const ToolbarButton = ({ icon: Icon, onClick, title, isActive = false }: { icon: LucideIcon, onClick: () => void, title: string, isActive?: boolean }) => (
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={onClick} 
            title={title}
            className={`h-8 w-8 transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'text-gray-700 hover:bg-gray-100'}`}
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

                {/* Functional Toolbar (Modified) */}
                <div className="flex items-center p-2 border-b bg-white rounded-t-lg flex-wrap gap-y-1">
                    
                    {/* Font Selection Controls - SHADCN COMBOBOX */}
                    <div className='flex items-center space-x-1 border-r pr-2 mr-2'>
                        {/* 🌟 PASSING applyFormatting */}
                        <ToolbarCombobox 
                            options={FONT_FAMILIES} 
                            placeholder="Font" 
                            command="fontName" 
                            applyFormatting={applyFormatting}
                        />
                        {/* 🌟 PASSING applyFormatting */}
                        <ToolbarCombobox 
                            options={FONT_SIZES} 
                            placeholder="Size" 
                            command="fontSize" 
                            applyFormatting={applyFormatting}
                        />
                    </div>

                    {/* Inline Formatting controls */}
                    <div className='flex items-center space-x-1 border-r pr-2 mr-2'>
                        <ToolbarButton icon={Bold} onClick={() => applyFormatting('bold')} title="Bold (Ctrl+B)" isActive={currentStyle.isBold} />
                        <ToolbarButton icon={Italic} onClick={() => applyFormatting('italic')} title="Italic (Ctrl+I)" isActive={currentStyle.isItalic} />
                        <ToolbarButton icon={Underline} onClick={() => applyFormatting('underline')} title="Underline (Ctrl+U)" isActive={currentStyle.isUnderline} /> 
                        <ToolbarButton icon={Minus} onClick={() => applyFormatting('strikethrough')} title="Strikethrough" />
                    </div>

                    {/* Block Formatting controls */}
                    <div className='flex items-center space-x-1 border-r pr-2 mr-2'>
                        <ToolbarButton icon={Heading} onClick={() => applyFormatting('formatBlock', '<h2>')} title="Heading 2" />
                        <ToolbarButton icon={List} onClick={() => applyFormatting('insertUnorderedList')} title="Bullet List" isActive={currentStyle.isList} />
                        <ToolbarButton icon={Link} onClick={handleLinkClick} title="Insert Link" />
                    </div>
                    
                    {/* Misc Controls (Simulated or simple) */}
                    <div className='flex items-center space-x-1'>
                        <ToolbarButton icon={Pilcrow} onClick={() => applyFormatting('insertParagraph')} title="New Paragraph" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-gray-100 transition-colors" title="Text Color (Simulated)">
                            <Type className="h-4 w-4" style={{ strokeWidth: 3 }} />
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


// --- Course Creation Page (Unchanged) ---
export default function CreateCoursePage() {
  const router = useRouter() 
  const [publishOption, setPublishOption] = useState<'draft' | 'publish' | 'schedule'>('draft')

  const [videoUploadState, setVideoUploadState] = useState<{
    file: File | null;
    progress: number;
    url: string | null;
    error: string | null;
  }>({ file: null, progress: 0, url: null, error: null });

  const isAuthReady = true;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
        setVideoUploadState(prev => ({ ...prev, error: "File must be a video." }));
        toast.error("File must be a video type.");
        return;
    }

    const localURL = URL.createObjectURL(file);
    
    setVideoUploadState({ 
        file, 
        progress: 100,
        url: localURL, 
        error: null 
    });
    toast.success("Video file selected and ready for submission.");
  };

  const handleSubmit = async (formData: FormData) => {
    
    if (!videoUploadState.file) {
        toast.error("Please select a course video file.");
        return;
    }

    formData.append('videoFile', videoUploadState.file);
    formData.delete('videoUrl'); 
    formData.append('statusChoice', publishOption);
    
    if (publishOption === 'schedule' && !formData.get('scheduledDate')) {
        toast.error("Please select a scheduled date.");
        return;
    }
    
    const result = await createCourse(formData) 
    
    if (result.success) {
      toast.success(result.message)
      router.push('/teacher/courses')
    } else {
      toast.error(result.message)
    }
  }

  const VideoUploadArea = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { file, progress, url, error } = videoUploadState;
    const isReady = file && progress === 100;

    const MAX_FILE_SIZE_MB = 2560; 
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const handleVideoFile = (selectedFile: File) => {
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            const sizeError = `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB (${(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB). Please select a file smaller than 2.5 GB.`;
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
         fileInputRef.current?.click();
    };

    let content;

    if (isReady && url && file) {
        content = (
            <div className="flex flex-col w-full">
                <div className="relative w-full h-auto rounded-lg overflow-hidden bg-black mb-4">
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
        content = (
            <div className="flex flex-col items-center p-6">
                <UploadCloud className="h-10 w-10 text-indigo-600 mb-3" />
                <p className="text-sm font-medium text-gray-700">Drag & drop your video file here</p>
                <p className="text-xs text-gray-500 mt-1">or click to browse (MP4, MOV)</p>
                <p className="text-xs text-gray-500 mt-1">Max file size: {MAX_FILE_SIZE_MB}MB ({ (MAX_FILE_SIZE_MB / 1024).toFixed(1)} GB)</p>
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
            className={`border-2 border-dashed ${error ? 'border-red-400 bg-red-50/50' : isReady ? 'border-green-400' : 'border-gray-300'} rounded-lg p-4 transition-colors bg-white/70 flex justify-center items-center ${isReady ? 'min-h-auto' : 'min-h-[200px]'} cursor-pointer `}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={!isReady && !error ? handleClick : undefined}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                accept="video/*" 
                onChange={handleFileChange}
                className="hidden"
            />
            <div className='w-full'>
                {content}
            </div>
        </div>
    );
  };


  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Create New Course</h1>
      
      {isAuthReady ? (
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-8">
        
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid gap-2">
                <Label className='flex items-center space-x-2'>
                    <Video className="h-4 w-4 text-primary" /> 
                    <span>Course Video File Upload</span>
                </Label>
                <VideoUploadArea />
            </div>

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
            disabled={!videoUploadState.file}
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