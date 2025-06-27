import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/common/Navigation';
import AppRoutes from '@/routes/AppRoutes';
import RouteDebugger from '@/components/debug/RouteDebugger';
import GitHubIcon from '@/icons/GitHubIcon';
import ArrowUpIcon from '@/icons/ArrowUpIcon';
import ArrowDownIcon from '@/icons/ArrowDownIcon';
import QuestionIcon from '@/icons/QuestionIcon';
import BookIcon from '@/icons/BookIcon';

/**
 * Layout principal de la aplicación con React Router
 */
const AppLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // --- Scroll Navigation Functions ---
  const handleScrollToTop = () => {
    // Check if we're in the quiz tab and have answered questions
    if (currentPath === '/quiz') {
      const answeredQuestions = findAnsweredQuestions();
      if (answeredQuestions.length > 0) {
        scrollToPreviousAnsweredQuestion();
        return;
      }
    }
    // Fall back to scrolling to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToBottom = () => {
    // Check if we're in the quiz tab and have answered questions
    if (currentPath === '/quiz') {
      const answeredQuestions = findAnsweredQuestions();
      if (answeredQuestions.length > 0) {
        scrollToNextAnsweredQuestion();
        return;
      }
    }
    // Fall back to scrolling to bottom
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // Helper function to find answered questions
  const findAnsweredQuestions = () => {
    const questionElements = document.querySelectorAll('[data-question-index]');
    const answeredElements = Array.from(questionElements).filter(el => {
      // Check the data-answered attribute
      return el.getAttribute('data-answered') === 'true';
    });
    return answeredElements;
  };

  // Helper function to scroll to the next answered question
  const scrollToNextAnsweredQuestion = () => {
    const answeredQuestions = findAnsweredQuestions();
    if (answeredQuestions.length === 0) return;

    const currentScrollY = window.scrollY;
    const viewportMiddle = currentScrollY + window.innerHeight / 2;
    
    // Find the next question that's below the current viewport middle
    const nextQuestion = answeredQuestions.find(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + currentScrollY;
      return elementTop > viewportMiddle + 50; // 50px buffer
    });

    if (nextQuestion) {
      nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If no next question found, wrap to the first answered question
      answeredQuestions[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper function to scroll to the previous answered question
  const scrollToPreviousAnsweredQuestion = () => {
    const answeredQuestions = findAnsweredQuestions();
    if (answeredQuestions.length === 0) return;

    const currentScrollY = window.scrollY;
    const viewportTop = currentScrollY;
    
    // Find the previous question that's above the current viewport top with a larger buffer
    const reversedQuestions = [...answeredQuestions].reverse();
    const prevQuestion = reversedQuestions.find(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + currentScrollY;
      return elementTop < viewportTop - 100; // 100px buffer
    });

    if (prevQuestion) {
      prevQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If no previous question found, wrap to the last answered question
      answeredQuestions[answeredQuestions.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToFirstUnanswered = () => {
    // Find all question elements
    const questionElements = document.querySelectorAll('[data-question-index]');
    
    // Find the first unanswered question
    const firstUnanswered = Array.from(questionElements).find(el => {
      return el.getAttribute('data-answered') !== 'true';
    });

    if (firstUnanswered) {
      firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If all questions are answered, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-100 font-sans min-h-screen relative">
      {/* Formas decorativas */}
      <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animation-delay-2000"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animation-delay-4000"></div>
      
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

          {/* Navigation */}
          <Navigation />

          {/* Main Content */}
          <div className="mt-6">
            <AppRoutes />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-1">Desarrollado con ❤️ para ayudarte a estudiar</p>
          <p>© {new Date().getFullYear()} Study Builder</p>
        </footer>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2 z-50">
        {/* Scroll to Top/Previous */}
        <button
          onClick={handleScrollToTop}
          className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
          title={currentPath === '/quiz' ? "Pregunta respondida anterior (o ir arriba)" : "Ir arriba del todo"}
        >
          <ArrowUpIcon className="w-5 h-5" />
        </button>

        {/* Scroll to first unanswered (only in quiz) */}
        {currentPath === '/quiz' && (
          <button
            onClick={scrollToFirstUnanswered}
            className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150"
            title="Primera pregunta sin contestar"
          >
            <QuestionIcon className="w-5 h-5" />
          </button>
        )}

        {/* Scroll to Bottom/Next */}
        <button
          onClick={handleScrollToBottom}
          className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
          title={currentPath === '/quiz' ? "Siguiente pregunta respondida (o ir abajo)" : "Ir abajo del todo"}
        >
          <ArrowDownIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Route Debugger - Solo en desarrollo */}
      <RouteDebugger />
    </div>
  );
};

export default AppLayout;
