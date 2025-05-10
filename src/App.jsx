import React, { useState } from 'react';
import { useStudySets } from './contexts/useStudySets'; // Corrected import path
import QuizTab from './tabs/QuizTab';
import EditorTab from './tabs/EditorTab';
import HelpTab from './tabs/HelpTab';
import FlashcardTab from './tabs/FlashcardTab';
import GitHubIcon from './icons/GitHubIcon';
import BookIcon from './icons/BookIcon';
import QuizIcon from './icons/QuizIcon';
import CardIcon from './icons/CardIcon';
import EditIcon from './icons/EditIcon';
import HelpIcon from './icons/HelpIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import QuestionIcon from './icons/QuestionIcon';

// --- Main App Component ---
function App() {
    // State for active UI tab ('quiz', 'flashcards', 'editor', 'explanation')
    const [activeUITab, setActiveUITab] = useState('quiz');

    // --- Use StudySetContext ---
    const {
        editorContentType, // Get editorContentType from the hook
        setEditorContentType,
        isLoading
    } = useStudySets();

    // --- Scroll Navigation Functions ---
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleScrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    // --- Tab Configuration ---
    const uiTabs = [
        { id: 'quiz', label: 'Cuestionario', icon: <QuizIcon /> },
        { id: 'flashcards', label: 'Flashcards', icon: <CardIcon /> },
        { id: 'editor', label: 'Editor de Sets', icon: <EditIcon /> },
        { id: 'explanation', label: 'Ayuda', icon: <HelpIcon /> },
    ];

    // Render loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                <div className="animate-pulse flex flex-col items-center p-8">
                    <BookIcon />
                    <p className="mt-4 text-lg text-indigo-800 font-medium">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 font-sans min-h-screen relative">
            {/* Formas decorativas */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            
            {/* Contenedor principal con padding */}
            <div className="relative z-10 px-4 md:px-8 py-8 md:py-12">
                {/* GitHub Link - Improved */}
                <a
                    href="https://github.com/Joacohbc/study-builder"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver Repositorio en GitHub"
                    className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:shadow-xl transition-all duration-300 z-20"
                    aria-label="GitHub Repository"
                >
                    <GitHubIcon />
                </a>

                {/* Centered content card */}
                <div className="max-w-5xl mx-auto bg-white bg-opacity-95 p-6 md:p-8 rounded-xl shadow-2xl card animate-fade-in">
                    {/* App Title - Enhanced */}
                    <div className="mb-8 text-center">
                        <div className="flex justify-center mb-2">
                            <BookIcon />
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                            Study Builder
                        </h1>
                        <p className="text-gray-600 mt-2">Tu herramienta de estudio personalizada</p>
                    </div>

                    {/* Tab Navigation Area - Enhanced */}
                    <div className="mb-8">
                        {/* Tab Buttons - Responsive and Modern */}
                        <div className="flex flex-wrap border-b border-gray-200 mb-6">
                            {uiTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveUITab(tab.id)}
                                    className={`flex items-center py-3 px-4 md:px-6 text-sm md:text-base cursor-pointer font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 border-b-2 mr-1 md:mr-2
                                        ${activeUITab === tab.id
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
                                        }`}
                                >
                                    <span className="mr-2 opacity-75">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Area - With Transitions */}
                        <div className="mt-6 tab-transition">
                            {/* Conditionally render the content based on the active tab */}
                            {activeUITab === 'quiz' && (
                                <div className="animate-fade-in">
                                    <QuizTab
                                        onQuizComplete={(results) => console.log("Quiz Completed:", results)}
                                    />
                                </div>
                            )}
                            {activeUITab === 'flashcards' && (
                                <div className="animate-fade-in">
                                    <FlashcardTab />
                                </div>
                            )}
                            {activeUITab === 'editor' && (
                                <div className="animate-fade-in">
                                    {/* Radio buttons to select editor type - Styled */}
                                    <div className="mb-6 flex flex-wrap items-center gap-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                                        <span className="font-medium text-gray-700">Editar tipo de set:</span>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-shadow duration-200">
                                                <input
                                                    type="radio"
                                                    name="editorType"
                                                    value="quiz"
                                                    checked={editorContentType === 'quiz'} // Use the variable from the hook
                                                    onChange={() => setEditorContentType('quiz')}
                                                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                />
                                                <span className="flex items-center gap-1">
                                                    <QuizIcon />
                                                    <span>Cuestionarios</span>
                                                </span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-md shadow-sm hover:shadow transition-shadow duration-200">
                                                <input
                                                    type="radio"
                                                    name="editorType"
                                                    value="flashcard"
                                                    checked={editorContentType === 'flashcard'} // Use the variable from the hook
                                                    onChange={() => setEditorContentType('flashcard')}
                                                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                />
                                                <span className="flex items-center gap-1">
                                                    <CardIcon />
                                                    <span>Flashcards</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <EditorTab />
                                </div>
                            )}
                            {activeUITab === 'explanation' && (
                                <div className="animate-fade-in">
                                    <HelpTab />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <footer className="mt-8 text-center text-sm text-gray-500">
                    <p className="mb-1">Desarrollado con ❤️ para ayudarte a estudiar</p>
                    <p>© {new Date().getFullYear()} Study Builder</p>
                </footer>
            </div>

            {/* Scroll Navigation Buttons - Fixed Position */}
            <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
                <button
                    type="button"
                    onClick={handleScrollToTop}
                    className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
                    title="Ir arriba del todo"
                >
                    <ArrowUpIcon className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={handleScrollToBottom}
                    className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
                    title="Ir abajo del todo"
                >
                    <ArrowDownIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default App;
